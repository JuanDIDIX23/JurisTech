import { supabase } from '@shared/lib/supabase';

// Servicio público del modal de agendamiento.
// Igual que en leads, el INSERT no encadena .select(): anon no tiene permiso
// de lectura sobre `citas`. Para saber qué horas están ocupadas se usa la RPC
// `horas_ocupadas`, que devuelve únicamente horas y nunca datos personales.

export interface CitaInput {
  nombre: string;
  empresa?: string;
  telefono: string;
  correo: string;
  /** formato YYYY-MM-DD */
  fecha: string;
  /** formato HH:MM */
  hora: string;
  motivo?: string;
}

interface HoraOcupadaRow {
  hora: string;
}

function opcional(valor: string | undefined): string | null {
  const limpio = valor?.trim();
  return limpio ? limpio : null;
}

export async function crearCita(data: CitaInput): Promise<void> {
  const { error } = await supabase.from('citas').insert({
    nombre: data.nombre.trim(),
    empresa: opcional(data.empresa),
    telefono: data.telefono.trim(),
    correo: data.correo.trim(),
    fecha: data.fecha,
    hora: data.hora,
    motivo: opcional(data.motivo),
  });

  if (error) {
    // 23505 = unique_violation. Lo dispara el índice `unique_slot` cuando
    // alguien reservó esa misma franja entre la consulta y el envío.
    if (error.code === '23505') {
      throw new Error('Ese horario acaba de ser reservado. Elige otro, por favor.');
    }
    throw new Error('No se pudo agendar la cita.');
  }
}

/**
 * Horas ya reservadas para una fecha, normalizadas a HH:MM para poder
 * compararlas con los slots generados en el modal (Postgres devuelve HH:MM:SS).
 */
export async function obtenerHorasOcupadas(fecha: string): Promise<string[]> {
  const { data, error } = await supabase.rpc('horas_ocupadas', { fecha_consulta: fecha });

  if (error) {
    throw new Error('No se pudo consultar la disponibilidad.');
  }

  const filas = (data ?? []) as HoraOcupadaRow[];
  return filas.map((fila) => fila.hora.slice(0, 5));
}
