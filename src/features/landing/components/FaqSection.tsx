import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { cn } from '@shared/lib/cn';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: '¿Qué significa ser afiliado de JurisTech?',
    answer:
      'Ser afiliado significa formar parte de nuestra comunidad de pymes que acceden a servicios jurídicos preventivos y remotos mediante tokens, sin contratos de permanencia ni honorarios fijos.',
  },
  {
    question: '¿Qué es exactamente un token?',
    answer:
      'Un token es una unidad de trabajo jurídico. Cada solicitud tiene un coste estimado en tokens que conoces antes de confirmarla, de modo que pagas exactamente por el trabajo que necesitas.',
  },
  {
    question: '¿Los tokens caducan?',
    answer:
      'Los tokens incluidos en tu plan se mantienen disponibles mientras tu afiliación esté activa. Además, recibes bonificaciones por renovación anual.',
  },
  {
    question: '¿Qué pasa si cancelo una solicitud?',
    answer:
      'Si una solicitud se cancela antes de iniciarse el trabajo, los tokens reservados se reembolsan automáticamente a tu saldo.',
  },
  {
    question: '¿Quién resuelve mis solicitudes?',
    answer:
      'Un equipo jurídico multidisciplinar de especialistas verificados. Cada caso se asigna al profesional adecuado según el área de especialidad.',
  },
  {
    question: '¿Cómo se protege mi información?',
    answer:
      'Aplicamos cifrado en tránsito, control de acceso por roles y buenas prácticas de seguridad de nivel empresarial. Tu documentación confidencial está siempre protegida.',
  },
  {
    question: '¿Puedo escalar mi plan más adelante?',
    answer:
      'Sí. Puedes subir o bajar de plan en cualquier momento, o realizar recargas puntuales de tokens según la demanda de tu empresa.',
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-white py-24 sm:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Preguntas frecuentes"
          title="Todo lo que necesitas saber"
          description="¿No encuentras tu respuesta? Escríbenos y te ayudamos encantados."
        />

        <div className="mx-auto mt-14 max-w-3xl divide-y divide-graphite-200/80 border-y border-graphite-200/80">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.question}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-[16px] font-semibold text-navy-900">{faq.question}</span>
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-graphite-200 text-graphite-500 transition-all duration-300',
                      isOpen && 'rotate-45 border-accent-300 bg-accent-50 text-accent-600',
                    )}
                  >
                    <Plus size={16} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 pr-10 text-[15px] leading-relaxed text-graphite-500">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
