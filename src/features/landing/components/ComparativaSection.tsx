import { motion } from 'framer-motion';
import { Wallet, Search, ShieldAlert, Users2, Laptop, Check, X } from 'lucide-react';
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

export function ComparativaSection() {
  return (
    <section id="comparativa" className="bg-white py-24 sm:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Comparativa"
          title="Derecho pensado para pymes, no para despachos tradicionales"
          description="Las firmas tradicionales operan con honorarios permanentes y cobros por horas difíciles de anticipar. JurisTech transforma esa experiencia: accedes a servicios especializados solo cuando los necesitas y conservas control total sobre tu inversión legal."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-2xl border border-sand-200 shadow-card"
        >
          {/* encabezado */}
          <div className="hidden grid-cols-[1.4fr_1fr_1fr] sm:grid">
            <span className="px-6 py-4 text-xs font-semibold uppercase tracking-widest text-stone-500">
              Beneficio
            </span>
            <span className="px-6 py-4 text-xs font-semibold uppercase tracking-widest text-stone-500">
              Firma tradicional
            </span>
            <span className="bg-brand-50 px-6 py-4 text-xs font-semibold uppercase tracking-widest text-brand-700">
              JurisTech
            </span>
          </div>

          {/* filas */}
          {COMPARISON.map(({ icon: Icon, label, traditional, juristech }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              className="grid grid-cols-1 border-t border-sand-200 sm:grid-cols-[1.4fr_1fr_1fr]"
            >
              {/* beneficio */}
              <div className="flex items-center gap-3 px-6 py-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
                  <Icon size={16} />
                </span>
                <span className="text-sm font-semibold text-stone-900">{label}</span>
              </div>

              {/* firma tradicional */}
              <div className="flex items-start gap-2 px-6 pb-5 pt-0 sm:items-center sm:py-5">
                <span className="mb-1 block w-full text-xs font-semibold uppercase tracking-widest text-stone-500 sm:hidden">
                  Firma tradicional
                </span>
                <X size={16} className="mt-0.5 shrink-0 text-stone-300 sm:mt-0" />
                <span className="text-sm font-normal text-stone-400 line-through decoration-stone-300">
                  {traditional}
                </span>
              </div>

              {/* juristech */}
              <div className="flex items-start gap-2 bg-brand-50 px-6 pb-5 pt-0 sm:items-center sm:py-5">
                <span className="mb-1 block w-full text-xs font-semibold uppercase tracking-widest text-brand-700 sm:hidden">
                  JurisTech
                </span>
                <Check size={16} className="mt-0.5 shrink-0 text-brand-600 sm:mt-0" />
                <span className="text-sm font-medium text-stone-800">{juristech}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
