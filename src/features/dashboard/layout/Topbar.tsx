import { useLocation } from 'react-router-dom';
import { Bell, Menu, Search, Plus } from 'lucide-react';
import { Button, Input } from '@shared/ui';
import { useAppStore } from '@shared/store/useAppStore';
import { DASHBOARD_NAV } from '../config/navigation';

interface TopbarProps {
  onMenuClick: () => void;
}

function usePageTitle() {
  const { pathname } = useLocation();
  // match más específico primero
  const match = [...DASHBOARD_NAV]
    .sort((a, b) => b.to.length - a.to.length)
    .find((item) => (item.end ? pathname === item.to : pathname.startsWith(item.to)));
  return match?.label ?? 'Dashboard';
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const title = usePageTitle();
  const { company } = useAppStore();
  const initials = company.contactName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-sand-200 bg-white/80 px-4 backdrop-blur-xl lg:px-8">
      <button
        onClick={onMenuClick}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 hover:bg-sand-100 lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu size={20} />
      </button>

      <h1 className="text-base font-semibold text-stone-900">{title}</h1>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="hidden w-64 md:block">
          <Input placeholder="Buscar…" leftIcon={<Search size={16} />} />
        </div>

        <Button size="sm" className="hidden sm:inline-flex" leftIcon={<Plus size={16} />}>
          Nueva solicitud
        </Button>

        <button
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 hover:bg-sand-100"
          aria-label="Notificaciones"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-2.5 rounded-full border border-sand-200 bg-white py-1 pl-1 pr-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold text-white">
            {initials}
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="text-xs font-semibold text-stone-900">{company.contactName}</p>
            <p className="text-[11px] text-stone-500">{company.name}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
