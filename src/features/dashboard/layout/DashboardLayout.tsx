import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CuentaEnConfiguracion } from '../components/CuentaEnConfiguracion';
import { useAfiliadoStore } from '@shared/store/afiliadoStore';

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, afiliado, loading, loaded, error, cargar } = useAfiliadoStore();

  useEffect(() => {
    void cargar();
  }, [cargar]);

  if (!loaded || loading) {
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

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand-50 px-4">
        <p
          role="alert"
          className="max-w-md rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-medium text-rose-700"
        >
          {error}
        </p>
      </div>
    );
  }

  // Registrado pero sin ficha de afiliación: no hay datos que mostrar,
  // así que tampoco se ofrece navegación.
  if (!afiliado) {
    return <CuentaEnConfiguracion nombre={profile?.nombre} />;
  }

  return (
    <div className="min-h-screen bg-sand-50">
      <Sidebar mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />

      <div className="lg:pl-64">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
