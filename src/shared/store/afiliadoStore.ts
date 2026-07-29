import { create } from 'zustand';
import { getMyProfile } from '@shared/services/afiliado';
import type { Afiliado, Profile } from '@shared/types/supabase';

// Perfil y ficha de afiliación del usuario autenticado.
// Se carga una vez en DashboardLayout y lo consumen todas las páginas de
// /app, para no repetir la misma consulta en cada navegación.

interface AfiliadoState {
  profile: Profile | null;
  /** null si el admin todavía no ha dado de alta la ficha de afiliado */
  afiliado: Afiliado | null;
  loading: boolean;
  loaded: boolean;
  error: string | null;

  cargar: (forzar?: boolean) => Promise<void>;
  limpiar: () => void;
}

export const useAfiliadoStore = create<AfiliadoState>((set, get) => ({
  profile: null,
  afiliado: null,
  loading: false,
  loaded: false,
  error: null,

  cargar: async (forzar = false) => {
    if (get().loading) return;
    if (get().loaded && !forzar) return;

    set({ loading: true, error: null });
    try {
      const { profile, afiliado } = await getMyProfile();
      set({ profile, afiliado, loaded: true });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'No se pudo cargar tu información.',
        loaded: true,
      });
    } finally {
      set({ loading: false });
    }
  },

  limpiar: () => set({ profile: null, afiliado: null, loaded: false, error: null }),
}));
