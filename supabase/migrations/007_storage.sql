-- =============================================
-- Migración 007 — Bucket de Storage para los medios de la landing
--
-- Permite subir las fotos desde el dispositivo en /admin/media en lugar
-- de depender de URLs externas. Las filas de `media` siguen guardando una
-- URL: la diferencia es que ahora puede apuntar a este bucket.
--
-- Ejecutar en el SQL editor de Supabase.
-- =============================================

-- Bucket público: la landing lee las imágenes sin sesión.
-- El límite de 10 MB y la lista de tipos evitan que una subida
-- accidental deje un archivo enorme o un ejecutable en el bucket.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  10485760,
  ARRAY['image/jpeg','image/png','image/webp','image/avif','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- Policies sobre storage.objects
--
-- storage.objects ya tiene RLS activo por defecto en Supabase; aquí solo
-- se añaden las reglas de este bucket. Las policies se limitan a
-- bucket_id = 'media' para no afectar a otros buckets del proyecto.
-- =============================================

-- Lectura pública
CREATE POLICY "media_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

-- Solo admins pueden subir
CREATE POLICY "media_admin_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media' AND is_admin()
  );

-- Solo admins pueden eliminar
CREATE POLICY "media_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'media' AND is_admin()
  );
