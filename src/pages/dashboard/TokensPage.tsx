import { Coins, ShoppingCart, Flame, Wallet, ArrowDownLeft, ArrowUpRight, Plus } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardBody, Badge } from '@shared/ui';
import { PageContainer } from '@features/dashboard/components/PageContainer';
import { StatCard } from '@features/dashboard/components/StatCard';
import { useAppStore } from '@shared/store/useAppStore';
import { TOKEN_MOVEMENT_LABELS } from '@shared/constants/labels';
import { formatNumber, formatDateTime } from '@shared/lib/format';
import { cn } from '@shared/lib/cn';
import type { TokenMovementType } from '@shared/types';

const MOVEMENT_TONE: Record<TokenMovementType, string> = {
  purchase: 'bg-brand-50 text-brand-700 ring-brand-200',
  consumption: 'bg-rose-50 text-rose-700 ring-rose-200',
  refund: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  bonus: 'bg-violet-50 text-violet-700 ring-violet-200',
};

export default function TokensPage() {
  const { tokenSummary, tokenMovements, company } = useAppStore();
  const usagePct = Math.round((tokenSummary.consumed / tokenSummary.purchased) * 100);

  return (
    <PageContainer
      title="Tokens"
      description="Controla tu saldo, consumo e historial de movimientos."
      actions={
        <Button size="sm" leftIcon={<Plus size={16} />}>
          Comprar tokens
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Tokens comprados"
          value={formatNumber(tokenSummary.purchased)}
          icon={ShoppingCart}
          hint={`plan ${company.plan.name}`}
        />
        <StatCard
          label="Tokens utilizados"
          value={formatNumber(tokenSummary.consumed)}
          icon={Flame}
          hint={`${usagePct}% del total`}
        />
        <StatCard
          label="Tokens restantes"
          value={formatNumber(tokenSummary.remaining)}
          icon={Wallet}
          hint="disponibles ahora"
          accent
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* gauge / resumen */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Saldo del ciclo</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex items-center justify-center py-2">
              <RadialGauge percent={100 - usagePct} />
            </div>
            <div className="mt-4 space-y-2.5">
              <Row label="Comprados" value={formatNumber(tokenSummary.purchased)} dot="bg-stone-300" />
              <Row label="Consumidos" value={formatNumber(tokenSummary.consumed)} dot="bg-rose-400" />
              <Row
                label="Restantes"
                value={formatNumber(tokenSummary.remaining)}
                dot="bg-brand-500"
                strong
              />
            </div>
          </CardBody>
        </Card>

        {/* historial */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Historial de movimientos</CardTitle>
            <span className="text-xs text-stone-500">{tokenMovements.length} movimientos</span>
          </CardHeader>
          <CardBody className="pt-2">
            <ul className="divide-y divide-sand-200">
              {tokenMovements.map((mv) => {
                const positive = mv.amount > 0;
                return (
                  <li key={mv.id} className="flex items-center gap-4 py-3.5">
                    <span
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                        positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600',
                      )}
                    >
                      {positive ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-stone-900">{mv.description}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <Badge className={cn('text-[11px]', MOVEMENT_TONE[mv.type])}>
                          {TOKEN_MOVEMENT_LABELS[mv.type]}
                        </Badge>
                        <span className="text-xs text-stone-400">{formatDateTime(mv.date)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          'text-sm font-semibold',
                          positive ? 'text-emerald-600' : 'text-rose-600',
                        )}
                      >
                        {positive ? '+' : ''}
                        {formatNumber(mv.amount)}
                      </p>
                      <p className="text-xs text-stone-400">saldo {formatNumber(mv.balanceAfter)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  );
}

function Row({
  label,
  value,
  dot,
  strong,
}: {
  label: string;
  value: string;
  dot: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-stone-600">
        <span className={cn('h-2 w-2 rounded-full', dot)} />
        {label}
      </span>
      <span className={cn('text-sm', strong ? 'font-semibold text-stone-900' : 'text-stone-700')}>
        {value}
      </span>
    </div>
  );
}

function RadialGauge({ percent }: { percent: number }) {
  const r = 56;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="relative h-40 w-40">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" className="stroke-sand-100" strokeWidth="12" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="url(#tokenGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="tokenGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4a94ff" />
            <stop offset="100%" stopColor="#aed1ff" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Coins size={18} className="text-brand-500" />
        <span className="mt-1 text-2xl font-bold text-stone-900">{percent}%</span>
        <span className="text-xs text-stone-500">disponible</span>
      </div>
    </div>
  );
}
