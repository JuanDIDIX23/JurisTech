import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@shared/ui';
import { fadeUp } from '@shared/lib/motion';
import { ROUTES } from '@app/routes';

export function FinalCtaSection() {
  return (
    <section className="bg-white pb-24 sm:pb-28">
      <div className="container-page">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="relative overflow-hidden rounded-3xl bg-navy-950 px-8 py-16 text-center sm:px-16 sm:py-20"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-grid-faint bg-[size:40px_40px] opacity-30" />
            <div className="absolute -top-24 left-1/2 h-72 w-[34rem] -translate-x-1/2 rounded-full bg-accent-600/30 blur-[110px]" />
          </div>

          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Lleva la gestión jurídica de tu empresa al siguiente nivel
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-graphite-300">
              Empieza hoy con JurisTech y centraliza asesoría, documentos y solicitudes en una
              plataforma diseñada para escalar contigo.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to={ROUTES.dashboard}>
                <Button size="lg" rightIcon={<ArrowRight size={18} />} className="w-full sm:w-auto">
                  Acceder a la plataforma
                </Button>
              </Link>
              <a href="#servicios">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
                >
                  Explorar servicios
                </Button>
              </a>
            </div>

            <p className="mt-6 text-sm text-graphite-400">
              Sin permanencia · Configuración en minutos · Soporte dedicado
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
