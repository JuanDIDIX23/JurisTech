import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@shared/lib/cn';

type Option = { value: string; label: string };

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, className, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'h-10 w-full appearance-none rounded-xl border border-sand-200 bg-white pl-3.5 pr-9 text-sm text-stone-800',
          'transition-colors focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10',
          className,
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
      />
    </div>
  ),
);

Select.displayName = 'Select';
