import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Mail,
  CalendarClock,
  Send,
  User,
  Building2,
  Phone,
  ArrowUpRight,
} from 'lucide-react';
import { Button, Input, Select } from '@shared/ui';
import { fadeUp } from '@shared/lib/motion';
import { CONTACT_CONFIG } from '@shared/config/schedule';
import { AppointmentModal } from './AppointmentModal';

// Coincide con las 4 áreas de ServicesSection + "Otro".
const HELP_OPTIONS = [
  { value: '', label: '¿En qué te podemos ayudar?' },
  { value: 'Derecho Laboral', label: 'Derecho Laboral' },
  { value: 'Seguridad Social', label: 'Seguridad Social' },
  { value: 'Derecho Contractual', label: 'Derecho Contractual' },
  { value: 'Consultoría Empresarial', label: 'Consultoría Empresarial' },
  { value: 'Otro', label: 'Otro' },
];

const WHATSAPP_HREF = `https://wa.me/${CONTACT_CONFIG.whatsappNumber}?text=${encodeURIComponent(
  'Hola JurisTech, quiero conocer más sobre la afiliación.',
)}`;
const EMAIL_HREF = `mailto:${CONTACT_CONFIG.email}?subject=${encodeURIComponent(
  'Quiero conocer más sobre JurisTech',
)}`;

export function ContactoSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');

  const formValid =
    name.trim() !== '' && company.trim() !== '' && phone.trim() !== '' && topic !== '';

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formValid) return;
    const subject = `Nuevo contacto — ${name} (${company})`;
    const bodyLines = [
      `Nombre: ${name}`,
      `Empresa: ${company}`,
      `Teléfono: ${phone}`,
      `Correo: ${email.trim() || 'No indicado'}`,
      `¿En qué podemos ayudar?: ${topic}`,
      '',
      'Mensaje:',
      message.trim() || 'Sin mensaje adicional.',
    ];
    window.location.href = `mailto:${CONTACT_CONFIG.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
  }

  return (
    <section id="contacto" className="bg-white pb-24 sm:pb-28">
      <div className="container-page">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid overflow-hidden rounded-3xl border border-sand-200 shadow-card lg:grid-cols-2"
        >
          {/* columna izquierda — oscura */}
          <div className="relative overflow-hidden bg-stone-900 p-8 sm:p-12">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-grid-faint bg-[size:32px_32px] opacity-20" />
              <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-brand-600/20 blur-[100px]" />
            </div>

            <div className="relative">
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-300">
                Hablemos
              </span>
              <h2 className="mt-3 text-3xl font-bold leading-snug tracking-tight text-white">
                Encontremos juntos tu solución jurídica
              </h2>
              <p className="mt-4 text-base font-normal leading-relaxed text-stone-300">
                Cuéntanos qué necesita tu empresa. Te respondemos en menos de 24 horas y sin
                compromiso, por el canal que prefieras.
              </p>

              {/* canales directos */}
              <div className="mt-8 space-y-3">
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-2xl border border-stone-700 bg-stone-800 p-4 transition-colors hover:border-brand-500/60"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300">
                    <MessageCircle size={20} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">WhatsApp</p>
                    <p className="text-sm font-normal text-stone-400">
                      {CONTACT_CONFIG.whatsappDisplay}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={18}
                    className="ml-auto text-stone-500 transition-colors group-hover:text-brand-300"
                  />
                </a>

                <a
                  href={EMAIL_HREF}
                  className="group flex items-center gap-4 rounded-2xl border border-stone-700 bg-stone-800 p-4 transition-colors hover:border-brand-500/60"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300">
                    <Mail size={20} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">Correo</p>
                    <p className="truncate text-sm font-normal text-stone-400">
                      {CONTACT_CONFIG.email}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={18}
                    className="ml-auto text-stone-500 transition-colors group-hover:text-brand-300"
                  />
                </a>
              </div>

              <Button
                type="button"
                size="lg"
                onClick={() => setModalOpen(true)}
                rightIcon={<CalendarClock size={18} />}
                className="mt-6 w-full"
              >
                Agenda una cita
              </Button>
            </div>
          </div>

          {/* columna derecha — formulario */}
          <div className="bg-white p-8 sm:p-12">
            <h3 className="text-xl font-semibold leading-snug text-stone-900">
              Escríbenos directamente
            </h3>
            <p className="mt-1.5 text-sm font-normal text-stone-500">
              Completa el formulario y te contactamos para ayudarte.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <Input
                placeholder="Nombre *"
                leftIcon={<User size={16} />}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                placeholder="Empresa *"
                leftIcon={<Building2 size={16} />}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
              <Input
                type="tel"
                placeholder="Teléfono *"
                leftIcon={<Phone size={16} />}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <Input
                type="email"
                placeholder="Correo (opcional)"
                leftIcon={<Mail size={16} />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Select
                options={HELP_OPTIONS}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                aria-label="¿En qué te podemos ayudar?"
                required
              />
              <textarea
                placeholder="Mensaje (opcional)"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-sand-200 bg-white px-3.5 py-2.5 text-sm font-normal text-stone-900 placeholder:text-stone-400 transition-colors focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
              />

              <Button
                type="submit"
                size="lg"
                rightIcon={<Send size={16} />}
                className="w-full"
                disabled={!formValid}
              >
                Enviar mensaje
              </Button>
              <p className="text-xs font-normal text-stone-400">
                Al enviar, se abrirá tu cliente de correo con los datos ya formateados.
              </p>
            </form>
          </div>
        </motion.div>
      </div>

      <AppointmentModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
}
