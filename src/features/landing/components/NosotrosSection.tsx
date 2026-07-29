import { motion } from 'framer-motion';
import { Target, Eye } from 'lucide-react';
import { fadeUp, staggerContainer } from '@shared/lib/motion';

const ABOUT_IMAGE = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800';

export function NosotrosSection() {
  return (
    <section id="nosotros" className="bg-white py-24 sm:py-28">
      <div className="container-page">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* imagen */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="relative"
          >
            <div className="overflow-hidden rounded-3xl border border-sand-200 shadow-card">
              <img
                src={ABOUT_IMAGE}
                alt="Equipo de JurisTech en un entorno de trabajo moderno"
                className="aspect-[4/5] w-full object-cover sm:aspect-[4/3] lg:aspect-[4/5]"
                loading="lazy"
              />
            </div>
            {/* acento decorativo */}
            <div className="pointer-events-none absolute -bottom-6 -right-6 -z-10 hidden h-40 w-40 rounded-3xl bg-brand-100 lg:block" />
          </motion.div>

          {/* texto */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl font-bold leading-tight tracking-tight text-stone-900 sm:text-5xl"
            >
              Nuestra historia
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-8 text-justify text-base font-normal leading-relaxed text-stone-500"
            >
              JurisTech nació como respuesta a una necesidad concreta de las pequeñas y medianas
              empresas: acceder a asesoría jurídica especializada, preventiva y flexible, sin asumir
              los costos fijos de una firma tradicional ni la carga económica de mantener abogados
              internos de forma permanente. <br /><br />En ese contexto, JurisTech ofrece una alternativa
              diseñada para prevenir riesgos antes de que se conviertan en conflictos, facilitar la
              toma de decisiones y lograr que cada una de las empresas afiliadas acceda a servicios
              jurídicos conforme sus necesidades, prioridades y ritmo de operación.
            </motion.p>

            {/* misión y visión */}
            <div className="mt-8 space-y-4">
              <motion.div
                variants={fadeUp}
                className="rounded-2xl border border-sand-200 bg-sand-50 p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
                    <Target size={18} />
                  </span>
                  <h3 className="text-xl font-semibold leading-snug text-stone-900">Misión</h3>
                </div>
                <p className="mt-3 text-justify text-base font-normal leading-relaxed text-stone-500">
                  Transformar la experiencia de acceso a los servicios legales de las pequeñas y
                  medianas empresas mediante un modelo innovador de afiliación especializada,
                  preventiva, flexible y de calidad, que integre tecnología, atención remota y un
                  sistema transparente de consumo por tokens.
                </p>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="rounded-2xl border border-sand-200 bg-sand-50 p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
                    <Eye size={18} />
                  </span>
                  <h3 className="text-xl font-semibold leading-snug text-stone-900">Visión</h3>
                </div>
                <p className="mt-3 text-justify text-base font-normal leading-relaxed text-stone-500">
                  Ser reconocida en Colombia como empresa referente en la innovación de los servicios
                  legales, ofreciendo a las pymes una experiencia jurídica de alta calidad,
                  eficiente, transparente, confiable y personalizada.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
