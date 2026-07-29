-- =============================================
-- Migración 001 — handle_new_user copia nombre/empresa/telefono
--
-- Motivo: con la confirmación por correo activada (valor por defecto en
-- Supabase), signUp() no devuelve sesión. Sin sesión, auth.uid() es NULL y
-- el UPDATE de profiles desde el cliente es bloqueado por RLS, así que el
-- perfil quedaba sin nombre, empresa ni teléfono.
--
-- Solución: RegisterPage envía esos datos como metadata en signUp() y el
-- trigger los copia a profiles en el momento de crear el usuario.
--
-- Ejecutar en el SQL editor de Supabase sobre la base ya desplegada.
-- (schema.sql ya incluye esta versión para despliegues nuevos.)
-- =============================================

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
