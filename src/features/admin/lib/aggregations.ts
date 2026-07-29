import type { Lead, LeadEstado } from '@shared/types/supabase';
import { LEAD_ESTADO_LABELS } from '@shared/constants/labels';
import type { PuntoSerie } from '../components/charts/SeriesLineChart';
import type { PorcionCategoria } from '../components/charts/CategoriaPieChart';

/** Fecha local en YYYY-MM-DD (nunca toISOString: desplaza el día en UTC-5). */
export function claveDia(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function claveMes(date: Date): string {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
}

const DIA_FORMATTER = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short' });
const MES_FORMATTER = new Intl.DateTimeFormat('es-CO', { month: 'short', year: '2-digit' });

/** Serie diaria de los últimos `dias`, incluyendo los días sin leads. */
export function leadsPorDia(leads: Lead[], dias = 30): PuntoSerie[] {
  const conteo = new Map<string, number>();
  for (const lead of leads) {
    const clave = claveDia(new Date(lead.created_at));
    conteo.set(clave, (conteo.get(clave) ?? 0) + 1);
  }

  const serie: PuntoSerie[] = [];
  const hoy = new Date();
  for (let i = dias - 1; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() - i);
    serie.push({
      label: DIA_FORMATTER.format(fecha),
      total: conteo.get(claveDia(fecha)) ?? 0,
    });
  }
  return serie;
}

/** Serie mensual de los últimos `meses`, incluyendo los meses vacíos. */
export function leadsPorMes(leads: Lead[], meses = 6): PuntoSerie[] {
  const conteo = new Map<string, number>();
  for (const lead of leads) {
    const clave = claveMes(new Date(lead.created_at));
    conteo.set(clave, (conteo.get(clave) ?? 0) + 1);
  }

  const serie: PuntoSerie[] = [];
  const hoy = new Date();
  for (let i = meses - 1; i >= 0; i--) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    serie.push({
      label: MES_FORMATTER.format(fecha),
      total: conteo.get(claveMes(fecha)) ?? 0,
    });
  }
  return serie;
}

export function contarPorEstado(leads: Lead[]): Record<LeadEstado, number> {
  const base: Record<LeadEstado, number> = {
    nuevo: 0,
    contactado: 0,
    en_proceso: 0,
    cerrado: 0,
    descartado: 0,
  };
  for (const lead of leads) {
    base[lead.estado] += 1;
  }
  return base;
}

/** Solo incluye estados con al menos un lead, para no ensuciar la leyenda. */
export function leadsPorEstado(leads: Lead[]): PorcionCategoria[] {
  const conteo = contarPorEstado(leads);
  return (Object.keys(conteo) as LeadEstado[])
    .filter((estado) => conteo[estado] > 0)
    .map((estado) => ({ nombre: LEAD_ESTADO_LABELS[estado], valor: conteo[estado] }));
}

export function leadsPorServicio(leads: Lead[]): PorcionCategoria[] {
  const conteo = new Map<string, number>();
  for (const lead of leads) {
    conteo.set(lead.servicio, (conteo.get(lead.servicio) ?? 0) + 1);
  }
  return [...conteo.entries()]
    .map(([nombre, valor]) => ({ nombre, valor }))
    .sort((a, b) => b.valor - a.valor);
}
