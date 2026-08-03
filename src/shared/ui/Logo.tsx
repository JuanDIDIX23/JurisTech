import { cn } from '@shared/lib/cn';
import logoJurisTech from '@assets/logo-juristech-transparente.png';

interface LogoProps {
  className?: string;
  /**
   * 'light' indica que el logo va sobre un fondo OSCURO.
   *
   * El arte oficial es azul y gris sobre transparente, así que sobre un
   * fondo oscuro no se leería: en ese caso se le añade un respaldo claro.
   * Lo ideal sería una versión del logo en blanco; mientras no exista,
   * el respaldo es lo que garantiza que se vea.
   */
  tone?: 'dark' | 'light';
}

/** Logo oficial. El wordmark «JURISTECH» ya viene dentro de la imagen. */
export function Logo({ className, tone = 'dark' }: LogoProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center',
        tone === 'light' && 'rounded-xl bg-white/95 px-3 py-1 shadow-sm backdrop-blur',
        className,
      )}
    >
      <img
        src={logoJurisTech}
        alt="JurisTech"
        draggable={false}
        className="h-10 w-auto select-none"
      />
    </span>
  );
}
