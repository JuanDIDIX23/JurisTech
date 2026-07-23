import { motion } from 'framer-motion';
import { Users, Umbrella, FileSignature, Briefcase, ArrowUpRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { fadeUp, staggerContainer } from '@shared/lib/motion';

interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
  tokens: string;
}

const SERVICES: Service[] = [
  {
    icon: Users,
    title: 'Derecho Laboral',
    description:
      'Contratación, liquidaciones, políticas internas y acompañamiento en relaciones laborales.',
    tokens: 'desde 12 tokens',
  },
  {
    icon: Umbrella,
    title: 'Seguridad Social',
    description:
      'Afiliaciones, aportes, riesgos laborales y cumplimiento ante el sistema de seguridad social.',
    tokens: 'desde 10 tokens',
  },
  {
    icon: FileSignature,
    title: 'Derecho Contractual',
    description: 'Redacción, revisión y negociación de contratos comerciales y civiles.',
    tokens: 'desde 15 tokens',
  },
  {
    icon: Briefcase,
    title: 'Consultoría Empresarial',
    description:
      'Estructuración societaria, cumplimiento normativo y asesoría estratégica para tu operación.',
    tokens: 'desde 18 tokens',
  },
];

export function ServicesSection() {
  return (
    <section id="servicios" className="bg-sand-50 py-24 sm:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Servicios"
          title="Cuatro áreas, un mismo estándar de calidad"
          description="Los servicios jurídicos que más necesita tu pyme, con especialistas dedicados y tokens transparentes."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-2"
        >
          {SERVICES.map(({ icon: Icon, title, description, tokens }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="group relative overflow-hidden rounded-2xl border border-sand-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
            >
              <div className="flex items-start justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon size={20} />
                </span>
                <ArrowUpRight
                  size={18}
                  className="text-stone-300 transition-colors group-hover:text-brand-500"
                />
              </div>
              <h3 className="mt-5 text-xl font-semibold leading-snug text-stone-900">{title}</h3>
              <p className="mt-2 text-base font-normal leading-relaxed text-stone-500">
                {description}
              </p>
              <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-widest text-brand-600">
                {tokens}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
