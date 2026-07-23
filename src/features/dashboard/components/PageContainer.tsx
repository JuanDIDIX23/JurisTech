import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageContainerProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/** Encabezado + animación de entrada estándar para cada página del dashboard. */
export function PageContainer({ title, description, actions, children }: PageContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto max-w-7xl"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">{title}</h1>
          {description && <p className="mt-1.5 text-sm text-stone-500">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      <div className="mt-7">{children}</div>
    </motion.div>
  );
}
