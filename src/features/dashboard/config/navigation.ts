import { LayoutDashboard, FileText, Coins, ClipboardList, UserCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ROUTES } from '@app/routes';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** end => match exacto (para la ruta índice) */
  end?: boolean;
}

export const DASHBOARD_NAV: NavItem[] = [
  { label: 'Dashboard', to: ROUTES.dashboard, icon: LayoutDashboard, end: true },
  { label: 'Documentos', to: ROUTES.documents, icon: FileText },
  { label: 'Tokens', to: ROUTES.tokens, icon: Coins },
  { label: 'Solicitudes', to: ROUTES.requests, icon: ClipboardList },
  { label: 'Perfil', to: ROUTES.profile, icon: UserCircle },
];
