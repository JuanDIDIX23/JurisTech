import { Check, XCircle } from 'lucide-react';
import { SOLICITUD_ESTADO_LABELS, SOLICITUD_FLUJO } from '@shared/constants/labels';
import { cn } from '@shared/lib/cn';
import type { SolicitudEstado } from '@shared/types/supabase';

/**
 * Timeline del flujo de la solicitud. 'cancelada' no forma parte del flujo
 * normal, así que se representa como un estado terminal aparte.
 */
export function SolicitudTimeline({ estado }: { estado: SolicitudEstado }) {
  if (estado === 'cancelada') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
        <XCircle size={18} className="shrink-0 text-rose-600" />
        <p className="text-sm font-medium text-rose-700">
          Esta solicitud fue cancelada y no continuará su curso.
        </p>
      </div>
    );
  }

  const actual = SOLICITUD_FLUJO.indexOf(estado);

  return (
    <ol className="relative space-y-0">
      {SOLICITUD_FLUJO.map((paso, i) => {
        const completado = i < actual;
        const esActual = i === actual;
        const ultimo = i === SOLICITUD_FLUJO.length - 1;

        return (
          <li key={paso} className="relative flex gap-4 pb-6 last:pb-0">
            {/* línea vertical */}
            {!ultimo && (
              <span
                aria-hidden
                className={cn(
                  'absolute left-[13px] top-7 h-full w-0.5',
                  completado ? 'bg-brand-500' : 'bg-sand-200',
                )}
              />
            )}

            <span
              className={cn(
                'relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                completado && 'border-brand-500 bg-brand-500 text-white',
                esActual && 'border-brand-500 bg-white text-brand-600',
                !completado && !esActual && 'border-sand-200 bg-white text-stone-300',
              )}
            >
              {completado ? (
                <Check size={14} />
              ) : (
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    esActual ? 'bg-brand-500' : 'bg-sand-300',
                  )}
                />
              )}
            </span>

            <div className="pt-0.5">
              <p
                className={cn(
                  'text-sm font-semibold',
                  esActual ? 'text-brand-700' : completado ? 'text-stone-900' : 'text-stone-400',
                )}
              >
                {SOLICITUD_ESTADO_LABELS[paso]}
              </p>
              {esActual && (
                <p className="mt-0.5 text-xs text-stone-500">Estado actual de tu solicitud</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
