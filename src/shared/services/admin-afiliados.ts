import { supabase } from '@shared/lib/supabase';
import type {
  Afiliado,
  Documento,
  Plan,
  Solicitud,
  SolicitudEstado,
  SolicitudPrioridad,
  SolicitudTipo,
  TokenMovement,
} from '@shared/types/supabase';

// Gestión de afiliados desde el panel de administración.
// Todas las operaciones dependen de que el RLS reconozca al usuario como
// admin (is_admin()); el movimiento de tokens además lo revalida en la RPC.

const AFILIADO_SELECT = '*, plan:planes(*), profile:profiles(*)';
const SOLICITUD_SELECT = '*, afiliado:afiliados(*, profile:profiles(*))';

export interface SolicitudesFiltros {
  estado?: SolicitudEstado;
  tipo?: SolicitudTipo;
  prioridad?: SolicitudPrioridad;
  afiliadoId?: string;
  /** YYYY-MM-DD */
  fechaDesde?: string;
  /** YYYY-MM-DD */
  fechaHasta?: string;
}

export interface DocumentoInput {
  afiliadoId: string;
  solicitudId?: string | null;
  nombre: string;
  descripcion?: string;
  url: string;
  tipoArchivo?: string;
}

export interface SolicitudCambios {
  estado?: SolicitudEstado;
  notas?: string;
  tokensEstimados?: number;
  tokensConsumidos?: number;
  asignadoA?: string;
}

// --- Planes ------------------------------------------------------------

export async function getPlanes(): Promise<Plan[]> {
  const { data, error } = await supabase
    .from('planes')
    .select('*')
    .eq('activo', true)
    .order('tokens_incluidos', { ascending: true });

  if (error) throw new Error('No se pudieron cargar los planes.');
  return (data ?? []) as Plan[];
}

// --- Afiliados ---------------------------------------------------------

export async function getAfiliados(): Promise<Afiliado[]> {
  const { data, error } = await supabase
    .from('afiliados')
    .select(AFILIADO_SELECT)
    .order('created_at', { ascending: false });

  if (error) throw new Error('No se pudieron cargar los afiliados.');
  return (data ?? []) as Afiliado[];
}

export async function getAfiliadoById(id: string): Promise<Afiliado | null> {
  const { data, error } = await supabase
    .from('afiliados')
    .select(AFILIADO_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error('No se pudo cargar el afiliado.');
  return (data as Afiliado | null) ?? null;
}

/**
 * Da de alta como afiliado a un usuario ya registrado.
 * Los tokens iniciales no se escriben aquí: se registran con
 * recargarTokens() para que quede el movimiento en el historial.
 */
export async function crearAfiliado(profileId: string, planId: string): Promise<void> {
  const { error } = await supabase.from('afiliados').insert({
    id: profileId,
    plan_id: planId,
  });

  if (error) {
    if (error.code === '23505') {
      throw new Error('Este usuario ya está dado de alta como afiliado.');
    }
    throw new Error('No se pudo crear el afiliado.');
  }
}

export async function asignarPlan(afiliadoId: string, planId: string): Promise<void> {
  const { error } = await supabase
    .from('afiliados')
    .update({ plan_id: planId })
    .eq('id', afiliadoId);

  if (error) throw new Error('No se pudo cambiar el plan.');
}

export async function actualizarEstadoAfiliado(
  afiliadoId: string,
  estado: Afiliado['estado'],
): Promise<void> {
  const { error } = await supabase.from('afiliados').update({ estado }).eq('id', afiliadoId);
  if (error) throw new Error('No se pudo actualizar el estado del afiliado.');
}

/** Perfiles sin ficha de afiliado, para el alta desde el panel. */
export async function getProfilesSinAfiliar(): Promise<
  Array<{ id: string; nombre: string | null; empresa: string | null }>
> {
  const [perfilesRes, afiliadosRes] = await Promise.all([
    supabase.from('profiles').select('id, nombre, empresa').eq('rol', 'afiliado'),
    supabase.from('afiliados').select('id'),
  ]);

  if (perfilesRes.error || afiliadosRes.error) {
    throw new Error('No se pudieron cargar los usuarios registrados.');
  }

  const yaAfiliados = new Set(
    ((afiliadosRes.data ?? []) as Array<{ id: string }>).map((a) => a.id),
  );

  return ((perfilesRes.data ?? []) as Array<{
    id: string;
    nombre: string | null;
    empresa: string | null;
  }>).filter((p) => !yaAfiliados.has(p.id));
}

// --- Tokens ------------------------------------------------------------

/**
 * Todas las alteraciones de saldo pasan por la RPC: es la única vía que
 * registra el movimiento y actualiza el balance en la misma transacción.
 * La función revalida is_admin() en la base y devuelve un error claro si
 * el saldo no alcanza.
 */
async function moverTokens(
  afiliadoId: string,
  tipo: 'recarga' | 'consumo' | 'reembolso' | 'ajuste',
  cantidad: number,
  descripcion?: string,
  solicitudId?: string | null,
): Promise<void> {
  const { data: sesion } = await supabase.auth.getUser();

  const { error } = await supabase.rpc('registrar_movimiento_tokens', {
    p_afiliado_id: afiliadoId,
    p_tipo: tipo,
    p_cantidad: cantidad,
    p_descripcion: descripcion?.trim() || null,
    p_solicitud_id: solicitudId ?? null,
    p_realizado_por: sesion.user?.id ?? null,
  });

  if (error) {
    if (error.message.includes('Saldo insuficiente')) {
      throw new Error('El afiliado no tiene tokens suficientes para este consumo.');
    }
    if (error.message.includes('No autorizado')) {
      throw new Error('No tienes permisos para modificar tokens.');
    }
    throw new Error('No se pudo registrar el movimiento de tokens.');
  }
}

export async function recargarTokens(
  afiliadoId: string,
  cantidad: number,
  descripcion?: string,
): Promise<void> {
  await moverTokens(afiliadoId, 'recarga', cantidad, descripcion);
}

export async function consumirTokens(
  afiliadoId: string,
  cantidad: number,
  descripcion?: string,
  solicitudId?: string | null,
): Promise<void> {
  await moverTokens(afiliadoId, 'consumo', cantidad, descripcion, solicitudId);
}

export async function reembolsarTokens(
  afiliadoId: string,
  cantidad: number,
  descripcion?: string,
  solicitudId?: string | null,
): Promise<void> {
  await moverTokens(afiliadoId, 'reembolso', cantidad, descripcion, solicitudId);
}

export async function getTokenMovements(afiliadoId: string): Promise<TokenMovement[]> {
  const { data, error } = await supabase
    .from('token_movements')
    .select('*')
    .eq('afiliado_id', afiliadoId)
    .order('created_at', { ascending: false });

  if (error) throw new Error('No se pudo cargar el historial de tokens.');
  return (data ?? []) as TokenMovement[];
}

// --- Solicitudes -------------------------------------------------------

export async function getSolicitudesAdmin(
  filtros: SolicitudesFiltros = {},
): Promise<Solicitud[]> {
  let query = supabase
    .from('solicitudes')
    .select(SOLICITUD_SELECT)
    .order('created_at', { ascending: false });

  if (filtros.estado) query = query.eq('estado', filtros.estado);
  if (filtros.tipo) query = query.eq('tipo', filtros.tipo);
  if (filtros.prioridad) query = query.eq('prioridad', filtros.prioridad);
  if (filtros.afiliadoId) query = query.eq('afiliado_id', filtros.afiliadoId);
  if (filtros.fechaDesde) query = query.gte('created_at', filtros.fechaDesde);
  if (filtros.fechaHasta) query = query.lte('created_at', `${filtros.fechaHasta}T23:59:59`);

  const { data, error } = await query;
  if (error) throw new Error('No se pudieron cargar las solicitudes.');
  return (data ?? []) as Solicitud[];
}

/**
 * Actualiza la ficha de la solicitud. No mueve el saldo del afiliado:
 * el descuento real se hace con consumirTokens(), para que quede
 * registrado en token_movements y no se descuente dos veces.
 */
export async function updateSolicitudEstado(
  id: string,
  estado: SolicitudEstado,
  notas?: string,
  tokensConsumidos?: number,
): Promise<void> {
  const cambios: Record<string, string | number | null> = { estado };
  if (notas !== undefined) cambios.notas_admin = notas.trim() || null;
  if (tokensConsumidos !== undefined) cambios.tokens_consumidos = tokensConsumidos;

  const { error } = await supabase.from('solicitudes').update(cambios).eq('id', id);
  if (error) throw new Error('No se pudo actualizar la solicitud.');
}

export async function updateSolicitud(id: string, cambios: SolicitudCambios): Promise<void> {
  const payload: Record<string, string | number | null> = {};
  if (cambios.estado !== undefined) payload.estado = cambios.estado;
  if (cambios.notas !== undefined) payload.notas_admin = cambios.notas.trim() || null;
  if (cambios.tokensEstimados !== undefined) payload.tokens_estimados = cambios.tokensEstimados;
  if (cambios.tokensConsumidos !== undefined) payload.tokens_consumidos = cambios.tokensConsumidos;
  if (cambios.asignadoA !== undefined) payload.asignado_a = cambios.asignadoA.trim() || null;

  if (Object.keys(payload).length === 0) return;

  const { error } = await supabase.from('solicitudes').update(payload).eq('id', id);
  if (error) throw new Error('No se pudo actualizar la solicitud.');
}

// --- Documentos --------------------------------------------------------

export async function getDocumentosDeAfiliado(afiliadoId: string): Promise<Documento[]> {
  const { data, error } = await supabase
    .from('documentos')
    .select('*, solicitud:solicitudes(id, codigo, tipo)')
    .eq('afiliado_id', afiliadoId)
    .order('created_at', { ascending: false });

  if (error) throw new Error('No se pudieron cargar los documentos.');
  return (data ?? []) as Documento[];
}

export async function subirDocumento(data: DocumentoInput): Promise<void> {
  const { data: sesion } = await supabase.auth.getUser();

  const { error } = await supabase.from('documentos').insert({
    afiliado_id: data.afiliadoId,
    solicitud_id: data.solicitudId ?? null,
    nombre: data.nombre.trim(),
    descripcion: data.descripcion?.trim() || null,
    url: data.url.trim(),
    tipo_archivo: data.tipoArchivo?.trim() || null,
    subido_por: sesion.user?.id ?? null,
  });

  if (error) throw new Error('No se pudo registrar el documento.');
}
