import { supabase } from '@shared/lib/supabase';
import type {
  Afiliado,
  AfiliadoStats,
  Documento,
  Profile,
  Solicitud,
  SolicitudPrioridad,
  SolicitudTipo,
  TokenMovement,
} from '@shared/types/supabase';

// Servicios del área privada del afiliado. Todas las consultas se apoyan en
// el RLS: las policies `*_own_select` limitan las filas a las del usuario
// autenticado, así que no hace falta filtrar por id en cada llamada.

export interface MiPerfil {
  profile: Profile;
  /** null si el usuario aún no ha sido dado de alta como afiliado */
  afiliado: Afiliado | null;
}

export interface SolicitudInput {
  tipo: SolicitudTipo;
  descripcion: string;
  prioridad: SolicitudPrioridad;
}

/** Id del usuario autenticado. Lanza si la sesión expiró. */
async function idUsuario(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.');
  }
  return data.user.id;
}

export async function getMyProfile(): Promise<MiPerfil> {
  const userId = await idUsuario();

  const [perfilRes, afiliadoRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('afiliados').select('*, plan:planes(*)').eq('id', userId).maybeSingle(),
  ]);

  if (perfilRes.error || !perfilRes.data) {
    throw new Error('No se pudo cargar tu perfil.');
  }
  // Un perfil sin ficha de afiliado es un estado válido: el usuario se
  // registró pero un admin todavía no le ha asignado plan.
  if (afiliadoRes.error) {
    throw new Error('No se pudo cargar tu información de afiliación.');
  }

  return {
    profile: perfilRes.data as Profile,
    afiliado: (afiliadoRes.data as Afiliado | null) ?? null,
  };
}

export async function updateMyProfile(cambios: {
  nombre: string;
  empresa: string;
  telefono: string;
}): Promise<void> {
  const userId = await idUsuario();

  const { error } = await supabase
    .from('profiles')
    .update({
      nombre: cambios.nombre.trim() || null,
      empresa: cambios.empresa.trim() || null,
      telefono: cambios.telefono.trim() || null,
    })
    .eq('id', userId);

  if (error) throw new Error('No se pudieron guardar tus datos.');
}

export async function getMySolicitudes(): Promise<Solicitud[]> {
  const { data, error } = await supabase
    .from('solicitudes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error('No se pudieron cargar tus solicitudes.');
  return (data ?? []) as Solicitud[];
}

export async function getSolicitudById(id: string): Promise<Solicitud | null> {
  const { data, error } = await supabase
    .from('solicitudes')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error('No se pudo cargar la solicitud.');
  return (data as Solicitud | null) ?? null;
}

/**
 * Crea una solicitud. Solo se envían las cuatro columnas que el afiliado
 * tiene permiso de insertar: estado, tokens y notas_admin son competencia
 * del panel de administración (ver migración 004, MENOR 2).
 */
export async function crearSolicitud(data: SolicitudInput): Promise<Solicitud> {
  const afiliadoId = await idUsuario();

  const { data: creada, error } = await supabase
    .from('solicitudes')
    .insert({
      afiliado_id: afiliadoId,
      tipo: data.tipo,
      descripcion: data.descripcion.trim(),
      prioridad: data.prioridad,
    })
    .select()
    .single();

  if (error || !creada) {
    throw new Error('No se pudo crear la solicitud. Intenta de nuevo.');
  }
  return creada as Solicitud;
}

export async function getMyDocumentos(): Promise<Documento[]> {
  const { data, error } = await supabase
    .from('documentos')
    .select('*, solicitud:solicitudes(id, codigo, tipo)')
    .order('created_at', { ascending: false });

  if (error) throw new Error('No se pudieron cargar tus documentos.');
  return (data ?? []) as Documento[];
}

export async function getMyTokenMovements(): Promise<TokenMovement[]> {
  const { data, error } = await supabase
    .from('token_movements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error('No se pudo cargar tu historial de tokens.');
  return (data ?? []) as TokenMovement[];
}

/**
 * Métricas del dashboard. Los conteos usan `head: true`, que pide solo la
 * cabecera Content-Range: no descarga las filas.
 */
export async function getMyStats(): Promise<AfiliadoStats> {
  const { afiliado } = await getMyProfile();

  const [solicitudesRes, documentosRes] = await Promise.all([
    supabase
      .from('solicitudes')
      .select('id', { count: 'exact', head: true })
      .not('estado', 'in', '("cerrada","cancelada")'),
    supabase.from('documentos').select('id', { count: 'exact', head: true }),
  ]);

  return {
    tokensDisponibles: afiliado?.tokens_disponibles ?? 0,
    tokensConsumidos: afiliado?.tokens_consumidos ?? 0,
    tokensPlan: afiliado?.plan?.tokens_incluidos ?? 0,
    solicitudesActivas: solicitudesRes.count ?? 0,
    totalDocumentos: documentosRes.count ?? 0,
  };
}
