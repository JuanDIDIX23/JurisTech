import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Pencil, ExternalLink } from 'lucide-react';
import { Badge, Button, Card, Input, Select } from '@shared/ui';
import { EditarSolicitudModal } from '@features/admin/components/EditarSolicitudModal';
import type { CambiosSolicitud } from '@features/admin/components/EditarSolicitudModal';
import { getSolicitudesAdmin, updateSolicitud } from '@shared/services/admin-afiliados';
import {
  SOLICITUD_ESTADO_LABELS,
  SOLICITUD_ESTADO_TONE,
  SOLICITUD_PRIORIDAD_LABELS,
  SOLICITUD_PRIORIDAD_TONE,
  SOLICITUD_TIPO_LABELS,
} from '@shared/constants/labels';
import { descargarCSV, generarCSV } from '@shared/lib/csv';
import type { ColumnaCSV } from '@shared/lib/csv';
import { formatDate } from '@shared/lib/format';
import { ROUTES } from '@app/routes';
import { cn } from '@shared/lib/cn';
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

const OPCIONES_PRIORIDAD = [
  { value: '', label: 'Todas las prioridades' },
  { value: 'normal', label: 'Normal' },
  { value: 'urgente', label: 'Urgente' },
];

const COLUMNAS_CSV: ColumnaCSV<Solicitud>[] = [
  { header: 'Código', valor: (s) => s.codigo },
  { header: 'Afiliado', valor: (s) => s.afiliado?.profile?.nombre },
  { header: 'Empresa', valor: (s) => s.afiliado?.profile?.empresa },
  { header: 'Tipo', valor: (s) => SOLICITUD_TIPO_LABELS[s.tipo] },
  { header: 'Estado', valor: (s) => SOLICITUD_ESTADO_LABELS[s.estado] },
  { header: 'Prioridad', valor: (s) => SOLICITUD_PRIORIDAD_LABELS[s.prioridad] },
  { header: 'Tokens estimados', valor: (s) => s.tokens_estimados },
  { header: 'Tokens consumidos', valor: (s) => s.tokens_consumidos },
  { header: 'Responsable', valor: (s) => s.asignado_a },
  { header: 'Descripción', valor: (s) => s.descripcion },
  { header: 'Notas admin', valor: (s) => s.notas_admin },
  { header: 'Fecha', valor: (s) => formatDate(s.created_at) },
];

export default function SolicitudesAdminPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [estado, setEstado] = useState('');
  const [tipo, setTipo] = useState('');
  const [prioridad, setPrioridad] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const [actualizando, setActualizando] = useState<string | null>(null);
  const [editando, setEditando] = useState<Solicitud | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSolicitudes(await getSolicitudesAdmin());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las solicitudes.');
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
        if (prioridad && s.prioridad !== prioridad) return false;
        const fecha = s.created_at.slice(0, 10);
        if (desde && fecha < desde) return false;
        if (hasta && fecha > hasta) return false;
        return true;
      }),
    [solicitudes, estado, tipo, prioridad, desde, hasta],
  );

  async function cambiarEstado(solicitud: Solicitud, nuevo: SolicitudEstado) {
    setActualizando(solicitud.id);
    const previo = solicitud.estado;
    setSolicitudes((actuales) =>
      actuales.map((s) => (s.id === solicitud.id ? { ...s, estado: nuevo } : s)),
    );
    try {
      await updateSolicitud(solicitud.id, { estado: nuevo });
    } catch (err) {
      setSolicitudes((actuales) =>
        actuales.map((s) => (s.id === solicitud.id ? { ...s, estado: previo } : s)),
      );
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la solicitud.');
    } finally {
      setActualizando(null);
    }
  }

  async function guardarSolicitud(cambios: CambiosSolicitud) {
    if (!editando) return;
    await updateSolicitud(editando.id, {
      estado: cambios.estado,
      tokensEstimados: cambios.tokensEstimados ?? undefined,
      tokensConsumidos: cambios.tokensConsumidos,
      notas: cambios.notas,
      asignadoA: cambios.asignadoA,
    });
    await cargar();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold leading-snug tracking-tight text-stone-900">
            Solicitudes
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {filtradas.length} de {solicitudes.length} registros
          </p>
        </div>
        <Button
          variant="outline"
          leftIcon={<Download size={16} />}
          disabled={filtradas.length === 0}
          onClick={() =>
            descargarCSV(
              `solicitudes-${new Date().toISOString().slice(0, 10)}.csv`,
              generarCSV(filtradas, COLUMNAS_CSV),
            )
          }
        >
          Exportar CSV
        </Button>
      </div>

      <Card className="mt-6 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
          <Select
            options={OPCIONES_PRIORIDAD}
            value={prioridad}
            onChange={(e) => setPrioridad(e.target.value)}
            aria-label="Filtrar por prioridad"
          />
          <label className="flex items-center gap-2 text-sm text-stone-500">
            <span className="shrink-0">Desde</span>
            <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-500">
            <span className="shrink-0">Hasta</span>
            <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </label>
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

      <Card className="mt-4 overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-sand-200 border-t-brand-500" />
          </div>
        ) : filtradas.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-stone-400">
            {solicitudes.length === 0
              ? 'Todavía no hay solicitudes de ningún afiliado.'
              : 'No hay solicitudes que coincidan con los filtros.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead>
                <tr className="border-b border-sand-200 bg-sand-50 text-xs uppercase tracking-widest text-stone-500">
                  <th className="px-4 py-3 font-semibold">Código</th>
                  <th className="px-4 py-3 font-semibold">Afiliado</th>
                  <th className="px-4 py-3 font-semibold">Empresa</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Prioridad</th>
                  <th className="px-4 py-3 font-semibold">Tokens est.</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((s) => (
                  <tr key={s.id} className="border-b border-sand-100 last:border-0">
                    <td className="px-4 py-3 font-semibold text-stone-900">{s.codigo ?? '—'}</td>
                    <td className="px-4 py-3 text-stone-700">
                      {s.afiliado?.profile?.nombre ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {s.afiliado?.profile?.empresa ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-stone-600">{SOLICITUD_TIPO_LABELS[s.tipo]}</td>
                    <td className="px-4 py-3">
                      <select
                        value={s.estado}
                        disabled={actualizando === s.id}
                        onChange={(e) =>
                          void cambiarEstado(s, e.target.value as SolicitudEstado)
                        }
                        aria-label={`Estado de ${s.codigo ?? 'solicitud'}`}
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-opacity',
                          SOLICITUD_ESTADO_TONE[s.estado],
                          actualizando === s.id && 'opacity-50',
                        )}
                      >
                        {ESTADOS.map((e) => (
                          <option key={e} value={e}>
                            {SOLICITUD_ESTADO_LABELS[e]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={SOLICITUD_PRIORIDAD_TONE[s.prioridad]}>
                        {SOLICITUD_PRIORIDAD_LABELS[s.prioridad]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-stone-600">
                      {s.tokens_estimados ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-stone-500">{formatDate(s.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditando(s)}
                          title="Gestionar solicitud"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-brand-700 transition-colors hover:bg-brand-50"
                        >
                          <Pencil size={15} />
                        </button>
                        <Link
                          to={ROUTES.adminAfiliadoDetalle(s.afiliado_id)}
                          title="Ver afiliado"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-sand-100 hover:text-stone-700"
                        >
                          <ExternalLink size={15} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <EditarSolicitudModal
        open={editando !== null}
        solicitud={editando}
        onClose={() => setEditando(null)}
        onGuardar={guardarSolicitud}
      />
    </div>
  );
}
