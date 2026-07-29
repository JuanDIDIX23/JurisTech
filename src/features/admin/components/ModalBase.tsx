import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@shared/lib/cn';

interface ModalBaseProps {
  open: boolean;
  titulo: string;
  descripcion?: string;
  onClose: () => void;
  children: ReactNode;
  ancho?: 'sm' | 'md' | 'lg';
}

const ANCHOS = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
} as const;

/** Envoltorio común de los modales del panel: overlay, cierre con Escape y cabecera. */
export function ModalBase({
  open,
  titulo,
  descripcion,
  onClose,
  children,
  ancho = 'md',
}: ModalBaseProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-glow',
          ANCHOS[ancho],
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-stone-900">{titulo}</h3>
            {descripcion && <p className="mt-0.5 text-sm text-stone-500">{descripcion}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-sand-100 hover:text-stone-900"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
