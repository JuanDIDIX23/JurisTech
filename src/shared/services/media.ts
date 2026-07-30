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

export async function eliminarMedia(id: string): Promise<void> {
  const { error } = await supabase.from('media').delete().eq('id', id);
  if (error) throw new Error('No se pudo eliminar la imagen.');
}

export async function actualizarOrden(id: string, orden: number): Promise<void> {
  const { error } = await supabase.from('media').update({ orden }).eq('id', id);
  if (error) throw new Error('No se pudo cambiar el orden.');
}
