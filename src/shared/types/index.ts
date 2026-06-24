// Tipos de dominio compartidos. Pensados para mapear 1:1 con un backend futuro.

export type ID = string;

export type RequestStatus = 'pending' | 'in_review' | 'in_progress' | 'completed' | 'cancelled';

export type DocumentType = 'contract' | 'report' | 'legal_opinion' | 'invoice' | 'policy' | 'other';

export type TokenMovementType = 'purchase' | 'consumption' | 'refund' | 'bonus';

export type ServiceCategory =
  | 'corporate'
  | 'labor'
  | 'tax'
  | 'compliance'
  | 'ip'
  | 'data_protection';

export interface Company {
  id: ID;
  name: string;
  legalName: string;
  taxId: string;
  industry: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  plan: Plan;
  contactName: string;
  contactRole: string;
}

export interface Plan {
  id: ID;
  name: string;
  tier: 'starter' | 'growth' | 'enterprise';
  monthlyTokens: number;
  pricePerMonth: number;
  renewalDate: string; // ISO
  features: string[];
}

export interface TokenSummary {
  purchased: number;
  consumed: number;
  remaining: number;
}

export interface TokenMovement {
  id: ID;
  date: string; // ISO
  type: TokenMovementType;
  description: string;
  amount: number; // positivo compra/bonus, negativo consumo
  balanceAfter: number;
}

export interface DocumentItem {
  id: ID;
  name: string;
  type: DocumentType;
  sizeKb: number;
  uploadedAt: string; // ISO
  owner: string;
  relatedRequestId?: ID;
  url: string;
}

export interface LegalRequest {
  id: ID;
  reference: string;
  title: string;
  category: ServiceCategory;
  status: RequestStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  tokensCost: number;
  assignedTo: string;
  timeline: RequestTimelineEvent[];
}

export interface RequestTimelineEvent {
  id: ID;
  date: string; // ISO
  title: string;
  description: string;
  status: RequestStatus;
}

export interface MetricCard {
  id: ID;
  label: string;
  value: string;
  delta?: number; // variación %
  hint?: string;
}
