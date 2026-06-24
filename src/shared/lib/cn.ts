/**
 * Une clases condicionalmente. Implementación ligera (sin dependencias)
 * para mantener el bundle pequeño manteniendo la ergonomía de `clsx`.
 */
export type ClassValue = string | number | null | false | undefined | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  const walk = (value: ClassValue) => {
    if (!value && value !== 0) return;
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    out.push(String(value));
  };

  inputs.forEach(walk);
  return out.join(' ');
}
