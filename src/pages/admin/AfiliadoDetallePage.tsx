import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Coins,
  MinusCircle,
  Upload,
  FileText,
  Download,
  Pencil,
} from 'lucide-react';
import { Badge, Button, Card } from '@shared/ui';
import { TokensModal } from '@features/admin/components/TokensModal';
import type { TokensAccion } from '@features/admin/components/TokensModal';
import { SubirDocumentoModal } from '@features/admin/components/SubirDocumentoModal';
import { EditarSolicitudModal } from '@features/admin/components/EditarSolicitudModal';
import type { CambiosSolicitud } from '@features/admin/components/EditarSolicitudModal';
import {
  consumirTokens,
  getAfiliadoById,
  getDocumentosDeAfiliado,
  getSolicitudesAdmin,
  getTokenMovements,
  recargarTokens,
  updateSolicitud,
} from '@shared/services/admin-afiliados';
import {
  AFILIADO_ESTADO_LABELS,
  AFILIADO_ESTADO_TONE,
  SOLICITUD_ESTADO_LABELS,
  SOLICITUD_ESTADO_TONE,
  SOLICITUD_PRIORIDAD_TONE,
  SOLICITUD_TIPO_LABELS,
  TOKEN_MOVIMIENTO_LABELS,
} from '@shared/constants/labels';
import { formatDate, formatDateTime, formatNumber } from '@shared/lib/format';
import { ROUTES } from '@app/routes';
import { cn } from '@shared/lib/cn';
import type {
  Afiliado,
  Documento,
  Solicitud,
  TokenMovement,
  TokenMovementTipo,
} from '@shared/types/supabase';

const MOVIMIENTO_TONE: Record<TokenMovementTipo, string> = {
  recarga: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  consumo: 'bg-rose-50 text-rose-700 ring-rose-200',
  reembolso: 'bg-brand-50 text-brand-700 ring-brand-200',
  ajuste: 'bg-stone-100 text-stone-600 ring-stone-200',
};

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-widest text-stone-500">{label}</dt>
      <dd className="mt-1 text-sm text-stone-900">{valor}</dd>
    </div>
  );
}

export default function AfiliadoDetallePage() {
  const { id } = useParams<{ id: string }>();

  const [afiliado, setAfiliado] = useState<Afiliado | null>(null);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [movimientos, setMovimientos] = useState<TokenMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tokensAccion, setTokensAccion] = useState<TokensAccion | null>(null);
  const [modalDocumento, setModalDocumento] = useState(false);
  const [editando, setEditando] = useState<Solicitud | null>(null);
  /** Solicitud que espera confirmar cuántos tokens consumir al entregarse. */
  const [consumoPendiente, setConsumoPendiente] = useState<Solicitud | null>(null);

  const cargar = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [a, s, d, m] = await Promise.all([
        getAfiliadoById(id),
        getSolicitudesAdmin({ afiliadoId: id }),
        getDocumentosDeAfiliado(id),
        getTokenMovements(id),
      ]);
      setAfiliado(a);
      setSolicitudes(s);
      setDocumentos(d);
      setMovimientos(m);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el afiliado.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function confirmarMovimiento(cantidad: number, descripcion: string) {
    if (!id || !tokensAccion) return;
    if (tokensAccion === 'recarga') {
      await recargarTokens(id, cantidad, descripcion);
    } else {
      await consumirTokens(id, cantidad, descripcion);
    }
    await cargar();
  }

  async function confirmarConsumoDeSolicitud(cantidad: number, descripcion: string) {
    if (!id || !consumoPendiente) return;
    await consumirTokens(id, cantidad, descripcion, consumoPendiente.id);
    await updateSolicitud(consumoPendiente.id, {
      estado: 'entregada',
      tokensConsumidos: consumoPendiente.tokens_consumidos + cantidad,
    });
    await cargar();
  }

  async function guardarSolicitud(cambios: CambiosSolicitud) {
    if (!editando) return;
    const marcaEntregada = cambios.estado === 'entregada' && editando.estado !== 'entregada';

    await updateSolicitud(editando.id, {
      estado: cambios.estado,
      tokensEstimados: cambios.tokensEstimados ?? undefined,
      tokensConsumidos: cambios.tokensConsumidos,
      notas: cambios.notas,
      asignadoA: cambios.asignadoA,
    });

    const actualizada: Solicitud = {
      ...editando,
      estado: cambios.estado,
      tokens_estimados: cambios.tokensEstimados,
      tokens_consumidos: cambios.tokensConsumidos,
      notas_admin: cambios.notas.trim() || null,
      asignado_a: cambios.asignadoA.trim() || null,
    };

    await cargar();

    // Al pasar a "entregada" se pregunta cuántos tokens descontar: el
    // consumo real siempre pasa por la RPC para que quede en el historial.
    if (marcaEntregada) {
      setConsumoPendiente(actualizada);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sand-200 border-t-brand-500" />
      </div>
    );
  }

  if (error || !afiliado) {
    return (
      <Card className="px-6 py-16 text-center">
        <p className="text-sm font-medium text-stone-600">
          {error ?? 'No encontramos este afiliado.'}
        </p>
        <Link
          to={ROUTES.adminAfiliados}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft size={14} /> Volver a afiliados
        </Link>
      </Card>
    );
  }

  const disponibles = afiliado.tokens_disponibles;

  return (
    <div>
      <Link
        to={ROUTES.adminAfiliados}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-stone-900"
      >
        <ArrowLeft size={15} /> Afiliados
      </Link>

      {/* cabecera */}
      <Card className="mt-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold leading-snug tracking-tight text-stone-900">
              {afiliado.profile?.nombre ?? 'Sin nombre'}
            </h1>
            <p className="mt-1 text-sm text-stone-500">{afiliado.profile?.empresa ?? '—'}</p>
          </div>
          <Badge className={AFILIADO_ESTADO_TONE[afiliado.estado]} dot>
            {AFILIADO_ESTADO_LABELS[afiliado.estado]}
          </Badge>
        </div>

        <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Dato label="Plan" valor={afiliado.plan?.nombre ?? 'Sin plan'} />
          <Dato label="Teléfono" valor={afiliado.profile?.telefono ?? '—'} />
          <Dato label="Fecha de inicio" valor={afiliado.fecha_inicio} />
          <Dato label="Renovación" valor={afiliado.fecha_renovacion ?? 'No definida'} />
        </dl>
      </Card>

      {/* tokens */}
      <Card className="mt-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-stone-900">Tokens</h2>
          <div className="flex gap-2">
            <Button size="sm" leftIcon={<Coins size={15} />} onClick={() => setTokensAccion('recarga')}>
              Recargar
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<MinusCircle size={15} />}
              onClick={() => setTokensAccion('consumo')}
            >
              Consumir
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-4">
            <p className="text-2xl font-bold tabular-nums text-stone-900">
              {formatNumber(disponibles)}
            </p>
            <p className="mt-0.5 text-sm text-stone-600">Disponibles</p>
          </div>
          <div className="rounded-xl border border-sand-200 p-4">
            <p className="text-2xl font-bold tabular-nums text-stone-900">
              {formatNumber(afiliado.tokens_consumidos)}
            </p>
            <p className="mt-0.5 text-sm text-stone-600">Consumidos</p>
          </div>
          <div className="rounded-xl border border-sand-200 p-4">
            <p className="text-2xl font-bold tabular-nums text-stone-900">
              {formatNumber(afiliado.plan?.tokens_incluidos ?? 0)}
            </p>
            <p className="mt-0.5 text-sm text-stone-600">Incluidos en el plan</p>
          </div>
        </div>

        {movimientos.length > 0 && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-sand-200 text-xs uppercase tracking-widest text-stone-500">
                  <th className="pb-2 pr-4 font-semibold">Fecha</th>
                  <th className="pb-2 pr-4 font-semibold">Tipo</th>
                  <th className="pb-2 pr-4 font-semibold">Descripción</th>
                  <th className="pb-2 text-right font-semibold">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((m) => {
                  const variacion = m.tipo === 'consumo' ? -m.cantidad : m.cantidad;
                  return (
                    <tr key={m.id} className="border-b border-sand-100 last:border-0">
                      <td className="py-2.5 pr-4 text-stone-500">
                        {formatDateTime(m.created_at)}
                      </td>
                      <td className="py-2.5 pr-4">
                        <Badge className={MOVIMIENTO_TONE[m.tipo]} dot>
                          {TOKEN_MOVIMIENTO_LABELS[m.tipo]}
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4 text-stone-600">{m.descripcion ?? '—'}</td>
                      <td
                        className={cn(
                          'py-2.5 text-right font-semibold tabular-nums',
                          variacion >= 0 ? 'text-emerald-700' : 'text-rose-700',
                        )}
                      >
                        {variacion >= 0 ? '+' : '−'}
                        {formatNumber(Math.abs(variacion))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* solicitudes */}
      <Card className="mt-4 p-6">
        <h2 className="text-sm font-semibold text-stone-900">
          Solicitudes ({solicitudes.length})
        </h2>

        {solicitudes.length === 0 ? (
          <p className="mt-5 text-sm text-stone-400">Este afiliado aún no ha creado solicitudes.</p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-sand-200 text-xs uppercase tracking-widest text-stone-500">
                  <th className="pb-2 pr-4 font-semibold">Código</th>
                  <th className="pb-2 pr-4 font-semibold">Tipo</th>
                  <th className="pb-2 pr-4 font-semibold">Estado</th>
                  <th className="pb-2 pr-4 font-semibold">Tokens</th>
                  <th className="pb-2 pr-4 font-semibold">Fecha</th>
                  <th className="pb-2 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s) => (
                  <tr key={s.id} className="border-b border-sand-100 last:border-0">
                    <td className="py-3 pr-4 font-semibold text-stone-900">{s.codigo ?? '—'}</td>
                    <td className="py-3 pr-4">
                      <span className="text-stone-700">{SOLICITUD_TIPO_LABELS[s.tipo]}</span>
                      {s.prioridad === 'urgente' && (
                        <Badge className={`ml-2 ${SOLICITUD_PRIORIDAD_TONE.urgente}`}>
                          Urgente
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge className={SOLICITUD_ESTADO_TONE[s.estado]} dot>
                        {SOLICITUD_ESTADO_LABELS[s.estado]}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-stone-600">
                      <span className="tabular-nums">{s.tokens_consumidos}</span>
                      <span className="text-stone-400">
                        {' '}
                        / {s.tokens_estimados ?? '—'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-stone-500">{formatDate(s.created_at)}</td>
                    <td className="py-3">
                      <button
                        onClick={() => setEditando(s)}
                        title="Editar solicitud"
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                      >
                        <Pencil size={14} />
                        Gestionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* documentos */}
      <Card className="mt-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-stone-900">
            Documentos ({documentos.length})
          </h2>
          <Button size="sm" leftIcon={<Upload size={15} />} onClick={() => setModalDocumento(true)}>
            Subir documento
          </Button>
        </div>

        {documentos.length === 0 ? (
          <p className="mt-5 text-sm text-stone-400">Aún no hay documentos para este afiliado.</p>
        ) : (
          <ul className="mt-5 space-y-2">
            {documentos.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-3 rounded-xl border border-sand-200 p-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <FileText size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-stone-900">{d.nombre}</p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {d.solicitud?.codigo ? `${d.solicitud.codigo} · ` : ''}
                    {formatDate(d.created_at)}
                  </p>
                </div>
                <a
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                >
                  <Download size={14} />
                  Abrir
                </a>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <TokensModal
        open={tokensAccion !== null}
        accion={tokensAccion ?? 'recarga'}
        disponibles={disponibles}
        onClose={() => setTokensAccion(null)}
        onConfirmar={confirmarMovimiento}
      />

      <TokensModal
        open={consumoPendiente !== null}
        accion="consumo"
        disponibles={disponibles}
        descripcionInicial={
          consumoPendiente
            ? `Entrega de ${consumoPendiente.codigo ?? SOLICITUD_TIPO_LABELS[consumoPendiente.tipo]}`
            : ''
        }
        onClose={() => setConsumoPendiente(null)}
        onConfirmar={confirmarConsumoDeSolicitud}
      />

      <SubirDocumentoModal
        open={modalDocumento}
        afiliadoId={afiliado.id}
        solicitudes={solicitudes}
        onClose={() => setModalDocumento(false)}
        onSubido={() => void cargar()}
      />

      <EditarSolicitudModal
        open={editando !== null}
        solicitud={editando}
        onClose={() => setEditando(null)}
        onGuardar={guardarSolicitud}
      />
    </div>
  );
}
