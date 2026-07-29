import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Download, StickyNote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Card, Input, Select } from '@shared/ui';
import { NotaModal } from '@features/admin/components/NotaModal';
import { getLeads, updateLeadEstado } from '@shared/services/admin';
import { LEAD_ESTADO_LABELS, LEAD_ESTADO_TONE, SERVICIOS } from '@shared/constants/labels';
import { descargarCSV, generarCSV } from '@shared/lib/csv';
import type { ColumnaCSV } from '@shared/lib/csv';
import { formatDate } from '@shared/lib/format';
import { cn } from '@shared/lib/cn';
import type { Lead, LeadEstado } from '@shared/types/supabase';

const POR_PAGINA = 20;

const ESTADOS = Object.keys(LEAD_ESTADO_LABELS) as LeadEstado[];

const OPCIONES_ESTADO = [
  { value: '', label: 'Todos los estados' },
  ...ESTADOS.map((e) => ({ value: e, label: LEAD_ESTADO_LABELS[e] })),
];

const OPCIONES_SERVICIO = [
  { value: '', label: 'Todos los servicios' },
  ...SERVICIOS.map((s) => ({ value: s, label: s })),
];

const COLUMNAS_CSV: ColumnaCSV<Lead>[] = [
  { header: 'Nombre', valor: (l) => l.nombre },
  { header: 'Empresa', valor: (l) => l.empresa },
  { header: 'Servicio', valor: (l) => l.servicio },
  { header: 'Teléfono', valor: (l) => l.telefono },
  { header: 'Correo', valor: (l) => l.correo },
  { header: 'Estado', valor: (l) => LEAD_ESTADO_LABELS[l.estado] },
  { header: 'Mensaje', valor: (l) => l.mensaje },
  { header: 'Notas', valor: (l) => l.notas },
  { header: 'Fecha', valor: (l) => formatDate(l.created_at) },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [estado, setEstado] = useState('');
  const [servicio, setServicio] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);

  const [actualizando, setActualizando] = useState<string | null>(null);
  const [leadNota, setLeadNota] = useState<Lead | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setLeads(await getLeads());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los leads.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  // El filtrado es en cliente: la lista completa ya está en memoria y así
  // los filtros responden sin ida y vuelta a la red.
  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return leads.filter((lead) => {
      if (estado && lead.estado !== estado) return false;
      if (servicio && lead.servicio !== servicio) return false;
      if (texto) {
        const campos = [lead.nombre, lead.empresa, lead.correo, lead.telefono]
          .filter((v): v is string => typeof v === 'string')
          .join(' ')
          .toLowerCase();
        if (!campos.includes(texto)) return false;
      }
      return true;
    });
  }, [leads, estado, servicio, busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  useEffect(() => {
    setPagina(1);
  }, [estado, servicio, busqueda]);

  async function cambiarEstado(lead: Lead, nuevo: LeadEstado) {
    setActualizando(lead.id);
    const previo = lead.estado;
    // Actualización optimista: se revierte si el servidor rechaza.
    setLeads((actuales) =>
      actuales.map((l) => (l.id === lead.id ? { ...l, estado: nuevo } : l)),
    );
    try {
      await updateLeadEstado(lead.id, nuevo);
    } catch (err) {
      setLeads((actuales) =>
        actuales.map((l) => (l.id === lead.id ? { ...l, estado: previo } : l)),
      );
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el lead.');
    } finally {
      setActualizando(null);
    }
  }

  async function guardarNota(nota: string) {
    if (!leadNota) return;
    await updateLeadEstado(leadNota.id, leadNota.estado, nota);
    setLeads((actuales) =>
      actuales.map((l) => (l.id === leadNota.id ? { ...l, notas: nota.trim() || null } : l)),
    );
  }

  function exportar() {
    descargarCSV(`leads-${new Date().toISOString().slice(0, 10)}.csv`, generarCSV(filtrados, COLUMNAS_CSV));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold leading-snug tracking-tight text-stone-900">Leads</h1>
          <p className="mt-1 text-sm text-stone-500">
            {filtrados.length} de {leads.length} registros
          </p>
        </div>
        <Button
          variant="outline"
          leftIcon={<Download size={16} />}
          onClick={exportar}
          disabled={filtrados.length === 0}
        >
          Exportar CSV
        </Button>
      </div>

      <Card className="mt-6 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            placeholder="Buscar por nombre, empresa, correo…"
            leftIcon={<Search size={16} />}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <Select
            options={OPCIONES_ESTADO}
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            aria-label="Filtrar por estado"
          />
          <Select
            options={OPCIONES_SERVICIO}
            value={servicio}
            onChange={(e) => setServicio(e.target.value)}
            aria-label="Filtrar por servicio"
          />
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

      <Card className="mt-4 overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-sand-200 border-t-brand-500" />
          </div>
        ) : visibles.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-stone-400">
            No hay leads que coincidan con los filtros.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-sand-200 bg-sand-50 text-xs uppercase tracking-widest text-stone-500">
                  <th className="px-4 py-3 font-semibold">Nombre</th>
                  <th className="px-4 py-3 font-semibold">Empresa</th>
                  <th className="px-4 py-3 font-semibold">Servicio</th>
                  <th className="px-4 py-3 font-semibold">Teléfono</th>
                  <th className="px-4 py-3 font-semibold">Correo</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((lead) => (
                  <tr key={lead.id} className="border-b border-sand-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-stone-900">{lead.nombre}</td>
                    <td className="px-4 py-3 text-stone-600">{lead.empresa ?? '—'}</td>
                    <td className="px-4 py-3 text-stone-600">{lead.servicio}</td>
                    <td className="px-4 py-3 text-stone-600">{lead.telefono}</td>
                    <td className="px-4 py-3 text-stone-600">{lead.correo ?? '—'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.estado}
                        disabled={actualizando === lead.id}
                        onChange={(e) => void cambiarEstado(lead, e.target.value as LeadEstado)}
                        aria-label={`Estado de ${lead.nombre}`}
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-opacity',
                          LEAD_ESTADO_TONE[lead.estado],
                          actualizando === lead.id && 'opacity-50',
                        )}
                      >
                        {ESTADOS.map((e) => (
                          <option key={e} value={e}>
                            {LEAD_ESTADO_LABELS[e]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-stone-500">{formatDate(lead.created_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setLeadNota(lead)}
                        title={lead.notas ? 'Editar nota' : 'Agregar nota'}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors hover:bg-sand-100',
                          lead.notas ? 'text-brand-700' : 'text-stone-500',
                        )}
                      >
                        <StickyNote size={14} />
                        {lead.notas ? 'Nota' : 'Añadir'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPaginas > 1 && (
          <div className="flex items-center justify-between border-t border-sand-200 px-4 py-3">
            <span className="text-sm text-stone-500">
              Página {paginaActual} de {totalPaginas}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={paginaActual === 1}
                onClick={() => setPagina((p) => p - 1)}
                leftIcon={<ChevronLeft size={14} />}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={paginaActual === totalPaginas}
                onClick={() => setPagina((p) => p + 1)}
                rightIcon={<ChevronRight size={14} />}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </Card>

      <NotaModal
        open={leadNota !== null}
        titulo={leadNota ? `Nota · ${leadNota.nombre}` : ''}
        notaInicial={leadNota?.notas ?? null}
        onClose={() => setLeadNota(null)}
        onGuardar={guardarNota}
      />
    </div>
  );
}
