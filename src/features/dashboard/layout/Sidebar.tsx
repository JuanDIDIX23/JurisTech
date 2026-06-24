import { NavLink, Link } from 'react-router-dom';
import { LogOut, Coins } from 'lucide-react';
import { Logo } from '@shared/ui';
import { cn } from '@shared/lib/cn';
import { ROUTES } from '@app/routes';
import { useAppStore } from '@shared/store/useAppStore';
import { formatNumber } from '@shared/lib/format';
import { DASHBOARD_NAV } from '../config/navigation';

interface SidebarProps {
  /** en móvil el sidebar es un drawer */
  mobileOpen: boolean;
  onNavigate: () => void;
}

export function Sidebar({ mobileOpen, onNavigate }: SidebarProps) {
  const { tokenSummary, company } = useAppStore();
  const pct = Math.round((tokenSummary.remaining / tokenSummary.purchased) * 100);

  return (
    <>
      {/* overlay móvil */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-navy-950/40 backdrop-blur-sm transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onNavigate}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-graphite-200/70 bg-white transition-transform duration-300 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center border-b border-graphite-200/70 px-6">
          <Link to={ROUTES.home}>
            <Logo />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {DASHBOARD_NAV.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-navy-900 text-white'
                    : 'text-graphite-600 hover:bg-graphite-100 hover:text-navy-900',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={cn(
                      'transition-colors',
                      isActive ? 'text-accent-300' : 'text-graphite-400 group-hover:text-navy-700',
                    )}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* widget de tokens */}
        <div className="px-3 pb-3">
          <Link
            to={ROUTES.tokens}
            onClick={onNavigate}
            className="block rounded-xl border border-graphite-200/70 bg-graphite-50 p-4 transition-colors hover:border-accent-200"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-graphite-600">
                <Coins size={14} className="text-accent-500" />
                Tokens
              </span>
              <span className="text-xs font-semibold text-navy-900">
                {formatNumber(tokenSummary.remaining)}
              </span>
            </div>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-graphite-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-500 to-accent-400"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-graphite-500">
              {pct}% disponible · plan {company.plan.name}
            </p>
          </Link>
        </div>

        <div className="border-t border-graphite-200/70 p-3">
          <Link
            to={ROUTES.home}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-graphite-500 transition-colors hover:bg-graphite-100 hover:text-rose-600"
          >
            <LogOut size={18} className="text-graphite-400" />
            Cerrar sesión
          </Link>
        </div>
      </aside>
    </>
  );
}
