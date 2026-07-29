// Tipos que mapean 1:1 con las tablas de Supabase (ver supabase/schema.sql).
// Las columnas sin NOT NULL se modelan como `| null`.

export type Rol = 'admin' | 'afiliado';

export type LeadEstado = 'nuevo' | 'contactado' | 'en_proceso' | 'cerrado' | 'descartado';

export type CitaEstado = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

export interface Profile {
  id: string;
  rol: Rol;
  nombre: string | null;
  empresa: string | null;
  telefono: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  nombre: string;
  empresa: string | null;
  telefono: string;
  correo: string | null;
  servicio: string;
  mensaje: string | null;
  estado: LeadEstado;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface Cita {
  id: string;
  nombre: string;
  empresa: string | null;
  telefono: string;
  correo: string;
  /** formato YYYY-MM-DD */
  fecha: string;
  /** formato HH:MM:SS */
  hora: string;
  motivo: string | null;
  estado: CitaEstado;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  total_leads: number;
  leads_nuevos: number;
  leads_mes: number;
  total_citas: number;
  citas_pendientes: number;
  citas_hoy: number;
  citas_semana: number;
}
