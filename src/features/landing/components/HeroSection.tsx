import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '@shared/ui';
import { fadeUp, staggerContainer } from '@shared/lib/motion';
import { DashboardMockup } from './DashboardMockup';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-navy-950 pt-28 pb-24 lg:pt-36 lg:pb-32">
      {/* fondo decorativo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid-faint bg-[size:44px_44px] opacity-[0.35]" />
        <div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-accent-600/25 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-navy-500/30 blur-[100px]" />
      </div>

      <div className="container-page relative grid items-center gap-16 lg:grid-cols-2">
        <motion.div variants={staggerContainer} initial="hidden" animate="show">
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-accent-200 backdrop-blur">
              <Sparkles size={14} />
              Innovación jurídica para pymes colombianas
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]"
          >
            Recupera el{' '}
            <span className="bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">
              control
            </span>{' '}
            de tu inversión legal
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-xl text-lg leading-relaxed text-graphite-300"
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
                className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
              >
                Conoce nuestro modelo
              </Button>
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-graphite-400"
          >
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={16} className="text-accent-300" />
              Confianza y confidencialidad garantizadas
            </span>
            <span className="hidden h-4 w-px bg-white/10 sm:block" />
            <span>+120 pymes ya confían en JurisTech</span>
          </motion.div>
        </motion.div>

        <div className="relative [perspective:1600px]">
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}
