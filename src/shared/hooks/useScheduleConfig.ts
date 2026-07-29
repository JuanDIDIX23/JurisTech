import { useEffect, useState } from 'react';
import { obtenerSchedule } from '@shared/services/config';
import { SCHEDULE_CONFIG } from '@shared/config/schedule';
import type { ScheduleConfig } from '@shared/config/schedule';

interface UseScheduleConfig {
  schedule: ScheduleConfig;
  /** true mientras se resuelve la primera lectura desde Supabase */
  loading: boolean;
}

/**
 * Horario vigente de agendamiento, leído desde `config` (key = 'schedule').
 * SCHEDULE_CONFIG solo actúa como fallback si la lectura falla, de modo que
 * lo que el admin guarda en ConfigPage es lo que ve el visitante.
 */
export function useScheduleConfig(): UseScheduleConfig {
  const [schedule, setSchedule] = useState<ScheduleConfig>(SCHEDULE_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelado = false;

    void obtenerSchedule()
      .then((remoto) => {
        if (cancelado) return;
        if (remoto) setSchedule(remoto);
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  return { schedule, loading };
}
