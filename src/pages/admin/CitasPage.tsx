import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  List,
  CalendarDays,
  Check,
  X,
  StickyNote,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Badge, Card, Input, Select } from '@shared/ui';
import { NotaModal } from '@features/admin/components/NotaModal';
import { getCitas, updateCitaEstado } from '@shared/services/admin';
import { CITA_ESTADO_LABELS, CITA_ESTADO_TONE } from '@shared/constants/labels';
import { cn } from '@shared/lib/cn';
import type { Cita, CitaEstado } from '@shared/types/supabase';

type Vista = 'lista' | 'calendario';

const ESTADOS = Object.keys(CITA_ESTADO_LABELS) as CitaEstado[];

const OPCIONES_ESTADO = [
  { value: '', label: 'Todos los estados' },
  ...ESTADOS.map((e) => ({ value: e, label: CITA_ESTADO_LABELS[e] })),
];

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MES_FORMATTER = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' });
const FECHA_FORMATTER = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

/** Interpreta YYYY-MM-DD como fecha local (new Date(str) la trataría como UTC). */
function parseFechaLocal(fecha: string): Date {
  const [y, m, d] = fecha.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function claveDia(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isoWeekday(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

function celdasDelMes(mes: Date): (Date | null)[] {
  const year = mes.getFullYear();
  const month = mes.getMonth();
  const dias = new Date(year, month + 1, 0).getDate();
  const blancos = isoWeekday(new Date(year, month, 1)) - 1;

  const celdas: (Date | null)[] = Array.from({ length: blancos }, () => null);
  for (let d = 1; d <= dias; d++) celdas.push(new Date(year, month, d));
  return celdas;
}

export default function CitasPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [vista, setVista] = useState<Vista>('lista');
  const [estado, setEstado] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [mes, setMes] = useState(() => {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  });

  const [actualizando, setActualizando] = useState<string | null>(null);
  const [citaNota, setCitaNota] = useState<Cita | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCitas(await getCitas());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las citas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const filtradas = useMemo(
    () =>
      citas.filter((cita) => {
        if (estado && cita.estado !== estado) return false;
        if (desde && cita.fecha < desde) return false;
        if (hasta && cita.fecha > hasta) return false;
        return true;
      }),
    [citas, estado, desde, hasta],
  );

  const porDia = useMemo(() => {
    const mapa = new Map<string, Cita[]>();
    for (const cita of filtradas) {
      const lista = mapa.get(cita.fecha) ?? [];
      lista.push(cita);
      mapa.set(cita.fecha, lista);
    }
    for (const lista of mapa.values()) lista.sort((a, b) => a.hora.localeCompare(b.hora));
    return mapa;
  }, [filtradas]);

  async function cambiarEstado(cita: Cita, nuevo: CitaEstado) {
    setActualizando(cita.id);
    const previo = cita.estado;
    setCitas((actuales) =>
      actuales.map((c) => (c.id === cita.id ? { ...c, estado: nuevo } : c)),
    );
    try {
      await updateCitaEstado(cita.id, nuevo);
    } catch (err) {
      setCitas((actuales) =>
        actuales.map((c) => (c.id === cita.id ? { ...c, estado: previo } : c)),
      );
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la cita.');
    } finally {
      setActualizando(null);
    }
  }

  async function guardarNota(nota: string) {
    if (!citaNota) return;
    await updateCitaEstado(citaNota.id, citaNota.estado, nota);
    setCitas((actuales) =>
      actuales.map((c) => (c.id === citaNota.id ? { ...c, notas: nota.trim() || null } : c)),
    );
  }

  function Acciones({ cita }: { cita: Cita }) {
    const bloqueada = actualizando === cita.id;
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => void cambiarEstado(cita, 'confirmada')}
          disabled={bloqueada || cita.estado === 'confirmada'}
          title="Confirmar"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 transition-colors hover:bg-emerald-50 disabled:opacity-30"
        >
          <Check size={15} />
        </button>
        <button
          onClick={() => void cambiarEstado(cita, 'cancelada')}
          disabled={bloqueada || cita.estado === 'cancelada'}
          title="Cancelar"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-30"
        >
          <X size={15} />
        </button>
        <button
          onClick={() => setCitaNota(cita)}
          title={cita.notas ? 'Editar nota' : 'Agregar nota'}
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-sand-100',
            cita.notas ? 'text-brand-700' : 'text-stone-500',
          )}
        >
          <StickyNote size={15} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold leading-snug tracking-tight text-stone-900">Citas</h1>
          <p className="mt-1 text-sm text-stone-500">
            {filtradas.length} de {citas.length} registros
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-sand-200 bg-white p-1">
          {(['lista', 'calendario'] as Vista[]).map((v) => (
            <button
              key={v}
              onClick={() => setVista(v)}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                vista === v ? 'bg-brand-600 text-white' : 'text-stone-600 hover:bg-sand-100',
              )}
            >
              {v === 'lista' ? <List size={15} /> : <CalendarDays size={15} />}
              {v === 'lista' ? 'Lista' : 'Calendario'}
            </button>
          ))}
        </div>
      </div>

      <Card className="mt-6 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Select
            options={OPCIONES_ESTADO}
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            aria-label="Filtrar por estado"
          />
          <label className="flex items-center gap-2 text-sm text-stone-500">
            <span className="shrink-0">Desde</span>
            <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-500">
            <span className="shrink-0">Hasta</span>
            <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </label>
        </div>
      </Card>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {error}
        </p>
      )}

      {loading ? (
        <Card className="mt-4 flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sand-200 border-t-brand-500" />
        </Card>
      ) : vista === 'lista' ? (
        <Card className="mt-4 overflow-hidden">
          {filtradas.length === 0 ? (
            <p className="px-5 py-16 text-center text-sm text-stone-400">
              No hay citas que coincidan con los filtros.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-sand-200 bg-sand-50 text-xs uppercase tracking-widest text-stone-500">
                    <th className="px-4 py-3 font-semibold">Nombre</th>
                    <th className="px-4 py-3 font-semibold">Empresa</th>
                    <th className="px-4 py-3 font-semibold">Fecha</th>
                    <th className="px-4 py-3 font-semibold">Hora</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((cita) => (
                    <tr key={cita.id} className="border-b border-sand-100 last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium text-stone-900">{cita.nombre}</p>
                        <p className="text-xs text-stone-500">{cita.correo}</p>
                      </td>
                      <td className="px-4 py-3 text-stone-600">{cita.empresa ?? '—'}</td>
                      <td className="px-4 py-3 text-stone-600">
                        {FECHA_FORMATTER.format(parseFechaLocal(cita.fecha))}
                      </td>
                      <td className="px-4 py-3 text-stone-600">{cita.hora.slice(0, 5)}</td>
                      <td className="px-4 py-3">
                        <Badge className={CITA_ESTADO_TONE[cita.estado]} dot>
                          {CITA_ESTADO_LABELS[cita.estado]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Acciones cita={cita} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        <Card className="mt-4 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-sand-100"
              aria-label="Mes anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-semibold capitalize text-stone-900">
              {MES_FORMATTER.format(mes)}
            </span>
            <button
              onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-sand-100"
              aria-label="Mes siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-widest text-stone-400">
            {WEEKDAYS.map((d) => (
              <span key={d} className="py-1">
                {d}
              </span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {celdasDelMes(mes).map((dia, i) => {
              if (!dia) return <div key={`blank-${i}`} className="min-h-[92px] rounded-lg" />;

              const clave = claveDia(dia);
              const delDia = porDia.get(clave) ?? [];
              const esHoy = clave === claveDia(new Date());

              return (
                <div
                  key={clave}
                  className={cn(
                    'min-h-[92px] rounded-lg border p-1.5 transition-colors',
                    esHoy ? 'border-brand-300 bg-brand-50/50' : 'border-sand-200 bg-white',
                  )}
                >
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      esHoy ? 'text-brand-700' : 'text-stone-500',
                    )}
                  >
                    {dia.getDate()}
                  </span>

                  <div className="mt-1 space-y-1">
                    {delDia.slice(0, 3).map((cita) => (
                      <button
                        key={cita.id}
                        onClick={() => setCitaNota(cita)}
                        title={`${cita.hora.slice(0, 5)} · ${cita.nombre} — ${CITA_ESTADO_LABELS[cita.estado]}`}
                        className={cn(
                          'block w-full truncate rounded px-1.5 py-1 text-left text-[11px] font-medium ring-1 ring-inset transition-opacity hover:opacity-80',
                          CITA_ESTADO_TONE[cita.estado],
                        )}
                      >
                        {cita.hora.slice(0, 5)} {cita.nombre.split(' ')[0]}
                      </button>
                    ))}
                    {delDia.length > 3 && (
                      <span className="block px-1.5 text-[11px] text-stone-400">
                        +{delDia.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <NotaModal
        open={citaNota !== null}
        titulo={citaNota ? `Nota · ${citaNota.nombre}` : ''}
        notaInicial={citaNota?.notas ?? null}
        onClose={() => setCitaNota(null)}
        onGuardar={guardarNota}
      />
    </div>
  );
}
