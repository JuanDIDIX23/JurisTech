-- =============================================
-- JurisTech — schema inicial
-- Incluye los 5 fixes de seguridad revisados antes de la ejecución.
-- =============================================

-- =============================================
-- TABLA: perfiles de usuario
-- =============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  rol TEXT NOT NULL DEFAULT 'afiliado' CHECK (rol IN ('admin', 'afiliado')),
  nombre TEXT,
  empresa TEXT,
  telefono TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FIX 2 — Escalada de privilegios: nadie puede cambiar su propio rol.
-- Supabase concede UPDATE a nivel de TABLA a anon/authenticated mediante
-- default privileges. Un REVOKE UPDATE (rol) no surte efecto mientras ese
-- permiso de tabla siga vigente, así que primero se revoca el UPDATE completo
-- y luego se conceden solo las columnas que el afiliado sí puede editar.
REVOKE UPDATE ON profiles FROM anon, authenticated;
GRANT UPDATE (nombre, empresa, telefono) ON profiles TO authenticated;

-- =============================================
-- TABLA: leads (formulario de contacto público)
-- =============================================
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  empresa TEXT,
  telefono TEXT NOT NULL,
  correo TEXT,
  servicio TEXT NOT NULL,
  mensaje TEXT,
  estado TEXT DEFAULT 'nuevo'
    CHECK (estado IN ('nuevo','contactado','en_proceso','cerrado','descartado')),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: citas (modal de agendamiento público)
-- =============================================
CREATE TABLE citas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  empresa TEXT,
  telefono TEXT NOT NULL,
  correo TEXT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  motivo TEXT,
  estado TEXT DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente','confirmada','cancelada','completada')),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Una sola cita activa por franja (ver migración 003).
CREATE UNIQUE INDEX IF NOT EXISTS unique_slot
  ON citas (fecha, hora)
  WHERE estado <> 'cancelada';

-- =============================================
-- TABLA: configuración del sistema (editable desde admin)
-- =============================================
CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Valores iniciales de config
INSERT INTO config (key, value) VALUES
  ('schedule', '{
    "availableDays": [1,2,3,4,5],
    "startHour": 8,
    "endHour": 17,
    "slotDuration": 60,
    "advanceDays": 1,
    "maxDays": 30,
    "timezone": "America/Bogota"
  }'::jsonb),
  ('contacto', '{
    "email": "contacto@juristechlawyers.com",
    "whatsapp": "573219761348"
  }'::jsonb);

-- =============================================
-- TRIGGERS para updated_at automático
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER citas_updated_at
  BEFORE UPDATE ON citas FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-crear perfil al registrar usuario
-- FIX 5 — SECURITY DEFINER con search_path fijado.
-- El rol se fija siempre a 'afiliado': nunca se lee del metadata, para que
-- nadie pueda registrarse como admin manipulando la petición de signUp.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, rol, nombre, empresa, telefono)
  VALUES (
    NEW.id,
    'afiliado',
    NULLIF(NEW.raw_user_meta_data->>'nombre', ''),
    NULLIF(NEW.raw_user_meta_data->>'empresa', ''),
    NULLIF(NEW.raw_user_meta_data->>'telefono', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- FIX 1 — Comprobación de admin sin recursión de RLS
-- SECURITY DEFINER: se ejecuta como owner y no reevalúa las policies de
-- profiles, evitando el error 42P17 (infinite recursion detected in policy).
-- =============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND rol = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- =============================================
-- FIX 3 — Horas ocupadas sin exponer datos personales
-- Devuelve únicamente las horas de una fecha. Los datos del solicitante
-- (nombre, teléfono, correo, motivo) nunca salen de la base.
-- =============================================
CREATE OR REPLACE FUNCTION horas_ocupadas(fecha_consulta DATE)
RETURNS TABLE(hora TIME) AS $$
  SELECT c.hora FROM citas c
  WHERE c.fecha = fecha_consulta
  AND c.estado != 'cancelada';
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- Leads: insertar sin autenticar (formulario público)
CREATE POLICY "leads_insert_public" ON leads
  FOR INSERT WITH CHECK (true);

-- Leads: leer y modificar solo admins
CREATE POLICY "leads_admin_all" ON leads
  FOR ALL USING (is_admin());

-- Citas: insertar sin autenticar (modal público)
CREATE POLICY "citas_insert_public" ON citas
  FOR INSERT WITH CHECK (true);

-- Citas: leer solo admins (el público usa la RPC horas_ocupadas)
CREATE POLICY "citas_admin_select" ON citas
  FOR SELECT USING (is_admin());

-- Citas: modificar solo admins
CREATE POLICY "citas_admin_update" ON citas
  FOR UPDATE USING (is_admin());

-- Config: leer sin autenticar (schedule para el modal)
CREATE POLICY "config_read_public" ON config
  FOR SELECT USING (true);

-- Config: modificar solo admins
CREATE POLICY "config_admin_update" ON config
  FOR UPDATE USING (is_admin());

-- Profiles: cada usuario ve y edita solo el suyo
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Admins ven todos los perfiles
CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (is_admin());

-- =============================================
-- VISTA: estadísticas para el dashboard admin
-- =============================================
CREATE VIEW admin_stats AS
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
    AND estado != 'cancelada') AS citas_semana;

-- FIX 4 — La vista respeta el RLS de las tablas base y no es legible por anon.
ALTER VIEW admin_stats SET (security_invoker = on);
REVOKE ALL ON admin_stats FROM anon;
GRANT SELECT ON admin_stats TO authenticated;
