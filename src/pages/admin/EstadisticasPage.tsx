import { lazy, useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { Badge, Button, Card } from '@shared/ui';
import { ChartCard } from '@features/admin/components/ChartCard';
import {
  contarPorEstado,
  leadsPorMes,
  leadsPorServicio,
} from '@features/admin/lib/aggregations';
import { getLeads } from '@shared/services/admin';
import { LEAD_ESTADO_LABELS, LEAD_ESTADO_TONE } from '@shared/constants/labels';
import { descargarCSV, generarCSV } from '@shared/lib/csv';
import type { ColumnaCSV } from '@shared/lib/csv';
import { formatDate, formatNumber } from '@shared/lib/format';
import type { Lead, LeadEstado } from '@shared/types/supabase';

const SeriesBarChart = lazy(() => import('@features/admin/components/charts/SeriesBarChart'));
const CategoriaPieChart = lazy(
  () => import('@features/admin/components/charts/CategoriaPieChart'),
);

const COLUMNAS_CSV: ColumnaCSV<Lead>[] = [
  { header: 'Nombre', valor: (l) => l.nombre },
  { header: 'Empresa', valor: (l) => l.empresa },
  { header: 'Servicio', valor: (l) => l.servicio },
  { header: 'Teléfono', valor: (l) => l.telefono },
  { header: 'Correo', valor: (l) => l.correo },
  { header: 'Estado', valor: (l) => LEAD_ESTADO_LABELS[l.estado] },
  { header: 'Mensaje', valor: (l) => l.mensaje },
  { header: 'Notas', valor: (l) => l.notas },
  { header: 'Fecha', valor: (l) => formatDate(l.created_at) },
];

export default function EstadisticasPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    void getLeads()
      .then((data) => {
        if (!cancelado) setLeads(data);
      })
      .catch((err: unknown) => {
        if (!cancelado) {
          setError(err instanceof Error ? err.message : 'No se pudieron cargar los datos.');
        }
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const porMes = useMemo(() => leadsPorMes(leads, 6), [leads]);
  const porServicio = useMemo(() => leadsPorServicio(leads), [leads]);
  const porEstado = useMemo(() => contarPorEstado(leads), [leads]);

  const estados = Object.keys(LEAD_ESTADO_LABELS) as LeadEstado[];

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold leading-snug tracking-tight text-stone-900">
            Estadísticas
          </h1>
          <p className="mt-1 text-sm text-stone-500">{formatNumber(leads.length)} leads en total</p>
        </div>
        <Button
          variant="outline"
          leftIcon={<Download size={16} />}
          disabled={leads.length === 0}
          onClick={() =>
            descargarCSV(
              `leads-completo-${new Date().toISOString().slice(0, 10)}.csv`,
              generarCSV(leads, COLUMNAS_CSV),
            )
          }
        >
          Exportar CSV completo
        </Button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Leads por mes · últimos 6 meses" vacio={leads.length === 0}>
          <SeriesBarChart data={porMes} />
        </ChartCard>
        <ChartCard title="Leads por servicio" vacio={porServicio.length === 0}>
          <CategoriaPieChart data={porServicio} />
        </ChartCard>
      </div>

      <Card className="mt-4 p-5">
        <h3 className="text-sm font-semibold text-stone-900">Resumen por estado</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[380px] text-left text-sm">
            <thead>
              <tr className="border-b border-sand-200 text-xs uppercase tracking-widest text-stone-500">
                <th className="pb-2 pr-4 font-semibold">Estado</th>
                <th className="pb-2 pr-4 font-semibold">Total</th>
                <th className="pb-2 font-semibold">Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              {estados.map((estado) => {
                const total = porEstado[estado];
                const pct = leads.length === 0 ? 0 : Math.round((total / leads.length) * 100);
                return (
                  <tr key={estado} className="border-b border-sand-100 last:border-0">
                    <td className="py-3 pr-4">
                      <Badge className={LEAD_ESTADO_TONE[estado]} dot>
                        {LEAD_ESTADO_LABELS[estado]}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 font-medium text-stone-900">{formatNumber(total)}</td>
                    <td className="py-3 text-stone-600">{pct}%</td>
                  </tr>
                );
              })}
              <tr className="border-t border-sand-200 font-semibold">
                <td className="py-3 pr-4 text-stone-900">Total</td>
                <td className="py-3 pr-4 text-stone-900">{formatNumber(leads.length)}</td>
                <td className="py-3 text-stone-600">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
