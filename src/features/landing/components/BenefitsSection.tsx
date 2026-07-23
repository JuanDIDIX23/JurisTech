import { motion } from 'framer-motion';
import {
  Target,
  Eye,
  Wallet,
  Search,
  ShieldAlert,
  Users2,
  Laptop,
  Lightbulb,
  ShieldCheck,
  Lock,
  Award,
  Heart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { fadeUp, staggerContainer } from '@shared/lib/motion';

interface ComparisonRow {
  icon: LucideIcon;
  label: string;
  traditional: string;
  juristech: string;
}

const COMPARISON: ComparisonRow[] = [
  {
    icon: Wallet,
    label: 'Control total de costos',
    traditional: 'Honorarios fijos, los uses o no',
    juristech: 'Tokens que consumes solo cuando los necesitas',
  },
  {
    icon: Search,
    label: 'Transparencia',
    traditional: 'Cobro por horas sin visibilidad previa',
    juristech: 'Costo estimado y conocido antes de cada solicitud',
  },
  {
    icon: ShieldAlert,
    label: 'Prevención de riesgos',
    traditional: 'Atención reactiva ante problemas ya ocurridos',
    juristech: 'Acompañamiento preventivo que evita riesgos legales',
  },
  {
    icon: Users2,
    label: 'Acceso a especialistas',
    traditional: 'Un solo abogado para todas las áreas',
    juristech: 'Red de especialistas verificados por área',
  },
  {
    icon: Laptop,
    label: 'Atención remota',
    traditional: 'Trámites presenciales y procesos lentos',
    juristech: 'Gestión 100% remota desde una sola plataforma',
  },
];

interface Value {
  icon: LucideIcon;
  label: string;
}

const VALUES: Value[] = [
  { icon: Lightbulb, label: 'Innovación' },
  { icon: ShieldCheck, label: 'Transparencia' },
  { icon: Lock, label: 'Confidencialidad' },
  { icon: Award, label: 'Responsabilidad' },
  { icon: Heart, label: 'Confianza' },
];

export function BenefitsSection() {
  return (
    <section id="beneficios" className="bg-white py-24 sm:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Diferenciación"
          title="Derecho pensado para pymes, no para despachos tradicionales"
          description="Las firmas tradicionales operan con honorarios permanentes y cobros por horas que dificultan saber cuánto costará cada gestión. JurisTech transforma esa experiencia: accedes a servicios jurídicos especializados solo cuando los necesitas, conoces previamente el consumo estimado y conservas control total sobre tu inversión legal."
        />

        {/* misión y visión */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-2"
        >
          <motion.div
            variants={fadeUp}
            className="rounded-2xl border border-graphite-200/70 bg-graphite-50 p-6"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-accent-300">
              <Target size={18} />
            </span>
            <h3 className="mt-4 text-base font-semibold text-navy-900">Misión</h3>
            <p className="mt-2 text-sm leading-relaxed text-graphite-500">
              Transformar la experiencia de acceso a los servicios legales de las pequeñas y
              medianas empresas mediante un modelo innovador de afiliación especializada,
              preventiva, flexible y de calidad, que integre tecnología, atención remota y un
              sistema transparente de consumo por tokens.
            </p>
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="rounded-2xl border border-graphite-200/70 bg-graphite-50 p-6"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-accent-300">
              <Eye size={18} />
            </span>
            <h3 className="mt-4 text-base font-semibold text-navy-900">Visión</h3>
            <p className="mt-2 text-sm leading-relaxed text-graphite-500">
              Ser reconocida en Colombia como empresa referente en la innovación de los servicios
              legales, ofreciendo a las pymes una experiencia jurídica de alta calidad, eficiente,
              transparente, confiable y personalizada.
            </p>
          </motion.div>
        </motion.div>

        {/* comparativa modelo tradicional vs JurisTech */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="mt-14 overflow-hidden rounded-2xl border border-graphite-200/70"
        >
          <div className="hidden bg-graphite-50 px-6 py-4 sm:grid sm:grid-cols-[1.2fr_1fr_1fr] sm:gap-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-graphite-400">
              Beneficio
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-graphite-400">
              Firma tradicional
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-accent-600">
              JurisTech
            </span>
          </div>
          <div className="divide-y divide-graphite-200/70">
            {COMPARISON.map(({ icon: Icon, label, traditional, juristech }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="grid gap-3 bg-white px-6 py-5 sm:grid-cols-[1.2fr_1fr_1fr] sm:items-center sm:gap-4"
              >
                <span className="flex items-center gap-3 text-sm font-semibold text-navy-900">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-accent-300">
                    <Icon size={16} />
                  </span>
                  {label}
                </span>
                <span className="text-sm text-graphite-400 line-through decoration-graphite-300">
                  {traditional}
                </span>
                <span className="text-sm font-medium text-navy-900">{juristech}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* valores */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-14 flex flex-col items-center"
        >
          <span className="text-sm font-semibold uppercase tracking-wider text-accent-600">
            Nuestros valores
          </span>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {VALUES.map(({ icon: Icon, label }) => (
              <motion.span
                key={label}
                variants={fadeUp}
                className="inline-flex items-center gap-2 rounded-full border border-graphite-200/70 bg-graphite-50 px-4 py-2 text-sm font-medium text-navy-900"
              >
                <Icon size={15} className="text-accent-600" />
                {label}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
