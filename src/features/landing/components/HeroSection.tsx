import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@shared/ui';
import { fadeUp, staggerContainer } from '@shared/lib/motion';
import { getMedia } from '@shared/services/media';
import type { Media } from '@shared/types/supabase';

const AUTOPLAY_MS = 5000;

export function HeroSection() {
  // Las fotos del carrusel se administran en /admin/media. Si no hay
  // ninguna —o si la lectura falla— la sección queda con el fondo azul
  // sólido y todo el contenido sigue siendo funcional.
  const [slides, setSlides] = useState<Media[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let cancelado = false;

    void getMedia('hero')
      .then((data) => {
        if (!cancelado) setSlides(data);
      })
      .catch(() => {
        if (!cancelado) setSlides([]);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const total = slides.length;

  const go = useCallback(
    (dir: number) => {
      if (total === 0) return;
      setIndex((i) => (i + dir + total) % total);
    },
    [total],
  );

  // Auto-avance cada 5s, se pausa al hacer hover sobre la sección.
  useEffect(() => {
    if (paused || total <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, total]);

  // Si se reduce el número de fotos desde el panel, el índice podría
  // quedar fuera de rango en la siguiente carga.
  useEffect(() => {
    if (index >= total) setIndex(0);
  }, [index, total]);

  const actual = total > 0 ? slides[Math.min(index, total - 1)] : null;

  return (
    <section
      id="inicio"
      aria-label="Presentación de JurisTech"
      className="relative flex min-h-screen w-full flex-col overflow-hidden bg-brand-950"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* carrusel de fondo (crossfade + zoom sutil) */}
      {actual && (
        <AnimatePresence initial={false}>
          <motion.div
            key={actual.id}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${actual.url})` }}
            role="img"
            aria-label={actual.alt ?? 'Imagen de JurisTech'}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1.1, ease: 'easeInOut' },
              scale: { duration: 6, ease: 'linear' },
            }}
          />
        </AnimatePresence>
      )}

      {/* overlays de legibilidad */}
      <div className="pointer-events-none absolute inset-0 bg-brand-950/60" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-950/85 via-brand-950/45 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-950/80 via-transparent to-transparent" />

      {/* contenido */}
      <div className="relative z-10 flex flex-1 flex-col">
        <div className="flex flex-1 flex-col justify-center pt-24 sm:pt-20">
          <div className="container-page w-full">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="max-w-2xl text-left"
            >
              <motion.h1
                variants={fadeUp}
                className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
              >
                ¿Eres empresario? Toma el{' '}
                <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
                  control
                </span>{' '}
                de tu inversión en servicios jurídicos.
              </motion.h1>
              <br />
              <motion.p
                variants={fadeUp}
                className="mt-6 max-w-xl text-justify text-base font-normal leading-relaxed text-stone-200 sm:text-lg"
              >
                Somos una firma de abogados con enfoque corporativo. Innovamos para brindar una mejor
                experiencia de asesoría y acompañamiento estratégico empresarial en materia laboral,
                contractual y seguridad social.
                <br />
                <br />
                Olvídate de los honorarios fijos y del cobro por horas sin explicación ni control.
                JurisTech brinda asesoría jurídica empresarial mediante un sistema de tokens: conoces
                el costo de cada gestión antes de comenzar y decides cuándo usarlos.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-4 sm:flex-row">
                <a href="#contacto">
                  <Button
                    size="lg"
                    rightIcon={<ArrowRight size={20} />}
                    className="h-14 w-full rounded-2xl px-8 text-base font-semibold sm:w-auto sm:text-lg"
                  >
                    Agenda una asesoría
                  </Button>
                </a>
                <a href="#tokens">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 w-full rounded-2xl border-white/25 bg-white/5 px-8 text-base font-semibold text-white hover:bg-white/10 sm:w-auto sm:text-lg"
                  >
                    Conoce nuestro modelo
                  </Button>
                </a>
              </motion.div>

              <motion.p
                variants={fadeUp}
                className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-base font-semibold text-white backdrop-blur sm:text-lg"
              >
                <ShieldCheck size={20} className="shrink-0 text-brand-300" />
                No eres nuestro cliente, eres nuestro afiliado.
              </motion.p>
            </motion.div>
          </div>
        </div>

        {/* zona inferior: indicadores del carrusel */}
        {total > 1 && (
          <div className="container-page w-full pb-10">
            <div className="flex items-center gap-2.5" role="tablist" aria-label="Seleccionar imagen">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Imagen ${i + 1} de ${total}`}
                  onClick={() => setIndex(i)}
                  className={
                    i === index
                      ? 'h-2 w-8 rounded-full bg-brand-400 transition-all duration-300'
                      : 'h-2 w-2 rounded-full bg-white/40 transition-all duration-300 hover:bg-white/70'
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* flechas de navegación discretas */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Imagen anterior"
            className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 lg:left-6"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Imagen siguiente"
            className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 lg:right-6"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </section>
  );
}
