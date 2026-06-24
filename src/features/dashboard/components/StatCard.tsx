import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card } from '@shared/ui';
import { cn } from '@shared/lib/cn';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  delta?: number;
  hint?: string;
  accent?: boolean;
}

export function StatCard({ label, value, icon: Icon, delta, hint, accent }: StatCardProps) {
  const positive = (delta ?? 0) >= 0;

  return (
    <Card className={cn('p-5', accent && 'border-accent-200 bg-accent-50/40')}>
      <div className="flex items-start justify-between">
        <span
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-xl',
            accent ? 'bg-accent-600 text-white' : 'bg-navy-900 text-accent-300',
          )}
        >
          <Icon size={18} />
        </span>
        {delta !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
              positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
            )}
          >
            {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-navy-900">{value}</p>
      <p className="mt-1 text-sm font-medium text-graphite-600">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-graphite-400">{hint}</p>}
    </Card>
  );
}
