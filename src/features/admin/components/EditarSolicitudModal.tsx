import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Input, Select } from '@shared/ui';
import { ModalBase } from './ModalBase';
import { SOLICITUD_ESTADO_LABELS, SOLICITUD_TIPO_LABELS } from '@shared/constants/labels';
import type { Solicitud, SolicitudEstado } from '@shared/types/supabase';

export interface CambiosSolicitud {
  estado: SolicitudEstado;
  tokensEstimados: number | null;
  tokensConsumidos: number;
  notas: string;
  asignadoA: string;
}

interface EditarSolicitudModalProps {
  open: boolean;
  solicitud: Solicitud | null;
  onClose: () => void;
  onGuardar: (cambios: CambiosSolicitud) => Promise<void>;
}

const ESTADOS = Object.keys(SOLICITUD_ESTADO_LABELS) as SolicitudEstado[];
const OPCIONES_ESTADO = ESTADOS.map((e) => ({ value: e, label: SOLICITUD_ESTADO_LABELS[e] }));

export function EditarSolicitudModal({
  open,
  solicitud,
  onClose,
  onGuardar,
}: EditarSolicitudModalProps) {
  const [estado, setEstado] = useState<SolicitudEstado>('recibida');
  const [estimados, setEstimados] = useState('');
  const [consumidos, setConsumidos] = useState('');
  const [notas, setNotas] = useState('');
  const [asignadoA, setAsignadoA] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && solicitud) {
      setEstado(solicitud.estado);
      setEstimados(solicitud.tokens_estimados !== null ? String(solicitud.tokens_estimados) : '');
      setConsumidos(String(solicitud.tokens_consumidos));
      setNotas(solicitud.notas_admin ?? '');
      setAsignadoA(solicitud.asignado_a ?? '');
      setError(null);
    }
  }, [open, solicitud]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (guardando) return;

    const est = estimados.trim() === '' ? null : Number(estimados);
    const con = consumidos.trim() === '' ? 0 : Number(consumidos);

    if (est !== null && (!Number.isInteger(est) || est < 0)) {
      setError('Los tokens estimados deben ser un entero positivo.');
      return;
    }
    if (!Number.isInteger(con) || con < 0) {
      setError('Los tokens consumidos deben ser un entero positivo.');
      return;
    }

    setError(null);
    setGuardando(true);
    try {
      await onGuardar({
        estado,
        tokensEstimados: est,
        tokensConsumidos: con,
        notas,
        asignadoA,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la solicitud.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <ModalBase
      open={open}
      titulo={solicitud?.codigo ?? 'Solicitud'}
      descripcion={solicitud ? SOLICITUD_TIPO_LABELS[solicitud.tipo] : undefined}
      onClose={onClose}
      ancho="lg"
    >
      {solicitud && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-xl border border-sand-200 bg-sand-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Descripción del afiliado
            </p>
            <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-stone-700">
              {solicitud.descripcion}
            </p>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-stone-700">Estado</span>
            <Select
              className="mt-1.5"
              options={OPCIONES_ESTADO}
              value={estado}
              onChange={(e) => setEstado(e.target.value as SolicitudEstado)}
              disabled={guardando}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-stone-700">Tokens estimados</span>
              <Input
                className="mt-1.5"
                type="number"
                min={0}
                step={1}
                value={estimados}
                onChange={(e) => setEstimados(e.target.value)}
                disabled={guardando}
                placeholder="Por definir"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-stone-700">Tokens consumidos</span>
              <Input
                className="mt-1.5"
                type="number"
                min={0}
                step={1}
                value={consumidos}
                onChange={(e) => setConsumidos(e.target.value)}
                disabled={guardando}
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-stone-700">Responsable</span>
            <Input
              className="mt-1.5"
              value={asignadoA}
              onChange={(e) => setAsignadoA(e.target.value)}
              disabled={guardando}
              placeholder="Nombre del profesional asignado"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-stone-700">
              Notas para el afiliado
            </span>
            <textarea
              rows={4}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              disabled={guardando}
              className="mt-1.5 w-full rounded-xl border border-sand-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10 disabled:opacity-60"
            />
            <span className="mt-1.5 block text-xs text-stone-500">
              El afiliado ve estas notas en el detalle de su solicitud.
            </span>
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      )}
    </ModalBase>
  );
}
