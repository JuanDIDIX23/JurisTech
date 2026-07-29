import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@shared/ui';
import { fadeUp, staggerContainer } from '@shared/lib/motion';

interface Slide {
  src: string;
  alt: string;
}

// Imágenes placeholder (Unsplash). Se reemplazarán por las fotos reales
// generadas con IA — basta con cambiar los `src`.
const SLIDES: Slide[] = [
  {
    src: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1600',
    alt: 'Abogado firmando documentos en un entorno formal',
  },
  {
    src: 'https://images.unsplash.com/photo-1521791055366-0d553872952f?w=1600',
    alt: 'Apretón de manos profesional entre ejecutivos de traje',
  },
  {
    src: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600',
    alt: 'Persona firmando un contrato en una oficina',
  },
  {
    src: 'https://images.unsplash.com/photo-1664575602807-e002fc20892c?w=1600',
    alt: 'Abogada profesional revisando documentos',
  },
  {
    src: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600',
    alt: 'Profesional de negocios en atuendo formal',
  },
];

const AUTOPLAY_MS = 5000;

export function HeroSection() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((dir: number) => {
    setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-avance cada 5s, se pausa al hacer hover sobre la sección.
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <section
      id="inicio"
      aria-label="Presentación de JurisTech"
      className="relative flex min-h-screen w-full flex-col overflow-hidden bg-brand-950"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* carrusel de fondo (crossfade + zoom sutil) */}
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${SLIDES[index].src})` }}
          role="img"
          aria-label={SLIDES[index].alt}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 1.1, ease: 'easeInOut' },
            scale: { duration: 6, ease: 'linear' },
          }}
        />
      </AnimatePresence>

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
              <motion.span
                variants={fadeUp}
                className="inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-white/15 px-5 py-2.5 text-lg font-semibold text-white shadow-lg backdrop-blur sm:text-xl"
              >
                <Sparkles size={20} className="shrink-0 text-brand-300" />
                Innovación y Derecho al servicio de tu empresa
              </motion.span>

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
                Somos firma de abogados con enfoque corporativo. Innovamos para brindar una mejor
                experiencia de asesoría y acompañamiento estratégico empresarial en materia laboral,
                contractual y seguridad social.
                 <br /> 
                Olvídate de los honorarios fijos y del cobro por
                horas sin explicación ni control. JurisTech brinda asesoría jurídica empresarial
                mediante un sistema de tokens: conoces el costo de cada gestión antes de comenzar y
                decides cuándo usarlos.
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
        <div className="container-page w-full pb-10">
          {/* indicadores de slide */}
          <div className="flex items-center gap-2.5" role="tablist" aria-label="Seleccionar imagen">
            {SLIDES.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Imagen ${i + 1} de ${SLIDES.length}`}
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
      </div>

      {/* flechas de navegación discretas */}
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
    </section>
  );
}
