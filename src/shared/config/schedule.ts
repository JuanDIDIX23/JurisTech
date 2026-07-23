// Configuración del horario disponible para agendar citas.
// Editable sin tocar el componente del modal.

export interface ScheduleConfig {
  availableDays: number[]; // 1=lunes ... 7=domingo (ISO)
  startHour: number;
  endHour: number;
  slotDuration: number; // minutos
  advanceDays: number; // mínimo de días de anticipación
  maxDays: number; // máximo de días hacia adelante
  timezone: string;
}

export const SCHEDULE_CONFIG: ScheduleConfig = {
  availableDays: [1, 2, 3, 4, 5],
  startHour: 8,
  endHour: 18,
  slotDuration: 60,
  advanceDays: 1,
  maxDays: 30,
  timezone: 'America/Bogota',
};
