import { supabase } from '@shared/lib/supabase';

// Servicio público: el formulario de contacto de la landing no requiere sesión.
// La policy `leads_insert_public` permite el INSERT, pero NO hay SELECT para
// anon, así que la inserción nunca puede encadenar .select().

export interface LeadInput {
  nombre: string;
  empresa?: string;
  telefono: string;
  correo?: string;
  servicio: string;
  mensaje?: string;
}

/** Normaliza a null los opcionales vacíos para no guardar cadenas en blanco. */
function opcional(valor: string | undefined): string | null {
  const limpio = valor?.trim();
  return limpio ? limpio : null;
}

export async function crearLead(data: LeadInput): Promise<void> {
  const { error } = await supabase.from('leads').insert({
    nombre: data.nombre.trim(),
    empresa: opcional(data.empresa),
    telefono: data.telefono.trim(),
    correo: opcional(data.correo),
    servicio: data.servicio,
    mensaje: opcional(data.mensaje),
  });

  if (error) {
    throw new Error('No se pudo registrar el mensaje.');
  }
}
