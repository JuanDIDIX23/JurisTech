import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@shared/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, ...props }, ref) => (
    <div className="relative">
      {leftIcon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
          {leftIcon}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          'h-10 w-full rounded-xl border border-sand-200 bg-white text-sm text-stone-900 placeholder:text-stone-400',
          'transition-colors focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10',
          leftIcon ? 'pl-9 pr-3.5' : 'px-3.5',
          className,
        )}
        {...props}
      />
    </div>
  ),
);

Input.displayName = 'Input';
