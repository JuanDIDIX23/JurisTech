import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { User, Building2, Phone, Mail, Lock, UserPlus, CheckCircle2 } from 'lucide-react';
import { Button, Input, Logo } from '@shared/ui';
import { ROUTES } from '@app/routes';
import { supabase } from '@shared/lib/supabase';

/** Traduce los errores de Supabase Auth a mensajes en español. */
function mensajeDeError(mensaje: string): string {
  const m = mensaje.toLowerCase();
  if (m.includes('already registered') || m.includes('already been registered')) {
    return 'Ya existe una cuenta con este correo. Inicia sesión.';
  }
  if (m.includes('password') && m.includes('6')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (m.includes('weak password')) {
    return 'La contraseña es demasiado débil. Usa una más larga.';
  }
  if (m.includes('valid email') || m.includes('invalid format')) {
    return 'El correo no tiene un formato válido.';
  }
  if (m.includes('for security purposes') || m.includes('rate limit')) {
    return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
  }
  return 'No pudimos crear tu cuenta. Intenta de nuevo.';
}

export default function RegisterPage() {
  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const formValid =
    nombre.trim() !== '' &&
    empresa.trim() !== '' &&
    telefono.trim() !== '' &&
    email.trim() !== '' &&
    password !== '' &&
    confirmPassword !== '';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formValid || submitting) return;

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        // Los datos viajan como metadata: el trigger handle_new_user los
        // copia a `profiles`, de modo que el registro funciona incluso
        // cuando la confirmación por correo deja la sesión pendiente.
        options: {
          data: {
            nombre: nombre.trim(),
            empresa: empresa.trim(),
            telefono: telefono.trim(),
          },
        },
      });

      if (signUpError) {
        setError(mensajeDeError(signUpError.message));
        return;
      }

      // Si el proyecto no exige confirmación por correo, ya hay sesión activa
      // y podemos completar el perfil de inmediato.
      if (data.session && data.user) {
        await supabase
          .from('profiles')
          .update({
            nombre: nombre.trim(),
            empresa: empresa.trim(),
            telefono: telefono.trim(),
          })
          .eq('id', data.user.id);
      }

      setSuccess(true);
    } catch {
      setError('No pudimos crear tu cuenta. Intenta de nuevo.');
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
          {success ? (
            <div className="text-center">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <CheckCircle2 size={28} />
              </span>
              <h1 className="mt-5 text-2xl font-bold leading-snug tracking-tight text-stone-900">
                Cuenta creada
              </h1>
              <p className="mt-2 text-base font-normal leading-relaxed text-stone-500">
                Revisa tu correo para confirmar tu cuenta.
              </p>
              <Link to={ROUTES.login} className="mt-6 block">
                <Button size="lg" className="w-full">
                  Ir a iniciar sesión
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold leading-snug tracking-tight text-stone-900">
                Crear cuenta
              </h1>
              <p className="mt-1.5 text-sm font-normal text-stone-500">
                Regístrate como empresa afiliada.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                <Input
                  placeholder="Nombre completo"
                  leftIcon={<User size={16} />}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  autoComplete="name"
                  disabled={submitting}
                  required
                />
                <Input
                  placeholder="Empresa"
                  leftIcon={<Building2 size={16} />}
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  autoComplete="organization"
                  disabled={submitting}
                  required
                />
                <Input
                  type="tel"
                  placeholder="Teléfono"
                  leftIcon={<Phone size={16} />}
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  autoComplete="tel"
                  disabled={submitting}
                  required
                />
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
                  autoComplete="new-password"
                  disabled={submitting}
                  required
                />
                <Input
                  type="password"
                  placeholder="Confirmar contraseña"
                  leftIcon={<Lock size={16} />}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
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
                  rightIcon={submitting ? undefined : <UserPlus size={16} />}
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Creando cuenta…
                    </>
                  ) : (
                    'Crear cuenta'
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm font-normal text-stone-500">
                ¿Ya tienes cuenta?{' '}
                <Link
                  to={ROUTES.login}
                  className="font-semibold text-brand-600 hover:text-brand-700"
                >
                  Inicia sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
