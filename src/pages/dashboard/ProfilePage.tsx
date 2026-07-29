import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, Phone, Save, CheckCircle2, LogOut, CreditCard } from 'lucide-react';
import { Badge, Button, Card, Input } from '@shared/ui';
import { PageContainer } from '@features/dashboard/components/PageContainer';
import { useAfiliadoStore } from '@shared/store/afiliadoStore';
import { useAuthStore } from '@shared/store/authStore';
import { updateMyProfile } from '@shared/services/afiliado';
import { AFILIADO_ESTADO_LABELS, AFILIADO_ESTADO_TONE } from '@shared/constants/labels';
import { formatNumber } from '@shared/lib/format';
import { ROUTES } from '@app/routes';

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-widest text-stone-500">{label}</dt>
      <dd className="mt-1 text-sm text-stone-900">{valor}</dd>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, afiliado, cargar } = useAfiliadoStore();
  const signOut = useAuthStore((s) => s.signOut);
  const limpiar = useAfiliadoStore((s) => s.limpiar);

  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [telefono, setTelefono] = useState('');

  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    setNombre(profile?.nombre ?? '');
    setEmpresa(profile?.empresa ?? '');
    setTelefono(profile?.telefono ?? '');
  }, [profile]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (guardando) return;

    if (nombre.trim() === '') {
      setError('El nombre no puede quedar vacío.');
      return;
    }

    setError(null);
    setGuardando(true);
    try {
      await updateMyProfile({ nombre, empresa, telefono });
      await cargar(true);
      setGuardado(true);
      window.setTimeout(() => setGuardado(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron guardar tus datos.');
    } finally {
      setGuardando(false);
    }
  }

  async function handleSignOut() {
    if (saliendo) return;
    setSaliendo(true);
    try {
      await signOut();
      limpiar();
      navigate(ROUTES.login, { replace: true });
    } finally {
      setSaliendo(false);
    }
  }

  return (
    <PageContainer title="Perfil" description="Tus datos y los de tu afiliación.">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-stone-900">Datos de contacto</h2>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-stone-700">Nombre completo</span>
              <Input
                className="mt-1.5"
                leftIcon={<User size={16} />}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={guardando}
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-stone-700">Empresa</span>
              <Input
                className="mt-1.5"
                leftIcon={<Building2 size={16} />}
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                disabled={guardando}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-stone-700">Teléfono</span>
              <Input
                className="mt-1.5"
                type="tel"
                leftIcon={<Phone size={16} />}
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                disabled={guardando}
              />
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700"
              >
                {error}
              </p>
            )}

            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" disabled={guardando} leftIcon={<Save size={16} />}>
                {guardando ? 'Guardando…' : 'Guardar cambios'}
              </Button>
              {guardado && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                  <CheckCircle2 size={16} />
                  Guardado
                </span>
              )}
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          {afiliado && (
            <Card className="p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                  <CreditCard size={16} className="text-brand-600" />
                  Tu afiliación
                </h2>
                <Badge className={AFILIADO_ESTADO_TONE[afiliado.estado]} dot>
                  {AFILIADO_ESTADO_LABELS[afiliado.estado]}
                </Badge>
              </div>

              <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                <Dato label="Plan actual" valor={afiliado.plan?.nombre ?? 'Sin plan asignado'} />
                <Dato
                  label="Tokens del plan"
                  valor={
                    afiliado.plan ? formatNumber(afiliado.plan.tokens_incluidos) : '—'
                  }
                />
                <Dato
                  label="Tokens disponibles"
                  valor={formatNumber(afiliado.tokens_disponibles)}
                />
                <Dato
                  label="Tokens consumidos"
                  valor={formatNumber(afiliado.tokens_consumidos)}
                />
                <Dato label="Fecha de inicio" valor={afiliado.fecha_inicio} />
                <Dato label="Renovación" valor={afiliado.fecha_renovacion ?? 'No definida'} />
              </dl>

              <p className="mt-5 border-t border-sand-200 pt-4 text-xs text-stone-500">
                Los datos de tu plan los gestiona el equipo de JurisTech. Escríbenos si necesitas
                modificarlos.
              </p>
            </Card>
          )}

          <Card className="p-6">
            <h2 className="text-sm font-semibold text-stone-900">Sesión</h2>
            <p className="mt-1.5 text-sm text-stone-500">
              Cierra sesión en este dispositivo.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={handleSignOut}
              disabled={saliendo}
              leftIcon={<LogOut size={16} />}
            >
              {saliendo ? 'Saliendo…' : 'Cerrar sesión'}
            </Button>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
