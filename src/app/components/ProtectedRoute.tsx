import type { ReactNode } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button, Logo } from '@shared/ui';
import { ROUTES } from '@app/routes';
import { useAuthStore } from '@shared/store/authStore';
import type { Rol } from '@shared/types/supabase';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: Rol;
}

function CenteredSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-50">
      <div
        role="status"
        aria-label="Cargando"
        className="h-8 w-8 animate-spin rounded-full border-2 border-sand-200 border-t-brand-500"
      />
    </div>
  );
}

/**
 * El usuario está autenticado pero su rol no da acceso a esta sección.
 * Se le ofrece el panel que sí le corresponde en lugar de devolverlo al
 * login, que resultaría confuso teniendo ya sesión activa.
 */
function Forbidden({ rol }: { rol: Rol | undefined }) {
  const destino = rol === 'admin' ? ROUTES.admin : ROUTES.dashboard;
  const etiqueta = rol === 'admin' ? 'Ir al panel de administración' : 'Ir a mi panel';

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-50 px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center">
          <Link to={ROUTES.home}>
            <Logo />
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-sand-200 bg-white p-8 shadow-card">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <ShieldAlert size={28} />
          </span>
          <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-stone-400">
            Error 403
          </p>
          <h1 className="mt-1 text-2xl font-bold leading-snug tracking-tight text-stone-900">
            No tienes acceso a esta sección
          </h1>
          <p className="mt-2 text-base font-normal leading-relaxed text-stone-500">
            Tu cuenta no tiene los permisos necesarios para ver esta página.
          </p>

          <Link to={destino} className="mt-6 block">
            <Button size="lg" className="w-full">
              {etiqueta}
            </Button>
          </Link>
          <Link to={ROUTES.home} className="mt-3 block">
            <Button variant="outline" size="lg" className="w-full">
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, loading, initialized } = useAuthStore();

  // Hasta que la sesión se resuelva no se decide nada: redirigir antes
  // expulsaría a un usuario válido en cada recarga de página.
  if (!initialized || loading) {
    return <CenteredSpinner />;
  }

  if (!user) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (requiredRole && profile?.rol !== requiredRole) {
    return <Forbidden rol={profile?.rol} />;
  }

  return <>{children}</>;
}
