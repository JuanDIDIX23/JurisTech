-- =============================================
-- Migración 003 — una sola cita activa por franja
--
-- Evita que dos personas reserven la misma fecha+hora si envían el
-- formulario a la vez: la comprobación previa con horas_ocupadas() es
-- informativa y no protege frente a la carrera entre ambos INSERT.
--
-- Se usa un ÍNDICE ÚNICO PARCIAL en lugar de una restricción EXCLUDE.
-- Motivo: los índices únicos sí admiten cláusula WHERE, así que filtrar
-- las canceladas no requiere EXCLUDE. Además, EXCLUDE USING gist sobre
-- date/time necesitaría la extensión btree_gist (GIST no soporta el
-- operador `=` en tipos escalares por sí solo). Esta versión no necesita
-- extensiones y es la que Postgres puede usar de forma más eficiente.
--
-- Ejecutar en el SQL editor de Supabase.
-- =============================================

CREATE UNIQUE INDEX IF NOT EXISTS unique_slot
  ON citas (fecha, hora)
  WHERE estado <> 'cancelada';

-- -------------------------------------------------------------------
-- Alternativa con EXCLUDE, equivalente en efecto. Requiere btree_gist.
-- Solo si se necesitara ampliar a rangos horarios solapados:
--
-- CREATE EXTENSION IF NOT EXISTS btree_gist;
-- ALTER TABLE citas
--   ADD CONSTRAINT unique_slot
--   EXCLUDE USING gist (fecha WITH =, hora WITH =)
--   WHERE (estado <> 'cancelada');
-- -------------------------------------------------------------------
