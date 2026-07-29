import { supabase } from '@shared/lib/supabase';
import type { AdminStats, Cita, CitaEstado, Lead, LeadEstado } from '@shared/types/supabase';

// Servicios del panel de administración. Todas estas consultas dependen de
// que el RLS reconozca al usuario como admin (is_admin()).

export interface LeadsFiltros {
  estado?: LeadEstado;
  servicio?: string;
  busqueda?: string;
}

export interface CitasFiltros {
  estado?: CitaEstado;
  /** YYYY-MM-DD */
  fechaDesde?: string;
  /** YYYY-MM-DD */
  fechaHasta?: string;
}

/** Escapa los comodines de PostgREST para que la búsqueda sea literal. */
function escaparBusqueda(texto: string): string {
  return texto.replace(/[%,()]/g, '');
}

export async function getLeads(filtros: LeadsFiltros = {}): Promise<Lead[]> {
  let query = supabase.from('leads').select('*').order('created_at', { ascending: false });

  if (filtros.estado) query = query.eq('estado', filtros.estado);
  if (filtros.servicio) query = query.eq('servicio', filtros.servicio);

  const busqueda = filtros.busqueda?.trim();
  if (busqueda) {
    const t = escaparBusqueda(busqueda);
    query = query.or(
      `nombre.ilike.%${t}%,empresa.ilike.%${t}%,correo.ilike.%${t}%,telefono.ilike.%${t}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw new Error('No se pudieron cargar los leads.');
  return (data ?? []) as Lead[];
}

export async function getCitas(filtros: CitasFiltros = {}): Promise<Cita[]> {
  let query = supabase
    .from('citas')
    .select('*')
    .order('fecha', { ascending: false })
    .order('hora', { ascending: true });

  if (filtros.estado) query = query.eq('estado', filtros.estado);
  if (filtros.fechaDesde) query = query.gte('fecha', filtros.fechaDesde);
  if (filtros.fechaHasta) query = query.lte('fecha', filtros.fechaHasta);

  const { data, error } = await query;
  if (error) throw new Error('No se pudieron cargar las citas.');
  return (data ?? []) as Cita[];
}

export async function getStats(): Promise<AdminStats> {
  const { data, error } = await supabase.from('admin_stats').select('*').maybeSingle();

  if (error || !data) throw new Error('No se pudieron cargar las estadísticas.');
  return data as AdminStats;
}

export async function updateLeadEstado(
  id: string,
  estado: LeadEstado,
  notas?: string,
): Promise<void> {
  const cambios: { estado: LeadEstado; notas?: string | null } = { estado };
  if (notas !== undefined) cambios.notas = notas.trim() || null;

  const { error } = await supabase.from('leads').update(cambios).eq('id', id);
  if (error) throw new Error('No se pudo actualizar el lead.');
}

export async function updateCitaEstado(
  id: string,
  estado: CitaEstado,
  notas?: string,
): Promise<void> {
  const cambios: { estado: CitaEstado; notas?: string | null } = { estado };
  if (notas !== undefined) cambios.notas = notas.trim() || null;

  const { error } = await supabase.from('citas').update(cambios).eq('id', id);
  if (error) throw new Error('No se pudo actualizar la cita.');
}

export { getConfig, updateConfig } from './config';
