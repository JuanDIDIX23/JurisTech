import { supabase } from '@shared/lib/supabase';
import type { Media, MediaSeccion } from '@shared/types/supabase';

// Fotos de la landing, editables desde /admin/media.
// `media_read_public` permite el SELECT sin sesión; la escritura queda
// restringida a admins por `media_admin_all`.

export interface MediaInput {
  seccion: MediaSeccion;
  url: string;
  alt?: string;
  orden?: number;
}

/** Fotos activas de una sección, en el orden configurado. */
export async function getMedia(seccion: MediaSeccion): Promise<Media[]> {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('seccion', seccion)
    .eq('activo', true)
    .order('orden', { ascending: true });

  if (error) throw new Error('No se pudieron cargar las imágenes.');
  return (data ?? []) as Media[];
}

/** Incluye también las inactivas: el panel las gestiona todas. */
export async function getMediaAdmin(seccion: MediaSeccion): Promise<Media[]> {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('seccion', seccion)
    .order('orden', { ascending: true });

  if (error) throw new Error('No se pudieron cargar las imágenes.');
  return (data ?? []) as Media[];
}

export async function agregarMedia(data: MediaInput): Promise<void> {
  const { error } = await supabase.from('media').insert({
    seccion: data.seccion,
    url: data.url.trim(),
    alt: data.alt?.trim() || null,
    orden: data.orden ?? 0,
  });

  if (error) throw new Error('No se pudo agregar la imagen.');
}

/** Bucket creado en la migración 007. */
const BUCKET = 'media';

/**
 * Ruta dentro del bucket a partir de una URL pública de Supabase Storage.
 * Formato: https://<ref>.supabase.co/storage/v1/object/public/media/<ruta>
 * Devuelve null si la URL es externa (Unsplash, etc.).
 */
function rutaEnStorage(url: string): string | null {
  const marca = `/storage/v1/object/public/${BUCKET}/`;
  const i = url.indexOf(marca);
  if (i === -1) return null;
  const ruta = url.slice(i + marca.length).split('?')[0];
  return ruta ? decodeURIComponent(ruta) : null;
}

/** Normaliza el nombre para que la ruta del bucket sea siempre segura. */
function nombreSeguro(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita las tildes ya separadas por NFD
    .replace(/[^a-zA-Z0-9.\-_]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

/**
 * Sube un archivo al bucket y devuelve su URL pública.
 * La ruta es `{seccion}/{timestamp}-{nombre}`: el timestamp evita colisiones
 * entre archivos con el mismo nombre sin necesidad de `upsert`.
 */
export async function subirImagen(seccion: MediaSeccion, archivo: File): Promise<string> {
  const ruta = `${seccion}/${Date.now()}-${nombreSeguro(archivo.name)}`;

  const { error } = await supabase.storage.from(BUCKET).upload(ruta, archivo, {
    cacheControl: '3600',
    contentType: archivo.type || undefined,
    upsert: false,
  });

  if (error) {
    const mensaje = error.message.toLowerCase();
    if (mensaje.includes('bucket not found')) {
      throw new Error('El almacenamiento no está configurado. Ejecuta la migración 007.');
    }
    if (mensaje.includes('exceeded') || mensaje.includes('too large')) {
      throw new Error('La imagen supera el límite de 10 MB.');
    }
    if (mensaje.includes('mime') || mensaje.includes('not allowed')) {
      throw new Error('Formato no permitido. Usa JPG, PNG, WebP, AVIF o GIF.');
    }
    if (mensaje.includes('policy') || mensaje.includes('unauthorized')) {
      throw new Error('No tienes permisos para subir imágenes.');
    }
    throw new Error('No se pudo subir la imagen. Revisa tu conexión e inténtalo de nuevo.');
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(ruta);
  return data.publicUrl;
}

/**
 * Borra la fila y, si la imagen vivía en el bucket, también el archivo.
 * El borrado del archivo es best-effort: si falla, la fila ya no existe y
 * dejar un huérfano en Storage es preferible a bloquear la operación.
 */
export async function eliminarMedia(id: string, url?: string): Promise<void> {
  const { error } = await supabase.from('media').delete().eq('id', id);
  if (error) throw new Error('No se pudo eliminar la imagen.');

  const ruta = url ? rutaEnStorage(url) : null;
  if (ruta) {
    await supabase.storage.from(BUCKET).remove([ruta]);
  }
}

export async function actualizarOrden(id: string, orden: number): Promise<void> {
  const { error } = await supabase.from('media').update({ orden }).eq('id', id);
  if (error) throw new Error('No se pudo cambiar el orden.');
}
