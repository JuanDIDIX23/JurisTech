import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Lightbulb, ShieldCheck, Award, Heart } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

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
      'Integramos tecnología, atención remota, trazabilidad y un sistema flexible de tokens para ofrecer una experiencia adaptada a las dinámicas empresariales.',
  },
  {
    icon: ShieldCheck,
    name: 'Transparencia',
    description:
      'Comunicamos de manera clara el alcance de cada servicio, el consumo estimado de tokens, los tiempos de respuesta y las condiciones de atención. Nuestros afiliados deben comprender qué servicio recibirán, cómo se desarrollará, cuál será su consumo y qué resultados pueden esperar.',
  },
  {
    icon: Award,
    name: 'Responsabilidad',
    description:
      'Nuestro objetivo es contribuir a que su empresa funcione mejor, tome decisiones más seguras y alcance sus metas. Por ello, disponemos de nuestra capacidad profesional para prestar servicios jurídicos de calidad, oportunos y ajustados a las necesidades reales de cada afiliado.',
  },
  {
    icon: Heart,
    name: 'Confianza',
    description:
      'Es nuestro motor principal. Construimos relaciones cercanas y de largo plazo con nuestras empresas afiliadas. La confianza se desarrolla mediante la calidad del servicio, la protección de la información, el cumplimiento de los compromisos, la transparencia y trazabilidad en el consumo de tokens.',
  },
];

const SPRING = { type: 'spring', stiffness: 300, damping: 20 } as const;

// Entrada autónoma por tarjeta + estado "hover" que se propaga al icono.
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98], delay: i * 0.08 },
  }),
  hover: { y: -6, transition: SPRING },
};

const iconVariants: Variants = {
  hover: { rotate: 8, transition: SPRING },
};

export function ValoresSection() {
  return (
    <section id="valores" className="bg-brand-900 py-24 sm:py-28">
      <div className="container-page">
        <SectionHeading tone="light" title="Nuestros valores" />

        <div className="mt-20 grid gap-8 sm:grid-cols-2">
          {VALUES.map(({ icon: Icon, name, description }, i) => (
            <motion.div
              key={name}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              whileHover="hover"
              whileTap={{ scale: 0.98 }}
              className="group w-full cursor-pointer rounded-2xl border border-transparent bg-white p-8 shadow-card transition-[border-color,box-shadow] duration-200 hover:border-brand-200 hover:shadow-glow sm:p-10"
            >
              <motion.span
                variants={iconVariants}
                className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors duration-200 group-hover:bg-brand-100 group-hover:text-brand-700"
              >
                <Icon size={26} />
              </motion.span>
              <h3 className="mt-6 text-xl font-bold leading-snug text-stone-900 sm:text-2xl">
                {name}
              </h3>
              <p className="mt-3 text-justify text-base font-normal leading-relaxed text-stone-600 sm:text-lg">
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
