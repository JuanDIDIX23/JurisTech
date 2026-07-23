import { motion } from 'framer-motion';
import {
  Wallet,
  Send,
  FileCheck,
  Check,
  Clock,
  Layers,
  Zap,
  ShieldCheck,
  TrendingUp,
  Target,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { fadeUp, staggerContainer } from '@shared/lib/motion';

interface Step {
  icon: LucideIcon;
  step: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    icon: Wallet,
    step: '01',
    title: 'Adquiere tokens',
    description:
      'Elige un plan mensual o recarga puntual. Cada token es una unidad de trabajo jurídico equivalente.',
  },
  {
    icon: Send,
    step: '02',
    title: 'Crea una solicitud',
    description:
      'Describe tu necesidad legal. Te indicamos el coste estimado en tokens antes de confirmar.',
  },
  {
    icon: FileCheck,
    step: '03',
    title: 'Recibe el resultado',
    description:
      'Un especialista resuelve tu caso y el entregable queda disponible en tu gestor documental.',
  },
];

interface Factor {
  icon: LucideIcon;
  label: string;
}

const FACTORS: Factor[] = [
  { icon: Clock, label: 'Tiempo' },
  { icon: Layers, label: 'Complejidad' },
  { icon: Zap, label: 'Urgencia' },
  { icon: ShieldCheck, label: 'Responsabilidad' },
  { icon: TrendingUp, label: 'Impacto económico' },
  { icon: Target, label: 'Valor estratégico' },
];

const INCLUDES = [
  'Sin caducidad mientras tu plan esté activo',
  'Coste transparente por solicitud',
  'Bonificaciones por renovación anual',
  'Reembolso de tokens en solicitudes canceladas',
];

export function TokensSection() {
  return (
    <section id="tokens" className="relative overflow-hidden bg-navy-950 py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid-faint bg-[size:44px_44px] opacity-25" />
        <div className="absolute left-1/2 top-0 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-accent-600/15 blur-[120px]" />
      </div>

      <div className="container-page relative">
        <SectionHeading
          tone="light"
          eyebrow="Cómo funcionan los tokens"
          title="Un modelo flexible, predecible y sin sorpresas"
          description="Olvídate de las tarifas por hora opacas. Con tokens sabes exactamente qué pagas y para qué."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="mt-16 grid gap-6 md:grid-cols-3"
        >
          {STEPS.map(({ icon: Icon, step, title, description }) => (
            <motion.div
              key={step}
              variants={fadeUp}
              className="relative rounded-2xl border border-navy-400/40 bg-navy-800/50 p-7 backdrop-blur"
            >
              <span className="absolute right-6 top-6 text-5xl font-bold text-accent-400/30">
                {step}
              </span>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500/20 text-accent-400">
                <Icon size={22} />
              </span>
              <h3 className="mt-6 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-navy-100">{description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* qué determina el valor de un token */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-10 rounded-2xl border border-navy-400/40 bg-navy-800/50 p-7"
        >
          <h3 className="text-center text-base font-semibold text-white">
            ¿Qué determina el valor de un token?
          </h3>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {FACTORS.map(({ icon: Icon, label }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="flex items-center gap-3 rounded-xl border border-navy-400/40 bg-navy-800/50 px-4 py-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-500/20 text-accent-400">
                  <Icon size={16} />
                </span>
                <span className="text-sm font-medium text-navy-100">{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* franja de inclusiones */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-6 grid gap-4 rounded-2xl border border-navy-400/40 bg-navy-800/50 p-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {INCLUDES.map((item) => (
            <div key={item} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-500/20 text-accent-400">
                <Check size={13} />
              </span>
              <span className="text-sm text-navy-100">{item}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
