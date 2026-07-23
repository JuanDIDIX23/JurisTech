import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ScrollToTop } from '@app/ScrollToTop';
import { DashboardLayout } from '@features/dashboard/layout/DashboardLayout';
import { ROUTES } from '@app/routes';

// Code-splitting por página: la landing y el área privada se cargan aparte.
const LandingPage = lazy(() => import('@pages/LandingPage'));
const DashboardPage = lazy(() => import('@pages/dashboard/DashboardPage'));
const DocumentsPage = lazy(() => import('@pages/dashboard/DocumentsPage'));
const TokensPage = lazy(() => import('@pages/dashboard/TokensPage'));
const RequestsPage = lazy(() => import('@pages/dashboard/RequestsPage'));
const ProfilePage = lazy(() => import('@pages/dashboard/ProfilePage'));

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-sand-200 border-t-brand-500" />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path={ROUTES.home} element={<LandingPage />} />

          {/* Área privada bajo /app con layout compartido */}
          <Route path={ROUTES.dashboard} element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="documentos" element={<DocumentsPage />} />
            <Route path="tokens" element={<TokensPage />} />
            <Route path="solicitudes" element={<RequestsPage />} />
            <Route path="solicitudes/:id" element={<RequestsPage />} />
            <Route path="perfil" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
