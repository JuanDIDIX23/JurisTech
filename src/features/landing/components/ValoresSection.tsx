import { motion } from 'framer-motion';
import { Lightbulb, ShieldCheck, Lock, Award, Heart } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { fadeUp, staggerContainer } from '@shared/lib/motion';
import { cn } from '@shared/lib/cn';

interface Value {
  icon: LucideIcon;
  name: string;
  description: string;
}

const VALUES: Value[] = [
  {
    icon: Lightbulb,
    name: 'Innovación',
    description:
      'Integramos tecnología, atención 100% remota y un modelo de tokens para ofrecer una experiencia jurídica adaptada a cómo opera realmente tu empresa.',
  },
  {
    icon: ShieldCheck,
    name: 'Transparencia',
    description:
      'El afiliado siempre sabe qué servicio recibe y cuánto cuesta antes de confirmarlo. Sin tarifas ocultas ni sorpresas al final del mes.',
  },
  {
    icon: Lock,
    name: 'Confidencialidad',
    description:
      'Protegemos tu información con reserva profesional y seguridad de datos de nivel empresarial, incluso después de finalizada la relación contractual.',
  },
  {
    icon: Award,
    name: 'Responsabilidad',
    description:
      'Asumimos que cada recomendación impacta directamente la operación del afiliado; por eso respondemos con rigor y criterio en cada solicitud.',
  },
  {
    icon: Heart,
    name: 'Confianza',
    description:
      'Es el motor de todo lo que hacemos. Se construye con calidad, cumplimiento y trazabilidad en cada gestión que realizamos.',
  },
];

export function ValoresSection() {
  return (
    <section id="valores" className="bg-sand-50 py-24 sm:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Nuestros valores"
          title="Los principios que guían cada decisión"
          description="Cinco valores que definen cómo trabajamos y cómo acompañamos a cada pyme afiliada."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-6"
        >
          {VALUES.map(({ icon: Icon, name, description }, i) => (
            <motion.div
              key={name}
              variants={fadeUp}
              className={cn(
                'rounded-2xl border border-sand-200 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-glow',
                // 3 tarjetas arriba, 2 más anchas abajo
                i < 3 ? 'lg:col-span-2' : 'lg:col-span-3',
              )}
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon size={22} />
              </span>
              <h3 className="mt-5 text-xl font-semibold leading-snug text-stone-900">{name}</h3>
              <p className="mt-2 text-base font-normal leading-relaxed text-stone-500">
                {description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
