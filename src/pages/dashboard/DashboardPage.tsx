import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Coins, TrendingDown, ClipboardList, FileText, ArrowRight } from 'lucide-react';
import { Badge, Card } from '@shared/ui';
import { PageContainer } from '@features/dashboard/components/PageContainer';
import { StatCard } from '@features/dashboard/components/StatCard';
import { useAfiliadoStore } from '@shared/store/afiliadoStore';
import { getMyDocumentos, getMySolicitudes } from '@shared/services/afiliado';
import {
  SOLICITUD_ESTADO_LABELS,
  SOLICITUD_ESTADO_TONE,
  SOLICITUD_TIPO_LABELS,
} from '@shared/constants/labels';
import { formatDate, formatNumber } from '@shared/lib/format';
import { ROUTES } from '@app/routes';
import type { Documento, Solicitud, SolicitudEstado } from '@shared/types/supabase';

const ESTADOS_ACTIVOS: SolicitudEstado[] = ['recibida', 'en_revision', 'en_proceso', 'entregada'];

export default function DashboardPage() {
  const { profile, afiliado } = useAfiliadoStore();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      try {
        const [s, d] = await Promise.all([getMySolicitudes(), getMyDocumentos()]);
        if (cancelado) return;
        setSolicitudes(s);
        setDocumentos(d);
      } catch (err) {
        if (!cancelado) {
          setError(err instanceof Error ? err.message : 'No se pudieron cargar tus datos.');
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    void cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  const activas = solicitudes.filter((s) => ESTADOS_ACTIVOS.includes(s.estado));
  const disponibles = afiliado?.tokens_disponibles ?? 0;
  const consumidos = afiliado?.tokens_consumidos ?? 0;
  const delPlan = afiliado?.plan?.tokens_incluidos ?? 0;
  const pct = delPlan > 0 ? Math.min(100, Math.round((disponibles / delPlan) * 100)) : 0;

  const nombre = profile?.nombre?.split(' ')[0] ?? 'afiliado';

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sand-200 border-t-brand-500" />
      </div>
    );
  }

  return (
    <PageContainer
      title={`Hola, ${nombre}`}
      description="Este es el resumen de tu afiliación con JurisTech."
    >
      {error && (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tokens disponibles"
          value={formatNumber(disponibles)}
          icon={Coins}
          accent
          hint={delPlan > 0 ? `de ${formatNumber(delPlan)} del plan` : undefined}
        />
        <StatCard label="Tokens consumidos" value={formatNumber(consumidos)} icon={TrendingDown} />
        <StatCard
          label="Solicitudes activas"
          value={formatNumber(activas.length)}
          icon={ClipboardList}
        />
        <StatCard label="Documentos" value={formatNumber(documentos.length)} icon={FileText} />
      </div>

      {/* consumo del plan */}
      <Card className="mt-4 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-stone-900">Consumo de tu plan</h3>
          <span className="text-sm text-stone-500">
            {formatNumber(disponibles)} / {formatNumber(delPlan)} tokens
          </span>
        </div>
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-sand-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-stone-500">
          {delPlan > 0
            ? `${pct}% disponible · plan ${afiliado?.plan?.nombre ?? '—'}`
            : 'Aún no tienes un plan asignado.'}
        </p>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* solicitudes activas */}
        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold text-stone-900">Solicitudes activas</h3>
            <Link
              to={ROUTES.requests}
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>

          {activas.length === 0 ? (
            <p className="mt-6 text-sm text-stone-400">No tienes solicitudes en curso.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {activas.slice(0, 3).map((s) => (
                <li key={s.id}>
                  <Link
                    to={ROUTES.requestDetail(s.id)}
                    className="flex items-center gap-3 rounded-xl border border-sand-200 p-3 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-stone-900">
                        {SOLICITUD_TIPO_LABELS[s.tipo]}
                      </p>
                      <p className="mt-0.5 text-xs text-stone-500">
                        {s.codigo ?? '—'} · {formatDate(s.created_at)}
                      </p>
                    </div>
                    <Badge className={SOLICITUD_ESTADO_TONE[s.estado]} dot>
                      {SOLICITUD_ESTADO_LABELS[s.estado]}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* documentos recientes */}
        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold text-stone-900">Documentos recientes</h3>
            <Link
              to={ROUTES.documents}
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>

          {documentos.length === 0 ? (
            <p className="mt-6 text-sm text-stone-400">Aún no tienes documentos.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {documentos.slice(0, 3).map((d) => (
                <li
                  key={d.id}
                  className="flex items-center gap-3 rounded-xl border border-sand-200 p-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <FileText size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-900">{d.nombre}</p>
                    <p className="mt-0.5 text-xs text-stone-500">{formatDate(d.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
