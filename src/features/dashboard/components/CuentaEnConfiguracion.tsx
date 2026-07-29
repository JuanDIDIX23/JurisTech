import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock3, LogOut } from 'lucide-react';
import { Button, Logo } from '@shared/ui';
import { ROUTES } from '@app/routes';
import { useAuthStore } from '@shared/store/authStore';

/**
 * Pantalla para el usuario registrado al que un admin todavía no le ha
 * creado la ficha de afiliado. Se muestra en lugar del layout completo:
 * sin sidebar ni navegación, porque no hay nada que consultar aún.
 */
export function CuentaEnConfiguracion({ nombre }: { nombre?: string | null }) {
  const navigate = useNavigate();
  const signOut = useAuthStore((s) => s.signOut);
  const [saliendo, setSaliendo] = useState(false);

  async function handleSignOut() {
    if (saliendo) return;
    setSaliendo(true);
    try {
      await signOut();
      navigate(ROUTES.login, { replace: true });
    } finally {
      setSaliendo(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-50 px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="mt-8 rounded-2xl border border-sand-200 bg-white p-8 shadow-card">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Clock3 size={28} />
          </span>

          <h1 className="mt-5 text-2xl font-bold leading-snug tracking-tight text-stone-900">
            {nombre ? `Hola, ${nombre.split(' ')[0]}` : 'Cuenta en configuración'}
          </h1>
          <p className="mt-3 text-base font-normal leading-relaxed text-stone-500">
            Tu cuenta está siendo configurada por el equipo de JurisTech. Te notificaremos cuando
            esté lista.
          </p>

          <Button
            variant="outline"
            size="lg"
            className="mt-7 w-full"
            onClick={handleSignOut}
            disabled={saliendo}
            leftIcon={<LogOut size={16} />}
          >
            {saliendo ? 'Saliendo…' : 'Cerrar sesión'}
          </Button>
        </div>
      </div>
    </div>
  );
}
