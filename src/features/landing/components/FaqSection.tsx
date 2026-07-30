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
      'No somos una firma de abogados tradicional, construimos relaciones cercanas y sólidas de largo plazo con las empresas que requieren de acompañamiento jurídico estratégico, de manera que gestionamos relaciones de confianza más allá del componente negocial.',
  },
  {
    question: '¿Qué es exactamente un token?',
    answer:
      'Es una unidad de consumo mediante la cual se descuenta el uso de los servicios jurídicos prestados por JurisTech. Su valor se determina según la naturaleza del servicio, la extensión documental, la urgencia, la complejidad técnica, la responsabilidad profesional y el alcance del entregable.',
  },
  {
    question: '¿Los tokens caducan?',
    answer:
      'Sí, cada bolsa de tokens tiene una vigencia durante la cual el afiliado deberá hacer uso.',
  },
  {
    question: '¿Qué sucede si cancelo una solicitud?',
    answer:
      'Si una solicitud se cancela antes de iniciarse la gestión, los tokens se reembolsan automáticamente a tu bolsa.',
  },
  {
    question: '¿Puedo recargar mi bolsa de tokens?',
    answer: 'Sí, el afiliado puede recargar su bolsa en cualquier momento.',
  },
  {
    question: '¿El servicio de JurisTech exige cláusula de permanencia?',
    answer: 'No, el afiliado puede cancelar su suscripción en cualquier momento.',
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-white py-24 sm:py-28">
      <div className="container-page">
        <SectionHeading title="Preguntas frecuentes" />

        <div className="mx-auto mt-14 max-w-3xl divide-y divide-sand-200 border-y border-sand-200">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.question}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-base font-semibold text-stone-900">{faq.question}</span>
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sand-200 text-stone-500 transition-all duration-300',
                      isOpen && 'rotate-45 border-brand-300 bg-brand-50 text-brand-600',
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
                      <p className="pb-5 pr-10 text-justify text-base font-normal leading-relaxed text-stone-500">
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
