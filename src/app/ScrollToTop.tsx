import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Restablece el scroll al navegar entre rutas. */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}
