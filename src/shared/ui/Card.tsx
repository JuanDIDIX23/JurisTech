import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@shared/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
}

export function Card({ children, className, hoverable, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-sand-200 bg-white shadow-card',
        hoverable && 'transition-shadow duration-300 hover:shadow-[0_18px_50px_-22px_rgba(28,28,28,0.28)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between px-6 pt-5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-sm font-semibold text-stone-900', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardBody({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 py-5', className)} {...props}>
      {children}
    </div>
  );
}
