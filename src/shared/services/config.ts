import { supabase } from '@shared/lib/supabase';
import type { ScheduleConfig } from '@shared/config/schedule';

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

export function esScheduleConfig(valor: unknown): valor is ScheduleConfig {
  if (!esRegistro(valor)) return false;
  return (
    Array.isArray(valor.availableDays) &&
    valor.availableDays.every((d) => typeof d === 'number') &&
    typeof valor.startHour === 'number' &&
    typeof valor.endHour === 'number' &&
    typeof valor.slotDuration === 'number' &&
    typeof valor.advanceDays === 'number' &&
    typeof valor.maxDays === 'number' &&
    typeof valor.timezone === 'string'
  );
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
  const valor = await getConfig('schedule');
  return esScheduleConfig(valor) ? valor : null;
}
