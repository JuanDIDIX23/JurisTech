import { motion } from 'framer-motion';
import { Gauge, ShieldCheck, Layers, Clock, LineChart, Lock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { fadeUp, staggerContainer } from '@shared/lib/motion';

interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

const BENEFITS: Benefit[] = [
  {
    icon: Gauge,
    title: 'Respuesta ágil',
    description:
      'Solicita asesoría y recibe avances en horas, no semanas. Seguimiento en tiempo real de cada caso.',
  },
  {
    icon: Layers,
    title: 'Modelo flexible por tokens',
    description:
      'Paga solo por lo que consumes. Escala hacia arriba o abajo sin contratos rígidos ni costes ocultos.',
  },
  {
    icon: ShieldCheck,
    title: 'Especialistas verificados',
    description:
      'Un equipo jurídico multidisciplinar revisa cada solicitud según el área de especialidad.',
  },
  {
    icon: Clock,
    title: 'Todo en un solo lugar',
    description:
      'Documentos, solicitudes y movimientos centralizados. Sin correos perdidos ni versiones duplicadas.',
  },
  {
    icon: LineChart,
    title: 'Visibilidad total',
    description:
      'Métricas claras de consumo y estado de tus solicitudes para decidir con datos, no con suposiciones.',
  },
  {
    icon: Lock,
    title: 'Seguridad de nivel empresarial',
    description:
      'Cifrado en tránsito y control de acceso. Tu información sensible siempre protegida.',
  },
];

export function BenefitsSection() {
  return (
    <section id="beneficios" className="bg-white py-24 sm:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Beneficios"
          title="Una forma más inteligente de gestionar lo legal"
          description="Diseñado para equipos que necesitan respuestas jurídicas fiables sin la fricción de los despachos tradicionales."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {BENEFITS.map(({ icon: Icon, title, description }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="group rounded-2xl border border-graphite-200/70 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent-200 hover:shadow-card"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-accent-300 transition-colors group-hover:bg-accent-600 group-hover:text-white">
                <Icon size={20} />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-navy-900">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-graphite-500">{description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
