import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ScrollToTop } from '@app/ScrollToTop';
import { ProtectedRoute } from '@app/components/ProtectedRoute';
import { DashboardLayout } from '@features/dashboard/layout/DashboardLayout';
import { AdminLayout } from '@features/admin/layout/AdminLayout';
import { ROUTES } from '@app/routes';
import { useAuthStore } from '@shared/store/authStore';

// Code-splitting por página: la landing y el área privada se cargan aparte.
const LandingPage = lazy(() => import('@pages/LandingPage'));
const LoginPage = lazy(() => import('@pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('@pages/dashboard/DashboardPage'));
const DocumentsPage = lazy(() => import('@pages/dashboard/DocumentsPage'));
const TokensPage = lazy(() => import('@pages/dashboard/TokensPage'));
const SolicitudesPage = lazy(() => import('@pages/dashboard/SolicitudesPage'));
const SolicitudDetallePage = lazy(() => import('@pages/dashboard/SolicitudDetallePage'));
const ProfilePage = lazy(() => import('@pages/dashboard/ProfilePage'));
const AdminDashboardPage = lazy(() => import('@pages/admin/AdminDashboardPage'));
const LeadsPage = lazy(() => import('@pages/admin/LeadsPage'));
const CitasPage = lazy(() => import('@pages/admin/CitasPage'));
const AfiliadosPage = lazy(() => import('@pages/admin/AfiliadosPage'));
const AfiliadoDetallePage = lazy(() => import('@pages/admin/AfiliadoDetallePage'));
const MediaPage = lazy(() => import('@pages/admin/MediaPage'));
const SolicitudesAdminPage = lazy(() => import('@pages/admin/SolicitudesAdminPage'));
const EstadisticasPage = lazy(() => import('@pages/admin/EstadisticasPage'));
const ConfigPage = lazy(() => import('@pages/admin/ConfigPage'));

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-sand-200 border-t-brand-500" />
    </div>
  );
}

export function App() {
  const initialize = useAuthStore((s) => s.initialize);

  // Resuelve la sesión existente una sola vez, antes de que las rutas
  // protegidas decidan si redirigen.
  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path={ROUTES.home} element={<LandingPage />} />

          {/* Autenticación */}
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.register} element={<RegisterPage />} />

          {/* Área privada del afiliado */}
          <Route
            path={ROUTES.dashboard}
            element={
              <ProtectedRoute requiredRole="afiliado">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="documentos" element={<DocumentsPage />} />
            <Route path="tokens" element={<TokensPage />} />
            <Route path="solicitudes" element={<SolicitudesPage />} />
            <Route path="solicitudes/:id" element={<SolicitudDetallePage />} />
            <Route path="perfil" element={<ProfilePage />} />
          </Route>

          {/* Panel de administración */}
          <Route
            path={ROUTES.admin}
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="citas" element={<CitasPage />} />
            <Route path="afiliados" element={<AfiliadosPage />} />
            <Route path="afiliados/:id" element={<AfiliadoDetallePage />} />
            <Route path="media" element={<MediaPage />} />
            <Route path="solicitudes" element={<SolicitudesAdminPage />} />
            <Route path="estadisticas" element={<EstadisticasPage />} />
            <Route path="config" element={<ConfigPage />} />
          </Route>

          <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
