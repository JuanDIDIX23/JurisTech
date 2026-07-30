-- =============================================
-- Migración 006 — Horario de citas por franjas
--
-- El horario dejaba de poder expresarse con un rango continuo
-- (startHour/endHour) al introducir la pausa de almuerzo: la atención es
-- de 9:00 a 12:00 y de 14:00 a 16:00, excluyendo 12:00–14:00.
--
-- `franjas` sustituye a `startHour`/`endHour`. El cliente acepta ambos
-- formatos, así que el orden entre esta migración y el despliegue es
-- indiferente: si aún no se ha ejecutado, se sigue leyendo el rango viejo.
--
-- Ejecutar en el SQL editor de Supabase.
-- =============================================

UPDATE config
SET value = '{
  "availableDays": [1,2,3,4,5],
  "franjas": [
    {"inicio": 9, "fin": 12},
    {"inicio": 14, "fin": 16}
  ],
  "slotDuration": 60,
  "advanceDays": 1,
  "maxDays": 30,
  "timezone": "America/Bogota"
}'::jsonb
WHERE key = 'schedule';
