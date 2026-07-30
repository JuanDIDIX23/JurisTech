-- =============================================
-- Migración 008 — Sección «aliados» en la tabla media
--
-- Amplía el CHECK de `media.seccion` para admitir los logos de las
-- empresas afiliadas, que se mostrarán en la landing entre la sección de
-- tokens y las preguntas frecuentes.
--
-- El nombre `media_seccion_check` es el que Postgres asigna
-- automáticamente a un CHECK declarado en línea sobre la columna
-- `seccion` (patrón {tabla}_{columna}_check), tal como se creó en la
-- migración 005. Si en tu base tuviera otro nombre, compruébalo con:
--
--   SELECT conname FROM pg_constraint
--   WHERE conrelid = 'media'::regclass AND contype = 'c';
--
-- Ejecutar en el SQL editor de Supabase.
-- =============================================

-- IF EXISTS permite reejecutar la migración sin que falle si el CHECK
-- anterior ya se había retirado.
ALTER TABLE media
DROP CONSTRAINT IF EXISTS media_seccion_check;

ALTER TABLE media
ADD CONSTRAINT media_seccion_check
CHECK (seccion IN ('hero', 'nosotros', 'aliados'));
