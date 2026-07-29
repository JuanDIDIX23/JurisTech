import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { Logo } from '@shared/ui';
import { cn } from '@shared/lib/cn';
import { ROUTES } from '@app/routes';
import { useAuthStore } from '@shared/store/authStore';
import { ADMIN_NAV } from '../config/navigation';

export function AdminLayout() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      navigate(ROUTES.login, { replace: true });
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-sand-50">
      {/* overlay móvil */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-stone-950/40 backdrop-blur-sm transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sand-200 bg-white transition-transform duration-300 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center border-b border-sand-200 px-6">
          <Link to={ROUTES.home}>
            <Logo />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {ADMIN_NAV.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-stone-600 hover:bg-sand-100 hover:text-stone-900',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={cn(
                      'transition-colors',
                      isActive ? 'text-white' : 'text-stone-400 group-hover:text-stone-700',
                    )}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-sand-200 bg-white/80 px-4 backdrop-blur-xl lg:px-8">
          <button
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 hover:bg-sand-100 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>

          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-700">
            Admin
          </span>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm font-semibold text-stone-900 sm:block">
              {profile?.nombre ?? 'Administrador'}
            </span>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-sand-100 hover:text-rose-600 disabled:opacity-50"
            >
              <LogOut size={16} />
              {signingOut ? 'Saliendo…' : 'Cerrar sesión'}
            </button>
          </div>
        </header>

        <main className="px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
