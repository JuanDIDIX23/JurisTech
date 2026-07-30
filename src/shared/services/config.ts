import { supabase } from '@shared/lib/supabase';
import type { Franja, ScheduleConfig } from '@shared/config/schedule';

// Lectura/escritura de la tabla `config`.
// `config_read_public` permite el SELECT sin sesión (la landing lo necesita);
// el UPDATE está restringido a admins por `config_admin_update`.

export interface ContactoConfig {
  email: string;
  /** número en formato internacional sin símbolos, para wa.me */
  whatsapp: string;
}

interface ConfigRow {
  value: unknown;
}

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

export function esContactoConfig(valor: unknown): valor is ContactoConfig {
  if (!esRegistro(valor)) return false;
  return typeof valor.email === 'string' && typeof valor.whatsapp === 'string';
}

function esFranja(valor: unknown): valor is Franja {
  if (!esRegistro(valor)) return false;
  return typeof valor.inicio === 'number' && typeof valor.fin === 'number';
}

/**
 * Convierte el JSONB de `config.schedule` a ScheduleConfig.
 *
 * Acepta el formato con `franjas` (migración 006) y el anterior con
 * `startHour`/`endHour`, que se traduce a una única franja. Así el cliente
 * funciona con o sin la migración aplicada, y el orden entre despliegue y
 * migración deja de importar. Devuelve null si no reconoce la forma.
 */
export function normalizarSchedule(valor: unknown): ScheduleConfig | null {
  if (!esRegistro(valor)) return null;

  const comunes =
    Array.isArray(valor.availableDays) &&
    valor.availableDays.every((d) => typeof d === 'number') &&
    typeof valor.slotDuration === 'number' &&
    typeof valor.advanceDays === 'number' &&
    typeof valor.maxDays === 'number' &&
    typeof valor.timezone === 'string';

  if (!comunes) return null;

  const base = {
    availableDays: valor.availableDays as number[],
    slotDuration: valor.slotDuration as number,
    advanceDays: valor.advanceDays as number,
    maxDays: valor.maxDays as number,
    timezone: valor.timezone as string,
  };

  if (Array.isArray(valor.franjas) && valor.franjas.every(esFranja)) {
    return { ...base, franjas: valor.franjas as Franja[] };
  }

  if (typeof valor.startHour === 'number' && typeof valor.endHour === 'number') {
    return { ...base, franjas: [{ inicio: valor.startHour, fin: valor.endHour }] };
  }

  return null;
}

/** Valor crudo de una clave de config. null si no existe o falla la lectura. */
export async function getConfig(key: string): Promise<unknown> {
  const { data, error } = await supabase
    .from('config')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error || !data) return null;
  return (data as ConfigRow).value;
}

/** Escribe una clave de config. Requiere sesión de admin. */
export async function updateConfig(key: string, value: unknown): Promise<void> {
  const { error } = await supabase.from('config').update({ value }).eq('key', key);

  if (error) {
    throw new Error('No se pudo guardar la configuración.');
  }
}

export async function obtenerContacto(): Promise<ContactoConfig | null> {
  const valor = await getConfig('contacto');
  return esContactoConfig(valor) ? valor : null;
}

export async function obtenerSchedule(): Promise<ScheduleConfig | null> {
  return normalizarSchedule(await getConfig('schedule'));
}
