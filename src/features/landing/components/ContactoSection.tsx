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
  CheckCircle2,
} from 'lucide-react';
import { Button, Input, Select } from '@shared/ui';
import { fadeUp } from '@shared/lib/motion';
import { useContactConfig } from '@shared/hooks/useContactConfig';
import { crearLead } from '@shared/services/leads';
import { AppointmentModal } from './AppointmentModal';

const HELP_OPTIONS = [
  { value: '', label: '¿En qué te podemos ayudar?' },
  { value: 'Derecho Laboral', label: 'Derecho Laboral' },
  { value: 'Seguridad Social', label: 'Seguridad Social' },
  { value: 'Derecho Contractual', label: 'Derecho Contractual' },
  { value: 'Consultoría Empresarial', label: 'Consultoría Empresarial' },
  { value: 'Otro', label: 'Otro' },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Cuenta solo dígitos: acepta espacios, guiones o prefijo internacional. */
function cantidadDeDigitos(valor: string): number {
  return (valor.match(/\d/g) ?? []).length;
}

export function ContactoSection() {
  const contacto = useContactConfig();
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const whatsappHref = `https://wa.me/${contacto.whatsappNumber}?text=${encodeURIComponent(
    'Hola, me interesa conocer más sobre JurisTech',
  )}`;
  const emailHref = `mailto:${contacto.email}?subject=${encodeURIComponent(
    'Quiero conocer más sobre JurisTech',
  )}`;

  /** Devuelve el primer mensaje de validación, o null si todo es correcto. */
  function validar(): string | null {
    if (name.trim() === '') return 'Escribe tu nombre.';
    if (phone.trim() === '') return 'Escribe tu teléfono.';
    if (cantidadDeDigitos(phone) < 7) return 'El teléfono debe tener al menos 7 dígitos.';
    if (topic === '') return 'Selecciona en qué podemos ayudarte.';
    if (email.trim() !== '' && !EMAIL_REGEX.test(email.trim())) {
      return 'El correo no tiene un formato válido.';
    }
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;

    const problema = validar();
    if (problema) {
      setError(problema);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await crearLead({
        nombre: name,
        empresa: company,
        telefono: phone,
        correo: email,
        servicio: topic,
        mensaje: message,
      });

      setName('');
      setCompany('');
      setPhone('');
      setEmail('');
      setTopic('');
      setMessage('');
      setSuccess(true);
    } catch {
      setError(
        'Hubo un problema al enviar. Intenta de nuevo o escríbenos por WhatsApp.',
      );
    } finally {
      setSubmitting(false);
    }
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
              <h2 className="text-3xl font-bold leading-snug tracking-tight text-white">
                Contacto
              </h2>

              {/* canales directos */}
              <div className="mt-8 space-y-3">
                <a
                  href={whatsappHref}
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
                      {contacto.whatsappDisplay}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={18}
                    className="ml-auto text-stone-500 transition-colors group-hover:text-brand-300"
                  />
                </a>

                <a
                  href={emailHref}
                  className="group flex items-center gap-4 rounded-2xl border border-stone-700 bg-stone-800 p-4 transition-colors hover:border-brand-500/60"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300">
                    <Mail size={20} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">Correo</p>
                    <p className="truncate text-sm font-normal text-stone-400">{contacto.email}</p>
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
            <h3 className="text-xl font-semibold leading-snug text-stone-900">Formulario</h3>

            {success ? (
              <div className="mt-8 flex flex-col items-center py-8 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={28} />
                </span>
                <p className="mt-5 text-base font-semibold text-stone-900">
                  ¡Mensaje enviado! Te contactaremos pronto.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => setSuccess(false)}>
                  Enviar otro mensaje
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                <Input
                  placeholder="Nombre *"
                  leftIcon={<User size={16} />}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                  required
                />
                <Input
                  placeholder="Empresa"
                  leftIcon={<Building2 size={16} />}
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  disabled={submitting}
                />
                <Input
                  type="tel"
                  placeholder="Teléfono *"
                  leftIcon={<Phone size={16} />}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={submitting}
                  required
                />
                <Input
                  type="email"
                  placeholder="Correo (opcional)"
                  leftIcon={<Mail size={16} />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                />
                <Select
                  options={HELP_OPTIONS}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  aria-label="¿En qué te podemos ayudar?"
                  disabled={submitting}
                  required
                />
                <textarea
                  placeholder="Mensaje (opcional)"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={submitting}
                  className="w-full rounded-xl border border-sand-200 bg-white px-3.5 py-2.5 text-sm font-normal text-stone-900 placeholder:text-stone-400 transition-colors focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10 disabled:opacity-60"
                />

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700"
                  >
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  rightIcon={submitting ? undefined : <Send size={16} />}
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Enviando…
                    </>
                  ) : (
                    'Enviar mensaje'
                  )}
                </Button>
                <p className="text-xs font-normal text-stone-400">
                  Los campos marcados con * son obligatorios.
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </div>

      <AppointmentModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
}
