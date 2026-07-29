import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Wallet, ShieldAlert, Laptop, Check, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

interface ComparisonRow {
  icon: LucideIcon;
  traditional: string;
  juristech: string;
  benefit: string;
}

const COMPARISON: ComparisonRow[] = [
  {
    icon: Wallet,
    traditional: 'Honorarios fijos y cobros por horas sin verificación.',
    juristech: 'Tokens que consumes solo cuando los necesitas',
    benefit: 'Control de la inversión',
  },
  {
    icon: ShieldAlert,
    traditional: 'Atención reactiva ante problemas ya ocurridos',
    juristech: 'Acompañamiento preventivo que evita riesgos',
    benefit: 'Prevención de riesgos y toma de decisiones estratégicas',
  },
  {
    icon: Laptop,
    traditional: 'Gestión presencial',
    juristech: 'Gestión 100% remota',
    benefit: 'Eficiencia del tiempo',
  },
];

// Cada fila gestiona su propia entrada (no depende de que un contenedor
// padre le propague la variante) y escalona con un delay por índice.
const rowVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98], delay: i * 0.08 },
  }),
};

export function ComparativaSection() {
  return (
    <section id="comparativa" className="bg-white py-24 sm:py-28">
      <div className="container-page">
        <SectionHeading title="¿Por qué somos diferentes?" />

        <div className="mx-auto mt-20 max-w-4xl">
          {/* encabezado */}
          <div className="hidden grid-cols-[1fr_1fr_1.2fr] px-6 pb-3 sm:grid">
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Firma tradicional
            </span>
            <span className="px-6 text-xs font-semibold uppercase tracking-widest text-brand-700">
              JurisTech
            </span>
            <span className="px-6 text-xs font-semibold uppercase tracking-widest text-stone-500">
              Beneficio
            </span>
          </div>

          {/* filas */}
          <div className="space-y-3">
            {COMPARISON.map(({ icon: Icon, traditional, juristech, benefit }, i) => (
              <motion.div
                key={benefit}
                custom={i}
                variants={rowVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
                className="grid cursor-pointer grid-cols-1 overflow-hidden rounded-2xl border border-sand-200 shadow-card transition-shadow duration-200 hover:shadow-glow sm:grid-cols-[1fr_1fr_1.2fr]"
              >
                {/* firma tradicional */}
                <div className="bg-white px-6 pb-4 pt-5 sm:flex sm:items-center sm:py-5">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-stone-500 sm:hidden">
                    Firma tradicional
                  </span>
                  <span className="flex items-start gap-2">
                    <X size={16} className="mt-0.5 shrink-0 text-stone-300" />
                    <span className="text-sm font-normal text-stone-400 line-through decoration-stone-300">
                      {traditional}
                    </span>
                  </span>
                </div>

                {/* juristech — destacada, con hover propio */}
                <div className="group/cell bg-brand-100 px-6 pb-4 pt-4 transition-colors duration-200 hover:bg-brand-200 sm:flex sm:items-center sm:py-5">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-brand-700 transition-colors duration-200 group-hover/cell:text-brand-900 sm:hidden">
                    JurisTech
                  </span>
                  <span className="flex items-start gap-2">
                    <Check
                      size={16}
                      className="mt-0.5 shrink-0 text-brand-600 transition-colors duration-200 group-hover/cell:text-brand-900"
                    />
                    <span className="text-sm font-medium text-brand-700 transition-colors duration-200 group-hover/cell:text-brand-900">
                      {juristech}
                    </span>
                  </span>
                </div>

                {/* beneficio */}
                <div className="flex items-center gap-3 bg-white px-6 pb-5 pt-4 sm:py-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
                    <Icon size={16} />
                  </span>
                  <span className="text-sm font-semibold text-stone-900">{benefit}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
