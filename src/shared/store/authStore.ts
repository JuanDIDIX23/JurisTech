import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@shared/lib/supabase';
import type { Profile } from '@shared/types/supabase';

// Estado de autenticación. Es la única fuente de verdad sobre sesión y rol;
// la UI nunca llama a supabase.auth directamente.

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<Profile | null>;
  signOut: () => Promise<void>;
  getProfile: () => Promise<Profile | null>;
}

/** Suscripción a onAuthStateChange; se conserva para no duplicarla. */
let authSubscription: { unsubscribe: () => void } | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;

    try {
      const { data } = await supabase.auth.getSession();
      set({ user: data.session?.user ?? null });
      if (data.session?.user) {
        await get().getProfile();
      }
    } catch {
      set({ user: null, profile: null });
    } finally {
      set({ loading: false, initialized: true });
    }

    // Mantiene el store sincronizado ante login/logout/refresh de token.
    // El callback no puede ser async ni llamar a supabase de forma directa
    // (bloquea el cliente), por eso la carga del perfil se difiere.
    authSubscription?.unsubscribe();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      set({ user: nextUser });

      if (nextUser) {
        setTimeout(() => {
          void get().getProfile();
        }, 0);
      } else {
        set({ profile: null });
      }
    });
    authSubscription = listener.subscription;
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        throw new Error('Credenciales incorrectas, intenta de nuevo');
      }
      set({ user: data.user });
      return await get().getProfile();
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
    } finally {
      set({ user: null, profile: null, loading: false });
    }
  },

  getProfile: async () => {
    const { user } = get();
    if (!user) {
      set({ profile: null });
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !data) {
      set({ profile: null });
      return null;
    }

    const profile = data as Profile;
    set({ profile });
    return profile;
  },
}));
