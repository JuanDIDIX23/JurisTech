-- =============================================
-- Migración 004 — Fase 2: afiliados, solicitudes, documentos y tokens
-- Incluye los 3 fixes críticos y los 4 ajustes menores revisados.
-- =============================================

-- =============================================
-- TABLA: planes de afiliación
-- =============================================
CREATE TABLE planes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  tokens_incluidos INTEGER NOT NULL DEFAULT 0,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO planes (nombre, tokens_incluidos, descripcion) VALUES
  ('Afiliado Básico', 100, 'Plan de entrada para pymes pequeñas'),
  ('Afiliado Empresarial', 300, 'Plan intermedio para pymes en crecimiento'),
  ('Afiliado Premium', 600, 'Plan completo para empresas consolidadas');

-- =============================================
-- TABLA: afiliados (extiende profiles)
-- MENOR 1: el saldo nunca puede quedar negativo.
-- =============================================
CREATE TABLE afiliados (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  plan_id UUID REFERENCES planes(id),
  tokens_disponibles INTEGER NOT NULL DEFAULT 0 CHECK (tokens_disponibles >= 0),
  tokens_consumidos INTEGER NOT NULL DEFAULT 0 CHECK (tokens_consumidos >= 0),
  fecha_inicio DATE DEFAULT CURRENT_DATE,
  fecha_renovacion DATE,
  estado TEXT DEFAULT 'activo'
    CHECK (estado IN ('activo','suspendido','cancelado')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER afiliados_updated_at
  BEFORE UPDATE ON afiliados FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================
-- TABLA: solicitudes (creadas por el afiliado)
-- =============================================
CREATE TABLE solicitudes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  afiliado_id UUID REFERENCES afiliados(id) ON DELETE CASCADE NOT NULL,
  codigo TEXT UNIQUE,
  tipo TEXT NOT NULL
    CHECK (tipo IN (
      'consulta_laboral',
      'revision_contrato',
      'elaboracion_contrato',
      'concepto_seguridad_social',
      'acompanamiento_preventivo',
      'revision_acuerdo_comercial',
      'otro'
    )),
  descripcion TEXT NOT NULL,
  tokens_estimados INTEGER,
  tokens_consumidos INTEGER DEFAULT 0,
  estado TEXT DEFAULT 'recibida'
    CHECK (estado IN (
      'recibida','en_revision','en_proceso','entregada','cerrada','cancelada'
    )),
  prioridad TEXT DEFAULT 'normal'
    CHECK (prioridad IN ('normal','urgente')),
  asignado_a TEXT,
  notas_admin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FIX 2 — Correlativo de códigos JT-AAAA-NNNN
--
-- La versión con SELECT COUNT(*) tenía tres fallos:
--   a) sin SECURITY DEFINER, el COUNT se ejecutaba bajo el RLS del afiliado
--      y solo veía SUS solicitudes, así que el segundo afiliado del sistema
--      generaba un código repetido y violaba la restricción UNIQUE;
--   b) dos inserciones simultáneas leían el mismo COUNT;
--   c) borrar una solicitud hacía que el siguiente código se reutilizara.
--
-- El contador dedicado resuelve los tres: INSERT ... ON CONFLICT DO UPDATE
-- toma un bloqueo de fila, de modo que las transacciones concurrentes se
-- serializan y el número nunca retrocede.
-- =============================================
CREATE TABLE solicitudes_correlativo (
  anio INTEGER PRIMARY KEY,
  ultimo INTEGER NOT NULL DEFAULT 0
);

-- Tabla interna: no se expone por la API. El trigger la escribe como owner.
ALTER TABLE solicitudes_correlativo ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON solicitudes_correlativo FROM anon, authenticated;

CREATE OR REPLACE FUNCTION generar_codigo_solicitud()
RETURNS TRIGGER AS $$
DECLARE
  v_anio INTEGER := EXTRACT(YEAR FROM NOW())::INTEGER;
  v_num INTEGER;
BEGIN
  INSERT INTO solicitudes_correlativo (anio, ultimo)
  VALUES (v_anio, 1)
  ON CONFLICT (anio)
  DO UPDATE SET ultimo = solicitudes_correlativo.ultimo + 1
  RETURNING ultimo INTO v_num;

  NEW.codigo := 'JT-' || v_anio || '-' || LPAD(v_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER solicitudes_codigo
  BEFORE INSERT ON solicitudes
  FOR EACH ROW EXECUTE FUNCTION generar_codigo_solicitud();

CREATE TRIGGER solicitudes_updated_at
  BEFORE UPDATE ON solicitudes FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================
-- TABLA: documentos (subidos por el admin)
-- MENOR 4: tamano_bytes sin eñe, para no arrastrar problemas de
-- codificación en clientes y herramientas externas.
-- =============================================
CREATE TABLE documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  afiliado_id UUID REFERENCES afiliados(id) ON DELETE CASCADE NOT NULL,
  solicitud_id UUID REFERENCES solicitudes(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  url TEXT NOT NULL,
  tipo_archivo TEXT,
  tamano_bytes INTEGER,
  subido_por UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: movimientos de tokens
-- =============================================
CREATE TABLE token_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  afiliado_id UUID REFERENCES afiliados(id) ON DELETE CASCADE NOT NULL,
  solicitud_id UUID REFERENCES solicitudes(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL
    CHECK (tipo IN ('recarga','consumo','reembolso','ajuste')),
  cantidad INTEGER NOT NULL,
  descripcion TEXT,
  realizado_por UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MENOR 3 — Índices de claves foráneas
-- Postgres no los crea automáticamente y son exactamente las consultas
-- que ejecuta el dashboard del afiliado en cada carga.
-- =============================================
CREATE INDEX idx_solicitudes_afiliado ON solicitudes (afiliado_id);
CREATE INDEX idx_documentos_afiliado ON documentos (afiliado_id);
CREATE INDEX idx_token_movements_afiliado ON token_movements (afiliado_id);
CREATE INDEX idx_documentos_solicitud ON documentos (solicitud_id);
CREATE INDEX idx_token_movements_solicitud ON token_movements (solicitud_id);
CREATE INDEX idx_afiliados_plan ON afiliados (plan_id);

-- =============================================
-- FIX 1 — Movimiento de tokens restringido a administradores
--
-- La función es SECURITY DEFINER, así que ignora el RLS. Sin la
-- comprobación de is_admin(), cualquier usuario autenticado podía llamarla
-- por RPC y asignarse los tokens que quisiera.
-- =============================================
CREATE OR REPLACE FUNCTION registrar_movimiento_tokens(
  p_afiliado_id UUID,
  p_tipo TEXT,
  p_cantidad INTEGER,
  p_descripcion TEXT DEFAULT NULL,
  p_solicitud_id UUID DEFAULT NULL,
  p_realizado_por UUID DEFAULT NULL
) RETURNS void AS $$
DECLARE
  v_disponibles INTEGER;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  -- 'ajuste' admite cantidades negativas (correcciones manuales);
  -- el resto siempre suma o resta una cantidad positiva.
  IF p_tipo <> 'ajuste' AND p_cantidad <= 0 THEN
    RAISE EXCEPTION 'La cantidad debe ser mayor que cero';
  END IF;

  IF p_tipo = 'consumo' THEN
    SELECT tokens_disponibles INTO v_disponibles
    FROM afiliados WHERE id = p_afiliado_id
    FOR UPDATE;

    IF v_disponibles IS NULL THEN
      RAISE EXCEPTION 'El afiliado no existe';
    END IF;

    IF v_disponibles < p_cantidad THEN
      RAISE EXCEPTION 'Saldo insuficiente: % disponibles, % solicitados',
        v_disponibles, p_cantidad;
    END IF;
  END IF;

  -- Insertar movimiento
  INSERT INTO token_movements
    (afiliado_id, solicitud_id, tipo, cantidad, descripcion, realizado_por)
  VALUES
    (p_afiliado_id, p_solicitud_id, p_tipo, p_cantidad, p_descripcion, p_realizado_por);

  -- Actualizar balance según tipo
  IF p_tipo = 'recarga' OR p_tipo = 'reembolso' OR p_tipo = 'ajuste' THEN
    UPDATE afiliados
    SET tokens_disponibles = tokens_disponibles + p_cantidad
    WHERE id = p_afiliado_id;
  ELSIF p_tipo = 'consumo' THEN
    UPDATE afiliados
    SET tokens_disponibles = tokens_disponibles - p_cantidad,
        tokens_consumidos = tokens_consumidos + p_cantidad
    WHERE id = p_afiliado_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Se retira el permiso implícito de PUBLIC y se concede solo a
-- authenticated: los administradores llaman la RPC desde el panel con esa
-- identidad, y el is_admin() de arriba es lo que rechaza a los afiliados.
REVOKE EXECUTE ON FUNCTION registrar_movimiento_tokens FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION registrar_movimiento_tokens TO authenticated;

-- =============================================
-- MENOR 2 — Permisos por columna en solicitudes
--
-- La policy solicitudes_own_insert solo valida afiliado_id, así que un
-- afiliado podía crear una solicitud ya marcada como 'entregada', fijar
-- tokens_estimados = 0 o escribir en notas_admin. Igual que con
-- profiles.rol, un REVOKE de columna no basta mientras exista el permiso
-- de tabla: primero se retira el INSERT completo y luego se conceden solo
-- las columnas que el afiliado sí debe rellenar.
-- =============================================
REVOKE INSERT ON solicitudes FROM anon, authenticated;
GRANT INSERT (afiliado_id, tipo, descripcion, prioridad)
  ON solicitudes TO authenticated;

-- =============================================
-- RLS para nuevas tablas
-- =============================================
ALTER TABLE planes ENABLE ROW LEVEL SECURITY;
ALTER TABLE afiliados ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_movements ENABLE ROW LEVEL SECURITY;

-- Planes: lectura pública, escritura solo admin
CREATE POLICY "planes_read_public" ON planes
  FOR SELECT USING (true);
CREATE POLICY "planes_admin_write" ON planes
  FOR ALL USING (is_admin());

-- Afiliados: cada uno ve solo el suyo, admin ve todos
CREATE POLICY "afiliados_own" ON afiliados
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "afiliados_admin_all" ON afiliados
  FOR ALL USING (is_admin());

-- Solicitudes: afiliado ve y crea las suyas, admin ve todas
CREATE POLICY "solicitudes_own_select" ON solicitudes
  FOR SELECT USING (
    afiliado_id = auth.uid() OR is_admin()
  );
CREATE POLICY "solicitudes_own_insert" ON solicitudes
  FOR INSERT WITH CHECK (afiliado_id = auth.uid());
CREATE POLICY "solicitudes_admin_update" ON solicitudes
  FOR UPDATE USING (is_admin());

-- Documentos: afiliado ve los suyos, admin gestiona todos
CREATE POLICY "documentos_own_select" ON documentos
  FOR SELECT USING (
    afiliado_id = auth.uid() OR is_admin()
  );
CREATE POLICY "documentos_admin_all" ON documentos
  FOR ALL USING (is_admin());

-- Token movements: afiliado ve los suyos, admin gestiona todos
CREATE POLICY "tokens_own_select" ON token_movements
  FOR SELECT USING (
    afiliado_id = auth.uid() OR is_admin()
  );
CREATE POLICY "tokens_admin_all" ON token_movements
  FOR ALL USING (is_admin());

-- =============================================
-- Actualizar vista admin_stats para incluir afiliados activos
-- =============================================
CREATE OR REPLACE VIEW admin_stats AS
SELECT
  (SELECT COUNT(*) FROM leads) AS total_leads,
  (SELECT COUNT(*) FROM leads WHERE estado = 'nuevo') AS leads_nuevos,
  (SELECT COUNT(*) FROM leads
    WHERE created_at > NOW() - INTERVAL '30 days') AS leads_mes,
  (SELECT COUNT(*) FROM citas) AS total_citas,
  (SELECT COUNT(*) FROM citas WHERE estado = 'pendiente') AS citas_pendientes,
  (SELECT COUNT(*) FROM citas WHERE fecha = CURRENT_DATE) AS citas_hoy,
  (SELECT COUNT(*) FROM citas
    WHERE fecha >= CURRENT_DATE
    AND fecha <= CURRENT_DATE + INTERVAL '7 days'
    AND estado != 'cancelada') AS citas_semana,
  (SELECT COUNT(*) FROM afiliados WHERE estado = 'activo') AS afiliados_activos,
  (SELECT COUNT(*) FROM solicitudes WHERE estado = 'recibida') AS solicitudes_nuevas,
  (SELECT COUNT(*) FROM solicitudes
    WHERE estado NOT IN ('cerrada','cancelada')) AS solicitudes_activas;

-- FIX 3 — Reaplicar las opciones de seguridad tras recrear la vista.
-- CREATE OR REPLACE VIEW puede descartar las reloptions y los permisos
-- ajustados en el schema inicial; sin estas tres líneas, admin_stats
-- volvería a ejecutarse con los permisos del propietario (saltándose el
-- RLS) y anon recuperaría el acceso a las métricas del negocio.
ALTER VIEW admin_stats SET (security_invoker = on);
REVOKE ALL ON admin_stats FROM anon;
GRANT SELECT ON admin_stats TO authenticated;
