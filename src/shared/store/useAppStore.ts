import { create } from 'zustand';
import type {
  Company,
  DocumentItem,
  LegalRequest,
  TokenMovement,
  TokenSummary,
} from '@shared/types';
import {
  mockCompany,
  mockDocuments,
  mockRequests,
  mockTokenMovements,
  mockTokenSummary,
} from '@shared/mocks/data';

// Store global de la app. Hoy lee datos mock; mañana cada slice puede
// reemplazar su inicialización por llamadas a un backend sin tocar la UI.

interface AppState {
  company: Company;
  tokenSummary: TokenSummary;
  tokenMovements: TokenMovement[];
  documents: DocumentItem[];
  requests: LegalRequest[];

  // selectores derivados
  getRequestById: (id: string) => LegalRequest | undefined;
  getDocumentsByRequest: (requestId: string) => DocumentItem[];
}

export const useAppStore = create<AppState>((_set, get) => ({
  company: mockCompany,
  tokenSummary: mockTokenSummary,
  tokenMovements: mockTokenMovements,
  documents: mockDocuments,
  requests: mockRequests,

  getRequestById: (id) => get().requests.find((r) => r.id === id),
  getDocumentsByRequest: (requestId) =>
    get().documents.filter((d) => d.relatedRequestId === requestId),
}));
