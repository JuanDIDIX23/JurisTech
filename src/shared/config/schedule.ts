// Configuración del horario disponible para agendar citas.
// Editable sin tocar el componente del modal.

/** Tramo de atención continuo. `fin` es exclusivo: 9–12 son 9:00, 10:00 y 11:00. */
export interface Franja {
  inicio: number;
  fin: number;
}

export interface ScheduleConfig {
  availableDays: number[]; // 1=lunes ... 7=domingo (ISO)
  /** Varias franjas permiten excluir la pausa de almuerzo. */
  franjas: Franja[];
  slotDuration: number; // minutos
  advanceDays: number; // mínimo de días de anticipación
  maxDays: number; // máximo de días hacia adelante
  timezone: string;
}

/** Formato anterior a la migración 006, aún soportado al leer `config`. */
export interface LegacyScheduleConfig {
  availableDays: number[];
  startHour: number;
  endHour: number;
  slotDuration: number;
  advanceDays: number;
  maxDays: number;
  timezone: string;
}

export const SCHEDULE_CONFIG: ScheduleConfig = {
  availableDays: [1, 2, 3, 4, 5],
  franjas: [
    { inicio: 9, fin: 12 },
    { inicio: 14, fin: 16 },
  ],
  slotDuration: 60,
  advanceDays: 1,
  maxDays: 30,
  timezone: 'America/Bogota',
};

// Canales de contacto directo.
// Esto es solo el FALLBACK: en tiempo de ejecución la landing lee los valores
// de la tabla `config` (key = 'contacto') para que el admin pueda editarlos
// desde el panel. Ver useContactConfig().
export interface ContactConfig {
  /** Número en formato internacional sin símbolos (para el enlace wa.me). */
  whatsappNumber: string;
  /** Número legible para mostrar en la interfaz. */
  whatsappDisplay: string;
  email: string;
}

export const CONTACT_CONFIG: ContactConfig = {
  whatsappNumber: '573219761348',
  whatsappDisplay: '+57 321 976 1348',
  email: 'contacto@juristechlawyers.com',
};
