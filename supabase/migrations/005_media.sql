-- =============================================
-- Migración 005 — Medios gestionables desde el panel
--
-- Sustituye las URLs de imágenes que estaban escritas en el código de la
-- landing (hero y "Nuestra historia") por filas editables desde /admin/media.
--
-- Ejecutar en el SQL editor de Supabase.
-- =============================================

CREATE TABLE media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seccion TEXT NOT NULL
    CHECK (seccion IN ('hero', 'nosotros')),
  url TEXT NOT NULL,
  alt TEXT,
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- La landing filtra por sección y ordena en cada carga.
CREATE INDEX idx_media_seccion_orden ON media (seccion, orden);

-- =============================================
-- RLS
-- =============================================
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Lectura pública (la landing necesita leer las fotos sin sesión)
CREATE POLICY "media_read_public" ON media
  FOR SELECT USING (true);

-- Solo admins pueden gestionar
CREATE POLICY "media_admin_all" ON media
  FOR ALL USING (is_admin());

-- =============================================
-- Fotos iniciales
--
-- TEMPORALES (Unsplash): evitan que el hero quede vacío en el primer
-- despliegue. Se sustituyen desde /admin/media por las fotos reales sin
-- volver a tocar el código ni la base.
-- =============================================
INSERT INTO media (seccion, url, alt, orden, activo) VALUES
  ('hero',
   'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1600',
   'Profesional jurídico revisando documentos', 1, true),
  ('hero',
   'https://images.unsplash.com/photo-1521791055366-0d553872952f?w=1600',
   'Apretón de manos profesional', 2, true),
  ('hero',
   'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600',
   'Firma de contrato en oficina', 3, true),
  ('hero',
   'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600',
   'Profesional de negocios formal', 4, true),
  ('nosotros',
   'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800',
   'Equipo JurisTech', 1, true);
