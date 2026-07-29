import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ClipboardList, ChevronRight } from 'lucide-react';
import { Badge, Button, Card, Select } from '@shared/ui';
import { PageContainer } from '@features/dashboard/components/PageContainer';
import { NuevaSolicitudModal } from '@features/dashboard/components/NuevaSolicitudModal';
import { getMySolicitudes } from '@shared/services/afiliado';
import { useAfiliadoStore } from '@shared/store/afiliadoStore';
import {
  SOLICITUD_ESTADO_LABELS,
  SOLICITUD_ESTADO_TONE,
  SOLICITUD_PRIORIDAD_TONE,
  SOLICITUD_TIPO_LABELS,
} from '@shared/constants/labels';
import { formatDate } from '@shared/lib/format';
import { ROUTES } from '@app/routes';
import type { Solicitud, SolicitudEstado, SolicitudTipo } from '@shared/types/supabase';

const ESTADOS = Object.keys(SOLICITUD_ESTADO_LABELS) as SolicitudEstado[];
const TIPOS = Object.keys(SOLICITUD_TIPO_LABELS) as SolicitudTipo[];

const OPCIONES_ESTADO = [
  { value: '', label: 'Todos los estados' },
  ...ESTADOS.map((e) => ({ value: e, label: SOLICITUD_ESTADO_LABELS[e] })),
];

const OPCIONES_TIPO = [
  { value: '', label: 'Todos los tipos' },
  ...TIPOS.map((t) => ({ value: t, label: SOLICITUD_TIPO_LABELS[t] })),
];

export default function SolicitudesPage() {
  const recargarAfiliado = useAfiliadoStore((s) => s.cargar);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [estado, setEstado] = useState('');
  const [tipo, setTipo] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSolicitudes(await getMySolicitudes());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar tus solicitudes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const filtradas = useMemo(
    () =>
      solicitudes.filter((s) => {
        if (estado && s.estado !== estado) return false;
        if (tipo && s.tipo !== tipo) return false;
        return true;
      }),
    [solicitudes, estado, tipo],
  );

  function handleCreada(creada: Solicitud) {
    setSolicitudes((actuales) => [creada, ...actuales]);
    // El alta no consume tokens, pero sí puede cambiar contadores del store.
    void recargarAfiliado(true);
  }

  return (
    <PageContainer
      title="Solicitudes"
      description="Consulta el estado de tus gestiones y crea nuevas."
      actions={
        <Button leftIcon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
          Nueva solicitud
        </Button>
      }
    >
      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            options={OPCIONES_ESTADO}
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            aria-label="Filtrar por estado"
          />
          <Select
            options={OPCIONES_TIPO}
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            aria-label="Filtrar por tipo"
          />
        </div>
      </Card>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {error}
        </p>
      )}

      {loading ? (
        <Card className="mt-4 flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sand-200 border-t-brand-500" />
        </Card>
      ) : filtradas.length === 0 ? (
        <Card className="mt-4 px-6 py-16 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sand-100 text-stone-400">
            <ClipboardList size={22} />
          </span>
          <p className="mt-4 text-sm font-medium text-stone-600">
            {solicitudes.length === 0
              ? 'Todavía no has creado ninguna solicitud.'
              : 'No hay solicitudes que coincidan con los filtros.'}
          </p>
          {solicitudes.length === 0 && (
            <Button className="mt-5" leftIcon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
              Crear la primera
            </Button>
          )}
        </Card>
      ) : (
        <Card className="mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-sand-200 bg-sand-50 text-xs uppercase tracking-widest text-stone-500">
                  <th className="px-4 py-3 font-semibold">Código</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Tokens est.</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtradas.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-sand-100 transition-colors last:border-0 hover:bg-sand-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={ROUTES.requestDetail(s.id)}
                        className="font-semibold text-brand-700 hover:text-brand-800"
                      >
                        {s.codigo ?? '—'}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-stone-900">{SOLICITUD_TIPO_LABELS[s.tipo]}</span>
                      {s.prioridad === 'urgente' && (
                        <Badge className={`ml-2 ${SOLICITUD_PRIORIDAD_TONE.urgente}`}>
                          Urgente
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={SOLICITUD_ESTADO_TONE[s.estado]} dot>
                        {SOLICITUD_ESTADO_LABELS[s.estado]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {s.tokens_estimados ?? 'Por definir'}
                    </td>
                    <td className="px-4 py-3 text-stone-500">{formatDate(s.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={ROUTES.requestDetail(s.id)}
                        aria-label={`Ver ${s.codigo ?? 'solicitud'}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-sand-100 hover:text-stone-700"
                      >
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <NuevaSolicitudModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreada={handleCreada}
      />
    </PageContainer>
  );
}
