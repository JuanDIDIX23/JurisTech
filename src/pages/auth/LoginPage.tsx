import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Button, Input, Logo } from '@shared/ui';
import { ROUTES } from '@app/routes';
import { useAuthStore } from '@shared/store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.signIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const formValid = email.trim() !== '' && password !== '';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formValid || submitting) return;

    setError(null);
    setSubmitting(true);
    try {
      const profile = await signIn(email.trim(), password);
      navigate(profile?.rol === 'admin' ? ROUTES.admin : ROUTES.dashboard, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credenciales incorrectas, intenta de nuevo');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Link to={ROUTES.home}>
            <Logo />
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-sand-200 bg-white p-8 shadow-card">
          <h1 className="text-2xl font-bold leading-snug tracking-tight text-stone-900">
            Iniciar sesión
          </h1>
          <p className="mt-1.5 text-sm font-normal text-stone-500">
            Accede a tu panel de afiliado.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <Input
              type="email"
              placeholder="Correo electrónico"
              leftIcon={<Mail size={16} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={submitting}
              required
            />
            <Input
              type="password"
              placeholder="Contraseña"
              leftIcon={<Lock size={16} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={submitting}
              required
            />

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={!formValid || submitting}
              rightIcon={submitting ? undefined : <LogIn size={16} />}
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Entrando…
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm font-normal text-stone-500">
            ¿Aún no tienes cuenta?{' '}
            <Link to={ROUTES.register} className="font-semibold text-brand-600 hover:text-brand-700">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
