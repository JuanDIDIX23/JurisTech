import type {
  DocumentType,
  RequestStatus,
  ServiceCategory,
  TokenMovementType,
} from '@shared/types';

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'Recibida',
  in_review: 'En revisión',
  in_progress: 'En proceso',
  completed: 'Entregada',
  cancelled: 'Cerrada',
};

// Tono de cada estado para badges (clases tailwind).
export const REQUEST_STATUS_TONE: Record<RequestStatus, string> = {
  pending: 'bg-graphite-100 text-graphite-600 ring-graphite-200',
  in_review: 'bg-amber-50 text-amber-700 ring-amber-200',
  in_progress: 'bg-accent-50 text-accent-700 ring-accent-200',
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
