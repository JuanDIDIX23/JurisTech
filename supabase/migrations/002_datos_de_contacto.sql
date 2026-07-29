-- =============================================
-- Migración 002 — datos de contacto reales
--
-- schema.sql sembró config.contacto con valores de ejemplo
-- (contacto@juristech.co / 57300000000). Esta migración los reemplaza por
-- los definitivos, que es lo que la landing lee en tiempo de ejecución
-- (useContactConfig) y lo que el panel admin editará en el Bloque D.
--
-- Ejecutar en el SQL editor de Supabase.
-- =============================================

UPDATE config
SET value = '{
  "email": "contacto@juristechlawyers.com",
  "whatsapp": "573219761348"
}'::jsonb
WHERE key = 'contacto';
