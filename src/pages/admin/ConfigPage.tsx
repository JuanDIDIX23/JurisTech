import { useEffect, useState } from 'react';
import { Clock, Mail, MessageCircle, Save, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { Button, Card, Input, Select } from '@shared/ui';
import {
  esContactoConfig,
  getConfig,
  normalizarSchedule,
  updateConfig,
} from '@shared/services/config';
import type { ContactoConfig } from '@shared/services/config';
import { SCHEDULE_CONFIG } from '@shared/config/schedule';
import type { Franja, ScheduleConfig } from '@shared/config/schedule';
import { CONTACT_CONFIG } from '@shared/config/schedule';
import { cn } from '@shared/lib/cn';

const DIAS = [
  { valor: 1, label: 'Lunes' },
  { valor: 2, label: 'Martes' },
  { valor: 3, label: 'Miércoles' },
  { valor: 4, label: 'Jueves' },
  { valor: 5, label: 'Viernes' },
];

const HORAS = Array.from({ length: 15 }, (_, i) => {
  const h = i + 6; // 6..20
  return { value: String(h), label: `${h.toString().padStart(2, '0')}:00` };
});

const DURACIONES = [
  { value: '30', label: '30 minutos' },
  { value: '60', label: '60 minutos' },
];

export default function ConfigPage() {
  const [schedule, setSchedule] = useState<ScheduleConfig>(SCHEDULE_CONFIG);
  const [contacto, setContacto] = useState<ContactoConfig>({
    email: CONTACT_CONFIG.email,
    whatsapp: CONTACT_CONFIG.whatsappNumber,
  });

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState<'schedule' | 'contacto' | null>(null);
  const [guardado, setGuardado] = useState<'schedule' | 'contacto' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      try {
        const [rawSchedule, rawContacto] = await Promise.all([
          getConfig('schedule'),
          getConfig('contacto'),
        ]);
        if (cancelado) return;
        // normalizarSchedule traduce el formato antiguo (startHour/endHour)
        // al de franjas, así que guardar migra el registro sin más.
        const normalizado = normalizarSchedule(rawSchedule);
        if (normalizado) setSchedule(normalizado);
        if (esContactoConfig(rawContacto)) setContacto(rawContacto);
      } catch {
        if (!cancelado) setError('No se pudo cargar la configuración.');
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    void cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  function toggleDia(valor: number) {
    setSchedule((s) => ({
      ...s,
      availableDays: s.availableDays.includes(valor)
        ? s.availableDays.filter((d) => d !== valor)
        : [...s.availableDays, valor].sort((a, b) => a - b),
    }));
  }

  function agregarFranja() {
    setSchedule((s) => ({ ...s, franjas: [...s.franjas, { inicio: 9, fin: 12 }] }));
  }

  function quitarFranja(indice: number) {
    setSchedule((s) => ({ ...s, franjas: s.franjas.filter((_, i) => i !== indice) }));
  }

  function cambiarFranja(indice: number, campo: 'inicio' | 'fin', valor: number) {
    setSchedule((s) => ({
      ...s,
      franjas: s.franjas.map((f, i) => (i === indice ? { ...f, [campo]: valor } : f)),
    }));
  }

  /** Vista previa de los horarios que genera una franja. */
  function horariosDeFranja(franja: Franja, slotDuration: number): string {
    const paso = slotDuration > 0 ? slotDuration : 60;
    const horas: string[] = [];
    for (let m = franja.inicio * 60; m + paso <= franja.fin * 60; m += paso) {
      horas.push(
        `${Math.floor(m / 60)
          .toString()
          .padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`,
      );
    }
    return horas.length > 0 ? horas.join(' · ') : 'Sin horarios';
  }

  async function guardar(seccion: 'schedule' | 'contacto') {
    setError(null);

    if (seccion === 'schedule') {
      if (schedule.availableDays.length === 0) {
        setError('Selecciona al menos un día disponible.');
        return;
      }
      if (schedule.franjas.length === 0) {
        setError('Añade al menos una franja de atención.');
        return;
      }
      const invalida = schedule.franjas.findIndex((f) => f.fin <= f.inicio);
      if (invalida !== -1) {
        setError(
          `En la franja ${invalida + 1} la hora de fin debe ser posterior a la de inicio.`,
        );
        return;
      }
    } else if (!/^\d{10,15}$/.test(contacto.whatsapp)) {
      setError('El WhatsApp debe ser solo dígitos con indicativo, ej. 573219761348.');
      return;
    }

    setGuardando(seccion);
    try {
      await updateConfig(seccion, seccion === 'schedule' ? schedule : contacto);
      setGuardado(seccion);
      window.setTimeout(() => setGuardado(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setGuardando(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sand-200 border-t-brand-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold leading-snug tracking-tight text-stone-900">
        Configuración
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        Estos valores se aplican de inmediato en la landing.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {error}
        </p>
      )}

      {/* Sección 1 — horario */}
      <Card className="mt-6 p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-stone-900">
          <Clock size={18} className="text-brand-600" />
          Horario de citas
        </h2>

        <div className="mt-5">
          <p className="text-sm font-medium text-stone-700">Días disponibles</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {DIAS.map((dia) => {
              const activo = schedule.availableDays.includes(dia.valor);
              return (
                <button
                  key={dia.valor}
                  type="button"
                  onClick={() => toggleDia(dia.valor)}
                  aria-pressed={activo}
                  className={cn(
                    'rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors',
                    activo
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-sand-200 text-stone-600 hover:border-brand-300 hover:bg-brand-50',
                  )}
                >
                  {dia.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* franjas horarias */}
        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-stone-700">Franjas de atención</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              leftIcon={<Plus size={14} />}
              onClick={agregarFranja}
            >
              Añadir franja
            </Button>
          </div>
          <p className="mt-1 text-xs text-stone-500">
            La hora de fin es exclusiva: 9–12 genera citas a las 9:00, 10:00 y 11:00. Usa varias
            franjas para excluir la pausa de almuerzo.
          </p>

          <div className="mt-3 space-y-2">
            {schedule.franjas.length === 0 && (
              <p className="rounded-xl border border-dashed border-sand-300 px-4 py-6 text-center text-sm text-stone-400">
                Sin franjas: no se podrá agendar ninguna cita.
              </p>
            )}

            {schedule.franjas.map((franja, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-sand-200 p-3"
              >
                <span className="text-sm text-stone-500">De</span>
                <Select
                  className="h-9 w-28 text-sm"
                  options={HORAS}
                  value={String(franja.inicio)}
                  onChange={(e) => cambiarFranja(i, 'inicio', Number(e.target.value))}
                  aria-label={`Hora de inicio de la franja ${i + 1}`}
                />
                <span className="text-sm text-stone-500">a</span>
                <Select
                  className="h-9 w-28 text-sm"
                  options={HORAS}
                  value={String(franja.fin)}
                  onChange={(e) => cambiarFranja(i, 'fin', Number(e.target.value))}
                  aria-label={`Hora de fin de la franja ${i + 1}`}
                />
                <span className="ml-auto text-xs text-stone-500">
                  {horariosDeFranja(franja, schedule.slotDuration)}
                </span>
                <button
                  type="button"
                  onClick={() => quitarFranja(i)}
                  aria-label={`Quitar franja ${i + 1}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Duración de cada cita</span>
            <Select
              className="mt-1.5"
              options={DURACIONES}
              value={String(schedule.slotDuration)}
              onChange={(e) =>
                setSchedule((s) => ({ ...s, slotDuration: Number(e.target.value) }))
              }
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-stone-700">
              Días mínimos de anticipación
            </span>
            <Input
              className="mt-1.5"
              type="number"
              min={0}
              max={30}
              value={schedule.advanceDays}
              onChange={(e) =>
                setSchedule((s) => ({ ...s, advanceDays: Math.max(0, Number(e.target.value)) }))
              }
            />
          </label>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button
            onClick={() => void guardar('schedule')}
            disabled={guardando !== null}
            leftIcon={<Save size={16} />}
          >
            {guardando === 'schedule' ? 'Guardando…' : 'Guardar horario'}
          </Button>
          {guardado === 'schedule' && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
              <CheckCircle2 size={16} />
              Guardado
            </span>
          )}
        </div>
      </Card>

      {/* Sección 2 — contacto */}
      <Card className="mt-4 p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-stone-900">
          <MessageCircle size={18} className="text-brand-600" />
          Datos de contacto
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Correo de contacto</span>
            <Input
              className="mt-1.5"
              type="email"
              leftIcon={<Mail size={16} />}
              value={contacto.email}
              onChange={(e) => setContacto((c) => ({ ...c, email: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-stone-700">WhatsApp (con indicativo)</span>
            <Input
              className="mt-1.5"
              inputMode="numeric"
              placeholder="573219761348"
              leftIcon={<MessageCircle size={16} />}
              value={contacto.whatsapp}
              onChange={(e) =>
                setContacto((c) => ({ ...c, whatsapp: e.target.value.replace(/\D/g, '') }))
              }
            />
          </label>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button
            onClick={() => void guardar('contacto')}
            disabled={guardando !== null}
            leftIcon={<Save size={16} />}
          >
            {guardando === 'contacto' ? 'Guardando…' : 'Guardar contacto'}
          </Button>
          {guardado === 'contacto' && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
              <CheckCircle2 size={16} />
              Guardado
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}
