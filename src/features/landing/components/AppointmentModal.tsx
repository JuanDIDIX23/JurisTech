import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
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
  AlertCircle,
} from 'lucide-react';
import { Button, Input } from '@shared/ui';
import { cn } from '@shared/lib/cn';
import type { ScheduleConfig } from '@shared/config/schedule';
import { useScheduleConfig } from '@shared/hooks/useScheduleConfig';
import { crearCita, obtenerHorasOcupadas } from '@shared/services/citas';

interface AppointmentModalProps {
  open: boolean;
  onClose: () => void;
}

interface CitaConfirmada {
  nombre: string;
  fechaLabel: string;
  hora: string;
}

const WEEKDAY_HEADERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MONTH_FORMATTER = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' });
const DAY_FORMATTER = new Intl.DateTimeFormat('es-CO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

/**
 * Fecha en YYYY-MM-DD usando los componentes locales.
 * No se usa toISOString(): convierte a UTC y en Colombia (UTC-5) devolvería
 * el día anterior para cualquier hora antes de las 19:00.
 */
function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isDateAvailable(date: Date, today: Date, schedule: ScheduleConfig): boolean {
  const day = startOfDay(date);
  const min = addDays(startOfDay(today), schedule.advanceDays);
  const max = addDays(startOfDay(today), schedule.maxDays);
  return day >= min && day <= max && schedule.availableDays.includes(isoWeekday(day));
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

/**
 * Genera los horarios recorriendo cada franja por separado. Con
 * 9–12 y 14–16 en pasos de 60 min salen 09:00, 10:00, 11:00, 14:00 y 15:00:
 * la pausa de almuerzo nunca aparece porque no pertenece a ninguna franja.
 */
function generateTimeSlots(schedule: ScheduleConfig): string[] {
  const paso = schedule.slotDuration > 0 ? schedule.slotDuration : 60;
  const slots: string[] = [];

  for (const franja of schedule.franjas) {
    const desde = franja.inicio * 60;
    const hasta = franja.fin * 60;
    for (let m = desde; m + paso <= hasta; m += paso) {
      const h = Math.floor(m / 60)
        .toString()
        .padStart(2, '0');
      const mm = (m % 60).toString().padStart(2, '0');
      slots.push(`${h}:${mm}`);
    }
  }

  // Franjas solapadas o desordenadas no deben producir horarios repetidos.
  return [...new Set(slots)].sort();
}

export function AppointmentModal({ open, onClose }: AppointmentModalProps) {
  const today = startOfDay(new Date());
  // El horario vive en Supabase (config.schedule) y lo edita el admin en
  // /admin/config; SCHEDULE_CONFIG solo sirve de fallback.
  const { schedule, loading: cargandoSchedule } = useScheduleConfig();
  const timeSlots = useMemo(() => generateTimeSlots(schedule), [schedule]);
  const [viewMonth, setViewMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');

  const [horasOcupadas, setHorasOcupadas] = useState<string[]>([]);
  const [cargandoHoras, setCargandoHoras] = useState(false);
  const [errorHoras, setErrorHoras] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmada, setConfirmada] = useState<CitaConfirmada | null>(null);

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
      setHorasOcupadas([]);
      setErrorHoras(false);
      setError(null);
      setConfirmada(null);
      setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const cargarHoras = useCallback(async (date: Date) => {
    setCargandoHoras(true);
    setErrorHoras(false);
    try {
      const ocupadas = await obtenerHorasOcupadas(toISODate(date));
      setHorasOcupadas(ocupadas);
    } catch {
      // Sin disponibilidad confirmada no se bloquea el agendamiento:
      // se avisa y se dejan todos los slots activos.
      setHorasOcupadas([]);
      setErrorHoras(true);
    } finally {
      setCargandoHoras(false);
    }
  }, []);

  function handleSelectDate(date: Date) {
    setSelectedDate(date);
    setSelectedTime(null);
    setError(null);
    void cargarHoras(date);
  }

  const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxDate = addDays(today, schedule.maxDays);
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formValid || submitting || !selectedDate || !selectedTime) return;

    if (!EMAIL_REGEX.test(email.trim())) {
      setError('El correo no tiene un formato válido.');
      return;
    }
    if ((phone.match(/\d/g) ?? []).length < 7) {
      setError('El teléfono debe tener al menos 7 dígitos.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await crearCita({
        nombre: name,
        empresa: company,
        telefono: phone,
        correo: email,
        fecha: toISODate(selectedDate),
        hora: selectedTime,
        motivo: reason,
      });

      setConfirmada({
        nombre: name.trim(),
        fechaLabel: DAY_FORMATTER.format(selectedDate),
        hora: selectedTime,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No pudimos agendar tu cita. Revisa tu conexión e inténtalo de nuevo.',
      );
      // Si la franja se ocupó mientras rellenaba, refrescamos la lista.
      void cargarHoras(selectedDate);
    } finally {
      setSubmitting(false);
    }
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
              {confirmada ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={28} />
                  </span>
                  <h4 className="mt-5 text-lg font-semibold text-stone-900">
                    ¡Listo, {confirmada.nombre.split(' ')[0]}!
                  </h4>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone-500">
                    Tu cita quedó registrada. Te contactaremos para confirmarla.
                  </p>

                  <dl className="mt-6 w-full max-w-sm space-y-2 rounded-2xl border border-sand-200 bg-sand-50 p-5 text-left">
                    <div className="flex justify-between gap-4">
                      <dt className="text-sm text-stone-500">Fecha</dt>
                      <dd className="text-sm font-semibold capitalize text-stone-900">
                        {confirmada.fechaLabel}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-sm text-stone-500">Hora</dt>
                      <dd className="text-sm font-semibold text-stone-900">
                        {confirmada.hora} (hora Colombia)
                      </dd>
                    </div>
                  </dl>

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
                            setViewMonth(
                              new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1),
                            )
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
                            setViewMonth(
                              new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1),
                            )
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
                          const available = isDateAvailable(date, today, schedule);
                          const isSelected =
                            selectedDate &&
                            startOfDay(date).getTime() === startOfDay(selectedDate).getTime();
                          return (
                            <button
                              type="button"
                              key={date.toISOString()}
                              disabled={!available || submitting || cargandoSchedule}
                              onClick={() => handleSelectDate(date)}
                              className={cn(
                                'flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-colors',
                                !available && 'cursor-not-allowed text-stone-300',
                                available &&
                                  !isSelected &&
                                  'text-stone-900 hover:bg-brand-50 hover:text-brand-700',
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

                    {!selectedDate && (
                      <p className="mt-3 text-sm text-stone-400">
                        Selecciona primero una fecha disponible.
                      </p>
                    )}

                    {selectedDate && cargandoHoras && (
                      <p className="mt-3 flex items-center gap-2 text-sm text-stone-500">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-sand-200 border-t-brand-500" />
                        Consultando disponibilidad…
                      </p>
                    )}

                    {selectedDate && !cargandoHoras && (
                      <>
                        {errorHoras && (
                          <p className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            No pudimos verificar las horas ocupadas. Puedes continuar; confirmaremos
                            la disponibilidad al contactarte.
                          </p>
                        )}
                        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {timeSlots.map((time) => {
                            const ocupada = horasOcupadas.includes(time);
                            const isSelected = selectedTime === time;
                            return (
                              <button
                                type="button"
                                key={time}
                                disabled={ocupada || submitting}
                                title={ocupada ? 'Horario no disponible' : undefined}
                                onClick={() => setSelectedTime(time)}
                                className={cn(
                                  'rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
                                  ocupada &&
                                    'cursor-not-allowed border-sand-200 bg-sand-100 text-stone-300 line-through',
                                  !ocupada &&
                                    !isSelected &&
                                    'border-sand-200 text-stone-700 hover:border-brand-300 hover:bg-brand-50',
                                  isSelected && 'border-brand-600 bg-brand-600 text-white',
                                )}
                              >
                                {time}
                              </button>
                            );
                          })}
                        </div>
                      </>
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
                        disabled={submitting}
                        required
                      />
                      <Input
                        placeholder="Empresa"
                        leftIcon={<Building2 size={16} />}
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        disabled={submitting}
                        required
                      />
                      <Input
                        type="email"
                        placeholder="Correo"
                        leftIcon={<Mail size={16} />}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={submitting}
                        required
                      />
                      <Input
                        type="tel"
                        placeholder="Teléfono"
                        leftIcon={<Phone size={16} />}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={submitting}
                        required
                      />
                      <div className="sm:col-span-2">
                        <Input
                          placeholder="Motivo de la asesoría (opcional)"
                          leftIcon={<MessageSquare size={16} />}
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          disabled={submitting}
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm font-medium text-rose-700"
                    >
                      <p>{error}</p>
                      <button
                        type="submit"
                        className="mt-2 font-semibold underline underline-offset-2 hover:text-rose-900"
                      >
                        Reintentar
                      </button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={!formValid || submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Agendando…
                      </>
                    ) : (
                      'Confirmar cita'
                    )}
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
