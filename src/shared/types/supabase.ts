// Tipos que mapean 1:1 con las tablas de Supabase (ver supabase/schema.sql).
// Las columnas sin NOT NULL se modelan como `| null`.
// Las relaciones embebidas por PostgREST son opcionales: solo llegan cuando
// la consulta las pide explícitamente con select('*, plan:planes(*)').

export type Rol = 'admin' | 'afiliado';

export type LeadEstado = 'nuevo' | 'contactado' | 'en_proceso' | 'cerrado' | 'descartado';

export type CitaEstado = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

export interface Profile {
  id: string;
  rol: Rol;
  nombre: string | null;
  empresa: string | null;
  telefono: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  nombre: string;
  empresa: string | null;
  telefono: string;
  correo: string | null;
  servicio: string;
  mensaje: string | null;
  estado: LeadEstado;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface Cita {
  id: string;
  nombre: string;
  empresa: string | null;
  telefono: string;
  correo: string;
  /** formato YYYY-MM-DD */
  fecha: string;
  /** formato HH:MM:SS */
  hora: string;
  motivo: string | null;
  estado: CitaEstado;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  total_leads: number;
  leads_nuevos: number;
  leads_mes: number;
  total_citas: number;
  citas_pendientes: number;
  citas_hoy: number;
  citas_semana: number;
  afiliados_activos: number;
  solicitudes_nuevas: number;
  solicitudes_activas: number;
}

// --- Fase 2: afiliados -------------------------------------------------

export type AfiliadoEstado = 'activo' | 'suspendido' | 'cancelado';

export type SolicitudTipo =
  | 'consulta_laboral'
  | 'revision_contrato'
  | 'elaboracion_contrato'
  | 'concepto_seguridad_social'
  | 'acompanamiento_preventivo'
  | 'revision_acuerdo_comercial'
  | 'otro';

export type SolicitudEstado =
  | 'recibida'
  | 'en_revision'
  | 'en_proceso'
  | 'entregada'
  | 'cerrada'
  | 'cancelada';

export type SolicitudPrioridad = 'normal' | 'urgente';

export type TokenMovementTipo = 'recarga' | 'consumo' | 'reembolso' | 'ajuste';

export interface Plan {
  id: string;
  nombre: string;
  tokens_incluidos: number;
  descripcion: string | null;
  activo: boolean;
  created_at: string;
}

export interface Afiliado {
  id: string;
  plan_id: string | null;
  tokens_disponibles: number;
  tokens_consumidos: number;
  /** formato YYYY-MM-DD */
  fecha_inicio: string;
  /** formato YYYY-MM-DD */
  fecha_renovacion: string | null;
  estado: AfiliadoEstado;
  created_at: string;
  updated_at: string;
  // relaciones embebidas
  plan?: Plan | null;
  profile?: Profile | null;
}

export interface Solicitud {
  id: string;
  afiliado_id: string;
  /** formato JT-AAAA-NNNN, generado por trigger */
  codigo: string | null;
  tipo: SolicitudTipo;
  descripcion: string;
  tokens_estimados: number | null;
  tokens_consumidos: number;
  estado: SolicitudEstado;
  prioridad: SolicitudPrioridad;
  asignado_a: string | null;
  notas_admin: string | null;
  created_at: string;
  updated_at: string;
  // relación embebida
  afiliado?: Afiliado | null;
}

export interface Documento {
  id: string;
  afiliado_id: string;
  solicitud_id: string | null;
  nombre: string;
  descripcion: string | null;
  url: string;
  tipo_archivo: string | null;
  tamano_bytes: number | null;
  subido_por: string | null;
  created_at: string;
  // relación embebida
  solicitud?: Pick<Solicitud, 'id' | 'codigo' | 'tipo'> | null;
}

export interface TokenMovement {
  id: string;
  afiliado_id: string;
  solicitud_id: string | null;
  tipo: TokenMovementTipo;
  cantidad: number;
  descripcion: string | null;
  realizado_por: string | null;
  created_at: string;
}

// --- Medios de la landing ----------------------------------------------

export type MediaSeccion = 'hero' | 'nosotros';

export interface Media {
  id: string;
  seccion: MediaSeccion;
  url: string;
  alt: string | null;
  orden: number;
  activo: boolean;
  created_at: string;
}

/** Métricas del dashboard del afiliado (derivadas en cliente). */
export interface AfiliadoStats {
  tokensDisponibles: number;
  tokensConsumidos: number;
  /** tokens incluidos en el plan contratado */
  tokensPlan: number;
  solicitudesActivas: number;
  totalDocumentos: number;
}
