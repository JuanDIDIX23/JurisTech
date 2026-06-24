import { motion } from 'framer-motion';
import { Building2, Users, Receipt, ScrollText, Lightbulb, DatabaseZap, ArrowUpRight } from 'lucide-react';
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
    icon: Building2,
    title: 'Derecho mercantil',
    description: 'Constitución, pactos de socios, contratos comerciales y operaciones societarias.',
    tokens: 'desde 15 tokens',
  },
  {
    icon: Users,
    title: 'Derecho laboral',
    description: 'Contratación, despidos, políticas internas y auditoría de relaciones laborales.',
    tokens: 'desde 12 tokens',
  },
  {
    icon: Receipt,
    title: 'Asesoría fiscal',
    description: 'Planificación tributaria, revisión de obligaciones y optimización fiscal.',
    tokens: 'desde 18 tokens',
  },
  {
    icon: ScrollText,
    title: 'Compliance',
    description: 'Programas de cumplimiento, prevención de riesgos penales y código ético.',
    tokens: 'desde 20 tokens',
  },
  {
    icon: Lightbulb,
    title: 'Propiedad intelectual',
    description: 'Registro de marcas, protección de software y acuerdos de licencia.',
    tokens: 'desde 16 tokens',
  },
  {
    icon: DatabaseZap,
    title: 'Protección de datos',
    description: 'Cumplimiento RGPD, evaluaciones de impacto y políticas de privacidad.',
    tokens: 'desde 14 tokens',
  },
];

export function ServicesSection() {
  return (
    <section id="servicios" className="bg-graphite-50 py-24 sm:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Servicios"
          title="Cobertura jurídica para cada necesidad"
          description="Seis áreas de especialización con equipos dedicados. Una sola plataforma para gestionarlas todas."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {SERVICES.map(({ icon: Icon, title, description, tokens }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="group relative overflow-hidden rounded-2xl border border-graphite-200/70 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
            >
              <div className="flex items-start justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                  <Icon size={20} />
                </span>
                <ArrowUpRight
                  size={18}
                  className="text-graphite-300 transition-colors group-hover:text-accent-500"
                />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-navy-900">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-graphite-500">{description}</p>
              <span className="mt-4 inline-block text-xs font-medium uppercase tracking-wide text-accent-600">
                {tokens}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
