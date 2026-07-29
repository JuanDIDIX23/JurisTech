import type {
  CitaEstado,
  DocumentType,
  LeadEstado,
  RequestStatus,
  ServiceCategory,
  TokenMovementType,
} from '@shared/types';

// --- Panel de administración -------------------------------------------

export const LEAD_ESTADO_LABELS: Record<LeadEstado, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  en_proceso: 'En proceso',
  cerrado: 'Cerrado',
  descartado: 'Descartado',
};

export const LEAD_ESTADO_TONE: Record<LeadEstado, string> = {
  nuevo: 'bg-brand-50 text-brand-700 ring-brand-200',
  contactado: 'bg-amber-50 text-amber-700 ring-amber-200',
  en_proceso: 'bg-sky-50 text-sky-700 ring-sky-200',
  cerrado: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  descartado: 'bg-stone-100 text-stone-600 ring-stone-200',
};

export const CITA_ESTADO_LABELS: Record<CitaEstado, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  completada: 'Completada',
};

export const CITA_ESTADO_TONE: Record<CitaEstado, string> = {
  pendiente: 'bg-amber-50 text-amber-700 ring-amber-200',
  confirmada: 'bg-brand-50 text-brand-700 ring-brand-200',
  cancelada: 'bg-rose-50 text-rose-700 ring-rose-200',
  completada: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

/** Servicios ofrecidos en el formulario de contacto (para filtros). */
export const SERVICIOS = [
  'Derecho Laboral',
  'Seguridad Social',
  'Derecho Contractual',
  'Consultoría Empresarial',
  'Otro',
] as const;

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'Recibida',
  in_review: 'En revisión',
  in_progress: 'En proceso',
  completed: 'Entregada',
  cancelled: 'Cerrada',
};

// Tono de cada estado para badges (clases tailwind).
export const REQUEST_STATUS_TONE: Record<RequestStatus, string> = {
  pending: 'bg-sand-100 text-stone-600 ring-sand-200',
  in_review: 'bg-amber-50 text-amber-700 ring-amber-200',
  in_progress: 'bg-brand-50 text-brand-700 ring-brand-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-200',
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  contract: 'Contrato',
  report: 'Informe',
  legal_opinion: 'Dictamen',
  invoice: 'Factura',
  policy: 'Política',
  other: 'Otro',
};

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  corporate: 'Mercantil',
  labor: 'Laboral',
  tax: 'Fiscal',
  compliance: 'Compliance',
  ip: 'Propiedad intelectual',
  data_protection: 'Protección de datos',
};

export const TOKEN_MOVEMENT_LABELS: Record<TokenMovementType, string> = {
  purchase: 'Compra',
  consumption: 'Consumo',
  refund: 'Reembolso',
  bonus: 'Bonificación',
};
