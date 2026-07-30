import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SectionHeading } from './SectionHeading';
import { fadeUp, staggerContainer } from '@shared/lib/motion';
import { getMedia } from '@shared/services/media';
import type { Media } from '@shared/types/supabase';

const ESQUELETOS = 5;

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
          <div className="mt-16 grid grid-cols-2 justify-items-center gap-x-10 gap-y-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: ESQUELETOS }, (_, i) => (
              <div
                key={i}
                aria-hidden
                className="h-16 w-full max-w-[160px] animate-pulse rounded-lg bg-sand-200"
              />
            ))}
          </div>
        ) : (
          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="mt-16 grid grid-cols-2 justify-items-center gap-x-10 gap-y-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            {logos.map((logo) => (
              <motion.li key={logo.id} variants={fadeUp} className="flex items-center">
                {/* Los logos traen su propio fondo, así que van sueltos:
                    sin tarjeta, sin borde y sin relleno alrededor. */}
                <img
                  src={logo.url}
                  alt={logo.alt ?? 'Logo de empresa afiliada'}
                  loading="lazy"
                  className="h-16 w-auto max-w-[160px] object-contain"
                />
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </section>
  );
}
