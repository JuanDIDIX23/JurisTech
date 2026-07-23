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
    src: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600',
    alt: 'Sala de reunión moderna en un entorno empresarial',
  },
  {
    src: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1600',
    alt: 'Empresario revisando documentos con control de su operación',
  },
  {
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600',
    alt: 'Apretón de manos profesional que representa confianza',
  },
  {
    src: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1600',
    alt: 'Equipo trabajando en una oficina moderna',
  },
  {
    src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1600',
    alt: 'Profesional con laptop trabajando de forma remota',
  },
];

const STATS = [
  { value: '+120', label: 'pymes afiliadas' },
  { value: '24 h', label: 'tiempo de respuesta' },
  { value: '4', label: 'áreas jurídicas' },
  { value: '100%', label: 'gestión remota' },
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
      className="relative h-screen min-h-[640px] w-full overflow-hidden bg-brand-950"
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
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex flex-1 items-center">
          <div className="container-page w-full">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="max-w-2xl text-left"
            >
              <motion.span
                variants={fadeUp}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-brand-100 backdrop-blur"
              >
                <Sparkles size={14} />
                Innovación jurídica para pymes colombianas
              </motion.span>

              <motion.h1
                variants={fadeUp}
                className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
              >
                Recupera el{' '}
                <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
                  control
                </span>{' '}
                de tu inversión legal
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-6 max-w-xl text-base font-normal leading-relaxed text-stone-200 sm:text-lg"
              >
                Olvídate de los honorarios fijos y el cobro por horas sin explicación. JurisTech es la
                plataforma tecnológica que te da acceso a asesoría jurídica especializada mediante
                tokens: conoces el costo antes de empezar y decides cuándo usarla.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href="#contacto">
                  <Button size="lg" rightIcon={<ArrowRight size={18} />} className="w-full sm:w-auto">
                    Agenda una asesoría
                  </Button>
                </a>
                <a href="#tokens">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
                  >
                    Conoce nuestro modelo
                  </Button>
                </a>
              </motion.div>

              <motion.p
                variants={fadeUp}
                className="mt-7 inline-flex items-center gap-2 text-sm font-normal text-stone-300"
              >
                <ShieldCheck size={16} className="text-brand-300" />
                Confianza y confidencialidad garantizadas
              </motion.p>
            </motion.div>
          </div>
        </div>

        {/* zona inferior: dots + stats fijos */}
        <div className="container-page w-full pb-8">
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

          {/* stats fijos */}
          <div className="mt-6 grid grid-cols-2 gap-6 border-t border-white/15 pt-6 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-normal text-stone-300">{stat.label}</p>
              </div>
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
