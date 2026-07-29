import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Wallet,
  Send,
  FileCheck,
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
    step: '1',
    title: 'Adquiere tu bolsa de tokens',
    description: 'Elige el número de tokens que se adecúe a las necesidades de tu empresa.',
  },
  {
    icon: Send,
    step: '2',
    title: 'Crea una solicitud',
    description: 'Comparte tu necesidad y eleva las solicitudes que necesites para tu empresa.',
  },
  {
    icon: FileCheck,
    step: '3',
    title: 'Resultado',
    description:
      'Nuestro equipo de profesionales atenderá tu solicitud de manera personalizada, remota, trazable, y te indicará el número estimado de tokens para que tengas el control.',
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

const STEP_SPRING = { type: 'spring', stiffness: 260, damping: 18 } as const;

// Entrada escalonada (0.1s entre tarjetas, una sola vez) + hover flotante.
const stepVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98], delay: i * 0.1 },
  }),
  hover: { y: -8, transition: STEP_SPRING },
};

const stepNumberVariants: Variants = {
  hover: { scale: 1.2, transition: STEP_SPRING },
};

export function TokensSection() {
  return (
    <section id="tokens" className="relative overflow-hidden bg-stone-900 py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid-faint bg-[size:44px_44px] opacity-25" />
        <div className="absolute left-1/2 top-0 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-brand-600/15 blur-[120px]" />
      </div>

      <div className="container-page relative">
        <SectionHeading tone="light" title="¿Cómo funcionan los tokens?" />

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, step, title, description }, i) => (
            <motion.div
              key={step}
              custom={i}
              variants={stepVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              whileHover="hover"
              className="group relative cursor-pointer rounded-2xl border border-stone-700 bg-stone-800 p-7 transition-colors duration-200 hover:border-stone-600 hover:bg-stone-700/60"
            >
              <motion.span
                variants={stepNumberVariants}
                className="absolute right-6 top-6 origin-center text-5xl font-bold text-white transition-colors duration-200 group-hover:text-brand-300"
              >
                {step}
              </motion.span>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400">
                <Icon size={22} />
              </span>
              <h3 className="mt-6 text-xl font-semibold leading-snug text-white">{title}</h3>
              <p className="mt-2 text-base font-normal leading-relaxed text-stone-200">
                {description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* qué determina el valor de un token */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-10 rounded-2xl border border-stone-700 bg-stone-800 p-7"
        >
          <h3 className="text-center text-xl font-semibold leading-snug text-white">
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
                className="flex items-center gap-3 rounded-xl border border-stone-700 bg-stone-900 px-4 py-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/20 text-brand-400">
                  <Icon size={16} />
                </span>
                <span className="text-sm font-medium text-stone-200">{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
