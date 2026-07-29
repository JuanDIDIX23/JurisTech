import { lazy, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Sparkles, CalendarCheck, CalendarRange } from 'lucide-react';
import { Badge, Card } from '@shared/ui';
import { StatCard } from '@features/dashboard/components/StatCard';
import { ChartCard } from '@features/admin/components/ChartCard';
import { leadsPorDia, leadsPorEstado } from '@features/admin/lib/aggregations';
import { getLeads, getStats } from '@shared/services/admin';
import { LEAD_ESTADO_LABELS, LEAD_ESTADO_TONE } from '@shared/constants/labels';
import { formatDate, formatNumber } from '@shared/lib/format';
import { ROUTES } from '@app/routes';
import type { AdminStats, Lead } from '@shared/types/supabase';

// recharts fuera del chunk principal.
const SeriesLineChart = lazy(() => import('@features/admin/components/charts/SeriesLineChart'));
const CategoriaPieChart = lazy(
  () => import('@features/admin/components/charts/CategoriaPieChart'),
);

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      setLoading(true);
      setError(null);
      try {
        const [estadisticas, listaLeads] = await Promise.all([getStats(), getLeads()]);
        if (cancelado) return;
        setStats(estadisticas);
        setLeads(listaLeads);
      } catch (err) {
        if (!cancelado) {
          setError(err instanceof Error ? err.message : 'No se pudieron cargar los datos.');
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

  const serieDiaria = useMemo(() => leadsPorDia(leads, 30), [leads]);
  const porEstado = useMemo(() => leadsPorEstado(leads), [leads]);
  const ultimos = useMemo(() => leads.slice(0, 5), [leads]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sand-200 border-t-brand-500" />
      </div>
    );
  }

  if (error) {
    return (
      <p
        role="alert"
        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
      >
        {error}
      </p>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold leading-snug tracking-tight text-stone-900">
        Panel de administración · JurisTech
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total leads"
          value={formatNumber(stats?.total_leads ?? 0)}
          icon={Users}
          accent
        />
        <StatCard
          label="Leads nuevos"
          value={formatNumber(stats?.leads_nuevos ?? 0)}
          icon={Sparkles}
          hint="Sin contactar"
        />
        <StatCard
          label="Citas hoy"
          value={formatNumber(stats?.citas_hoy ?? 0)}
          icon={CalendarCheck}
        />
        <StatCard
          label="Citas esta semana"
          value={formatNumber(stats?.citas_semana ?? 0)}
          icon={CalendarRange}
          hint="Próximos 7 días"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Leads por día · últimos 30 días" vacio={leads.length === 0}>
            <SeriesLineChart data={serieDiaria} />
          </ChartCard>
        </div>
        <ChartCard title="Leads por estado" vacio={porEstado.length === 0}>
          <CategoriaPieChart data={porEstado} />
        </ChartCard>
      </div>

      <Card className="mt-6 p-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-stone-900">Últimos leads</h3>
          <Link
            to={ROUTES.adminLeads}
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Ver todos
          </Link>
        </div>

        {ultimos.length === 0 ? (
          <p className="mt-6 text-sm text-stone-400">Aún no hay leads registrados.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-sand-200 text-xs uppercase tracking-widest text-stone-500">
                  <th className="pb-2 pr-4 font-semibold">Nombre</th>
                  <th className="pb-2 pr-4 font-semibold">Servicio</th>
                  <th className="pb-2 pr-4 font-semibold">Estado</th>
                  <th className="pb-2 font-semibold">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {ultimos.map((lead) => (
                  <tr key={lead.id} className="border-b border-sand-100 last:border-0">
                    <td className="py-3 pr-4 font-medium text-stone-900">{lead.nombre}</td>
                    <td className="py-3 pr-4 text-stone-600">{lead.servicio}</td>
                    <td className="py-3 pr-4">
                      <Badge className={LEAD_ESTADO_TONE[lead.estado]} dot>
                        {LEAD_ESTADO_LABELS[lead.estado]}
                      </Badge>
                    </td>
                    <td className="py-3 text-stone-500">{formatDate(lead.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
