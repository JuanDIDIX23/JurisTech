import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { Card } from '@shared/ui';

interface ChartCardProps {
  title: string;
  /** true cuando no hay datos que graficar */
  vacio?: boolean;
  children: ReactNode;
}

function ChartFallback() {
  return (
    <div className="flex h-[280px] items-center justify-center">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-sand-200 border-t-brand-500" />
    </div>
  );
}

/**
 * Contenedor de gráfico. El Suspense es obligatorio: los componentes de
 * recharts se cargan con lazy() para mantenerlos fuera del chunk principal.
 */
export function ChartCard({ title, vacio, children }: ChartCardProps) {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
      <div className="mt-4">
        {vacio ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-stone-400">
            Aún no hay datos suficientes.
          </div>
        ) : (
          <Suspense fallback={<ChartFallback />}>{children}</Suspense>
        )}
      </div>
    </Card>
  );
}
