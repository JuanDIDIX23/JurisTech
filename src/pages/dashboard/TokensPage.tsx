import { useEffect, useMemo, useState } from 'react';
import { Coins, Wallet, TrendingDown, CalendarClock } from 'lucide-react';
import { Badge, Card } from '@shared/ui';
import { PageContainer } from '@features/dashboard/components/PageContainer';
import { StatCard } from '@features/dashboard/components/StatCard';
import { useAfiliadoStore } from '@shared/store/afiliadoStore';
import { getMyTokenMovements } from '@shared/services/afiliado';
import { TOKEN_MOVIMIENTO_LABELS } from '@shared/constants/labels';
import { formatDateTime, formatNumber } from '@shared/lib/format';
import { cn } from '@shared/lib/cn';
import type { TokenMovement, TokenMovementTipo } from '@shared/types/supabase';

const MOVIMIENTO_TONE: Record<TokenMovementTipo, string> = {
  recarga: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  consumo: 'bg-rose-50 text-rose-700 ring-rose-200',
  reembolso: 'bg-brand-50 text-brand-700 ring-brand-200',
  ajuste: 'bg-stone-100 text-stone-600 ring-stone-200',
};

/** Variación de saldo que produce el movimiento. */
function delta(m: TokenMovement): number {
  return m.tipo === 'consumo' ? -m.cantidad : m.cantidad;
}

interface MovimientoConSaldo extends TokenMovement {
  saldoResultante: number;
}

export default function TokensPage() {
  const afiliado = useAfiliadoStore((s) => s.afiliado);
  const [movimientos, setMovimientos] = useState<TokenMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    void getMyTokenMovements()
      .then((data) => {
        if (!cancelado) setMovimientos(data);
      })
      .catch((err: unknown) => {
        if (!cancelado) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar tu historial.');
        }
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const disponibles = afiliado?.tokens_disponibles ?? 0;
  const consumidos = afiliado?.tokens_consumidos ?? 0;
  const delPlan = afiliado?.plan?.tokens_incluidos ?? 0;
  const pct = delPlan > 0 ? Math.min(100, Math.round((disponibles / delPlan) * 100)) : 0;

  /**
   * `token_movements` no guarda el saldo posterior, así que se reconstruye
   * hacia atrás: la fila más reciente refleja el saldo actual y a cada
   * movimiento anterior se le resta su propia variación.
   */
  const conSaldo = useMemo<MovimientoConSaldo[]>(() => {
    let saldo = disponibles;
    return movimientos.map((m) => {
      const fila: MovimientoConSaldo = { ...m, saldoResultante: saldo };
      saldo -= delta(m);
      return fila;
    });
  }, [movimientos, disponibles]);

  return (
    <PageContainer title="Tokens" description="Balance y movimientos de tu bolsa.">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Tokens disponibles"
          value={formatNumber(disponibles)}
          icon={Coins}
          accent
          hint={delPlan > 0 ? `de ${formatNumber(delPlan)} del plan` : undefined}
        />
        <StatCard label="Tokens consumidos" value={formatNumber(consumidos)} icon={TrendingDown} />
        <StatCard
          label="Plan contratado"
          value={afiliado?.plan?.nombre ?? '—'}
          icon={Wallet}
          hint={delPlan > 0 ? `${formatNumber(delPlan)} tokens incluidos` : 'Sin plan asignado'}
        />
      </div>

      <Card className="mt-4 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-stone-900">Balance de tu bolsa</h3>
          <span className="text-sm text-stone-500">
            {formatNumber(disponibles)} / {formatNumber(delPlan)} tokens · {pct}%
          </span>
        </div>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-sand-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        {afiliado?.fecha_renovacion && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-stone-500">
            <CalendarClock size={14} className="text-brand-500" />
            Renovación el {afiliado.fecha_renovacion}
          </p>
        )}
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
        <div className="border-b border-sand-200 px-5 py-4">
          <h3 className="text-sm font-semibold text-stone-900">Historial de movimientos</h3>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-sand-200 border-t-brand-500" />
          </div>
        ) : conSaldo.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-stone-400">
            Todavía no hay movimientos en tu bolsa de tokens.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-sand-200 bg-sand-50 text-xs uppercase tracking-widest text-stone-500">
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Descripción</th>
                  <th className="px-4 py-3 text-right font-semibold">Cantidad</th>
                  <th className="px-4 py-3 text-right font-semibold">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {conSaldo.map((m) => {
                  const variacion = delta(m);
                  return (
                    <tr key={m.id} className="border-b border-sand-100 last:border-0">
                      <td className="px-4 py-3 text-stone-500">{formatDateTime(m.created_at)}</td>
                      <td className="px-4 py-3">
                        <Badge className={MOVIMIENTO_TONE[m.tipo]} dot>
                          {TOKEN_MOVIMIENTO_LABELS[m.tipo]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-stone-600">{m.descripcion ?? '—'}</td>
                      <td
                        className={cn(
                          'px-4 py-3 text-right font-semibold tabular-nums',
                          variacion >= 0 ? 'text-emerald-700' : 'text-rose-700',
                        )}
                      >
                        {variacion >= 0 ? '+' : '−'}
                        {formatNumber(Math.abs(variacion))}
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums text-stone-900">
                        {formatNumber(m.saldoResultante)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
