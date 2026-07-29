import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAfiliadoStore } from '@shared/store/afiliadoStore';
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

function iniciales(nombre: string | null | undefined): string {
  if (!nombre) return 'JT';
  return (
    nombre
      .split(' ')
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'JT'
  );
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const title = usePageTitle();
  const profile = useAfiliadoStore((s) => s.profile);

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
        <div className="flex items-center gap-2.5 rounded-full border border-sand-200 bg-white py-1 pl-1 pr-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold text-white">
            {iniciales(profile?.nombre)}
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="text-xs font-semibold text-stone-900">{profile?.nombre ?? 'Afiliado'}</p>
            <p className="text-[11px] text-stone-500">{profile?.empresa ?? '—'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
