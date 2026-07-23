import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Building2,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle2,
  CalendarDays,
} from 'lucide-react';
import { Button, Input } from '@shared/ui';
import { cn } from '@shared/lib/cn';
import { SCHEDULE_CONFIG } from '@shared/config/schedule';

interface AppointmentModalProps {
  open: boolean;
  onClose: () => void;
}

const WEEKDAY_HEADERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MONTH_FORMATTER = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' });
const DAY_FORMATTER = new Intl.DateTimeFormat('es-CO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isoWeekday(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

function isDateAvailable(date: Date, today: Date): boolean {
  const day = startOfDay(date);
  const min = addDays(startOfDay(today), SCHEDULE_CONFIG.advanceDays);
  const max = addDays(startOfDay(today), SCHEDULE_CONFIG.maxDays);
  return day >= min && day <= max && SCHEDULE_CONFIG.availableDays.includes(isoWeekday(day));
}

function buildCalendarCells(monthDate: Date): (Date | null)[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = isoWeekday(firstOfMonth) - 1;

  const cells: (Date | null)[] = Array.from({ length: leadingBlanks }, () => null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }
  return cells;
}

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  const startMinutes = SCHEDULE_CONFIG.startHour * 60;
  const endMinutes = SCHEDULE_CONFIG.endHour * 60;
  for (let m = startMinutes; m + SCHEDULE_CONFIG.slotDuration <= endMinutes; m += SCHEDULE_CONFIG.slotDuration) {
    const h = Math.floor(m / 60)
      .toString()
      .padStart(2, '0');
    const mm = (m % 60).toString().padStart(2, '0');
    slots.push(`${h}:${mm}`);
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();
const CONTACT_EMAIL = 'contacto@juristech.co';

export function AppointmentModal({ open, onClose }: AppointmentModalProps) {
  const today = startOfDay(new Date());
  const [viewMonth, setViewMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setSelectedDate(null);
      setSelectedTime(null);
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setReason('');
      setSubmitted(false);
      setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxDate = addDays(today, SCHEDULE_CONFIG.maxDays);
  const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  const canGoPrev = viewMonth > minMonth;
  const canGoNext = viewMonth < maxMonth;

  const formValid =
    selectedDate !== null &&
    selectedTime !== null &&
    name.trim() !== '' &&
    company.trim() !== '' &&
    email.trim() !== '' &&
    phone.trim() !== '';

  function handleSelectDate(date: Date) {
    setSelectedDate(date);
    setSelectedTime(null);
  }

  function buildMailto(): string {
    const subject = 'Solicitud de cita — JurisTech';
    const dateLabel = selectedDate ? DAY_FORMATTER.format(selectedDate) : '';
    const bodyLines = [
      `Nombre: ${name}`,
      `Empresa: ${company}`,
      `Correo: ${email}`,
      `Teléfono: ${phone}`,
      `Fecha solicitada: ${dateLabel}`,
      `Hora solicitada: ${selectedTime} (hora Colombia)`,
      `Motivo: ${reason.trim() || 'No especificado'}`,
    ];
    const body = bodyLines.join('\n');
    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formValid) return;
    window.location.href = buildMailto();
    setSubmitted(true);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-glow"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <div className="flex items-center justify-between border-b border-sand-200 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Agenda una asesoría</h3>
                <p className="text-sm text-stone-500">
                  Elige fecha, hora y cuéntanos un poco de tu empresa.
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-9 w-9 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-sand-100 hover:text-stone-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-6">
              {submitted ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={28} />
                  </span>
                  <h4 className="mt-5 text-lg font-semibold text-stone-900">
                    ¡Listo, {name.split(' ')[0]}!
                  </h4>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone-500">
                    Abrimos tu cliente de correo con los datos de tu cita del{' '}
                    {selectedDate && DAY_FORMATTER.format(selectedDate)} a las {selectedTime}. Solo
                    confirma el envío y te contactaremos para validar el espacio.
                  </p>
                  <Button className="mt-6" onClick={onClose}>
                    Cerrar
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-7">
                  {/* paso 1: calendario */}
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                      <CalendarDays size={16} className="text-brand-600" />
                      1. Elige una fecha
                    </h4>
                    <div className="mt-3 rounded-2xl border border-sand-200 p-4">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          disabled={!canGoPrev}
                          onClick={() =>
                            setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-sand-100 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-semibold capitalize text-stone-900">
                          {MONTH_FORMATTER.format(viewMonth)}
                        </span>
                        <button
                          type="button"
                          disabled={!canGoNext}
                          onClick={() =>
                            setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-sand-100 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-medium text-stone-400">
                        {WEEKDAY_HEADERS.map((d) => (
                          <span key={d}>{d}</span>
                        ))}
                      </div>
                      <div className="mt-1 grid grid-cols-7 gap-1">
                        {buildCalendarCells(viewMonth).map((date, i) => {
                          if (!date) return <span key={`blank-${i}`} />;
                          const available = isDateAvailable(date, today);
                          const isSelected =
                            selectedDate && startOfDay(date).getTime() === startOfDay(selectedDate).getTime();
                          return (
                            <button
                              type="button"
                              key={date.toISOString()}
                              disabled={!available}
                              onClick={() => handleSelectDate(date)}
                              className={cn(
                                'flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-colors',
                                !available && 'cursor-not-allowed text-stone-300',
                                available && !isSelected && 'text-stone-900 hover:bg-brand-50 hover:text-brand-700',
                                isSelected && 'bg-brand-600 font-semibold text-white',
                              )}
                            >
                              {date.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* paso 2: hora */}
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                      <Clock size={16} className="text-brand-600" />
                      2. Elige un horario
                    </h4>
                    {selectedDate ? (
                      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {TIME_SLOTS.map((time) => (
                          <button
                            type="button"
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={cn(
                              'rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
                              selectedTime === time
                                ? 'border-brand-600 bg-brand-600 text-white'
                                : 'border-sand-200 text-stone-700 hover:border-brand-300 hover:bg-brand-50',
                            )}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-stone-400">
                        Selecciona primero una fecha disponible.
                      </p>
                    )}
                  </div>

                  {/* paso 3: datos */}
                  <div>
                    <h4 className="text-sm font-semibold text-stone-900">3. Tus datos</h4>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <Input
                        placeholder="Nombre completo"
                        leftIcon={<User size={16} />}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                      <Input
                        placeholder="Empresa"
                        leftIcon={<Building2 size={16} />}
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        required
                      />
                      <Input
                        type="email"
                        placeholder="Correo"
                        leftIcon={<Mail size={16} />}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <Input
                        type="tel"
                        placeholder="Teléfono"
                        leftIcon={<Phone size={16} />}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                      <div className="sm:col-span-2">
                        <Input
                          placeholder="Motivo de la asesoría (opcional)"
                          leftIcon={<MessageSquare size={16} />}
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={!formValid}>
                    Confirmar cita
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
