import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, CalendarClock, Clock, Laptop, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@shared/ui';
import { fadeUp, staggerContainer } from '@shared/lib/motion';
import { AppointmentModal } from './AppointmentModal';

const TRUST_POINTS = [
  { icon: Clock, label: 'Respuesta en menos de 24 horas' },
  { icon: Laptop, label: '100% remoto, sin desplazamientos' },
  { icon: ShieldCheck, label: 'Sin compromiso ni contratos de permanencia' },
];

const CONTACT_EMAIL = 'contacto@juristech.co';
const MAILTO_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  'Quiero conocer más sobre JurisTech',
)}`;

export function FinalCtaSection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section id="contacto" className="bg-white pb-24 sm:pb-28">
      <div className="container-page">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-950 to-accent-950 px-8 py-16 text-center sm:px-16 sm:py-20"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-grid-faint bg-[size:32px_32px] opacity-20" />
            <div className="absolute -top-24 left-1/4 h-72 w-[30rem] rounded-full bg-accent-500/30 blur-[110px]" />
            <div className="absolute -bottom-24 right-1/4 h-72 w-[26rem] rounded-full bg-accent-400/20 blur-[110px]" />
          </div>

          <div className="relative mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-accent-200 backdrop-blur">
              <Users size={14} />
              Comunidad de afiliados JurisTech
            </span>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              ¿Cansado de pagar por asesoría legal que no controlas?
            </h2>

            <p className="mt-5 text-lg leading-relaxed text-graphite-300">
              Únete a un ecosistema de pymes y especialistas jurídicos conectados por tecnología,
              transparencia y confianza, y accede a un directorio de aliados pensado para hacer
              crecer tu empresa con respaldo legal permanente.
            </p>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="mx-auto mt-8 flex max-w-xl flex-col gap-2.5 sm:flex-row sm:justify-center"
            >
              {TRUST_POINTS.map(({ icon: Icon, label }) => (
                <motion.span
                  key={label}
                  variants={fadeUp}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-left text-sm text-graphite-200 sm:flex-1"
                >
                  <Icon size={16} className="shrink-0 text-accent-300" />
                  {label}
                </motion.span>
              ))}
            </motion.div>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                type="button"
                size="lg"
                rightIcon={<CalendarClock size={18} />}
                className="w-full sm:w-auto"
                onClick={() => setModalOpen(true)}
              >
                Agenda una cita
              </Button>
              <a href={MAILTO_HREF}>
                <Button
                  size="lg"
                  variant="outline"
                  leftIcon={<Mail size={16} />}
                  className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
                >
                  Escríbenos
                </Button>
              </a>
            </div>

            <p className="mt-6 text-sm text-graphite-400">
              Sin contratos de permanencia · Activación en minutos · Acompañamiento humano cuando
              lo necesitas
            </p>
          </div>
        </motion.div>
      </div>

      <AppointmentModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
}
