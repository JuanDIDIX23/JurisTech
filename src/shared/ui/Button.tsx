import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@shared/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'subtle';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary:
    'bg-accent-600 text-white shadow-sm hover:bg-accent-500 active:bg-accent-700 shadow-[0_8px_24px_-10px_rgba(10,85,245,0.7)]',
  secondary: 'bg-navy-900 text-white hover:bg-navy-800 active:bg-navy-950',
  outline:
    'border border-graphite-200 bg-white text-graphite-800 hover:border-graphite-300 hover:bg-graphite-50',
  ghost: 'text-graphite-700 hover:bg-graphite-100',
  subtle: 'bg-accent-50 text-accent-700 hover:bg-accent-100',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', leftIcon, rightIcon, className, children, ...props }, ref) => (
    <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  ),
);

Button.displayName = 'Button';
