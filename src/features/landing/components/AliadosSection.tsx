import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SectionHeading } from './SectionHeading';
import { fadeUp, staggerContainer } from '@shared/lib/motion';
import { getMedia } from '@shared/services/media';
import { cn } from '@shared/lib/cn';
import type { Media } from '@shared/types/supabase';

/**
 * Columnas en pantallas grandes según cuántos logos haya. Las clases se
 * escriben completas porque Tailwind analiza el código de forma estática:
 * una clase compuesta en tiempo de ejecución nunca llegaría al CSS.
 */
const COLUMNAS_ANCHAS: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
};

const ESQUELETOS = 5;

function columnasPara(total: number): string {
  return COLUMNAS_ANCHAS[total] ?? 'lg:grid-cols-4 xl:grid-cols-5';
}

export function AliadosSection() {
  const [logos, setLogos] = useState<Media[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;

    void getMedia('aliados')
      .then((data) => {
        if (!cancelado) setLogos(data);
      })
      .catch(() => {
        if (!cancelado) setLogos([]);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  // Sin logos configurados la sección desaparece por completo: es
  // preferible a dejar un hueco vacío en medio de la landing.
  if (!cargando && logos.length === 0) return null;

  return (
    <section id="aliados" className="bg-sand-50 py-24 sm:py-28">
      <div className="container-page">
        <SectionHeading eyebrow="Nuestros afiliados" title="Empresas que confían en nosotros" />

        {cargando ? (
          <div className="mt-16 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: ESQUELETOS }, (_, i) => (
              <div
                key={i}
                aria-hidden
                className="h-[100px] animate-pulse rounded-xl border border-sand-200 bg-sand-100"
              />
            ))}
          </div>
        ) : (
          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className={cn(
              'mt-16 grid grid-cols-2 gap-5 sm:grid-cols-3',
              columnasPara(logos.length),
            )}
          >
            {logos.map((logo) => (
              <motion.li
                key={logo.id}
                variants={fadeUp}
                className="flex h-[100px] items-center justify-center rounded-xl border border-sand-200 bg-white p-6 shadow-card transition-shadow duration-300 hover:shadow-glow"
              >
                <img
                  src={logo.url}
                  alt={logo.alt ?? 'Logo de empresa afiliada'}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain"
                />
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </section>
  );
}
