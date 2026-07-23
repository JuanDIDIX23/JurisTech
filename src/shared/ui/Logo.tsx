import { cn } from '@shared/lib/cn';

interface LogoProps {
  className?: string;
  /** color del wordmark; el isotipo siempre lleva acento */
  tone?: 'dark' | 'light';
  withWordmark?: boolean;
}

export function Logo({ className, tone = 'dark', withWordmark = true }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900">
        <svg width="18" height="18" viewBox="0 0 32 32" fill="none" aria-hidden>
          <path
            d="M9 9h14M16 9v11a4 4 0 0 1-4 4"
            className="stroke-accent-400"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <circle cx="22" cy="20" r="2.4" className="fill-accent-300" />
        </svg>
      </span>
      {withWordmark && (
        <span
          className={cn(
            'text-[17px] font-bold tracking-tight',
            tone === 'dark' ? 'text-navy-900' : 'text-white',
          )}
        >
          Juris<span className="text-accent-500">Tech</span>
        </span>
      )}
    </span>
  );
}
