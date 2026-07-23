import type { ReactNode } from 'react';
import { cn } from '@shared/lib/cn';

interface BadgeProps {
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

/**
 * Badge neutro. Para semánticas de color (estados) pásale las clases
 * `ring`/`bg`/`text` desde el llamador (ver REQUEST_STATUS_TONE).
 */
export function Badge({ children, className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        'bg-sand-100 text-stone-700 ring-sand-200',
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}
