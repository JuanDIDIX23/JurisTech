import { LayoutDashboard, Users, CalendarDays, BarChart3, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ROUTES } from '@app/routes';

export interface AdminNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** coincidencia exacta de ruta */
  end?: boolean;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { label: 'Dashboard', to: ROUTES.admin, icon: LayoutDashboard, end: true },
  { label: 'Leads', to: ROUTES.adminLeads, icon: Users },
  { label: 'Citas', to: ROUTES.adminCitas, icon: CalendarDays },
  { label: 'Estadísticas', to: ROUTES.adminStats, icon: BarChart3 },
  { label: 'Configuración', to: ROUTES.adminConfig, icon: Settings },
];
