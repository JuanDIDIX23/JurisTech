import { cn } from '@shared/lib/cn';
import isotipo from '@assets/logo-juristech-isotipo.png';

interface LogoProps {
  className?: string;
  /** 'light' = el logo va sobre un fondo oscuro (hero, overlays). */
  tone?: 'dark' | 'light';
}

/**
 * Isotipo oficial + wordmark.
 *
 * El isotipo se acompaña del nombre en texto porque el arte no lo incluye.
 * La imagen es decorativa (`alt=""`): quien lee con lector de pantalla ya
 * recibe «JurisTech» del texto contiguo, y anunciarlo dos veces sobra.
 */
export function Logo({ className, tone = 'dark' }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <img
        src={isotipo}
        alt=""
        aria-hidden
        draggable={false}
        className="h-9 w-auto select-none"
      />
      <span
        className={cn(
          'text-[17px] font-bold tracking-tight',
          tone === 'dark' ? 'text-stone-900' : 'text-white',
        )}
      >
        Juris
        <span className={tone === 'dark' ? 'text-brand-600' : 'text-brand-300'}>Tech</span>
      </span>
    </span>
  );
}
