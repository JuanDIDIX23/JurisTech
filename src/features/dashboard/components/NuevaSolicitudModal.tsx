import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import { Button, Select } from '@shared/ui';
import { crearSolicitud } from '@shared/services/afiliado';
import { SOLICITUD_TIPO_LABELS } from '@shared/constants/labels';
import { cn } from '@shared/lib/cn';
import type { Solicitud, SolicitudPrioridad, SolicitudTipo } from '@shared/types/supabase';

interface NuevaSolicitudModalProps {
  open: boolean;
  onClose: () => void;
  onCreada: (solicitud: Solicitud) => void;
}

const TIPOS = Object.keys(SOLICITUD_TIPO_LABELS) as SolicitudTipo[];

const OPCIONES_TIPO = [
  { value: '', label: 'Selecciona el tipo de servicio' },
  ...TIPOS.map((t) => ({ value: t, label: SOLICITUD_TIPO_LABELS[t] })),
];

export function NuevaSolicitudModal({ open, onClose, onCreada }: NuevaSolicitudModalProps) {
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState<SolicitudPrioridad>('normal');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTipo('');
      setDescripcion('');
      setPrioridad('normal');
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (enviando) return;

    if (tipo === '') {
      setError('Selecciona el tipo de servicio.');
      return;
    }
    if (descripcion.trim().length < 15) {
      setError('Describe tu necesidad con al menos 15 caracteres.');
      return;
    }

    setError(null);
    setEnviando(true);
    try {
      const creada = await crearSolicitud({
        tipo: tipo as SolicitudTipo,
        descripcion,
        prioridad,
      });
      onCreada(creada);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la solicitud.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-glow"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-stone-900">Nueva solicitud</h3>
            <p className="mt-0.5 text-sm text-stone-500">
              Te confirmaremos el consumo estimado antes de empezar.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-sand-100 hover:text-stone-900"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Tipo de servicio</span>
            <Select
              className="mt-1.5"
              options={OPCIONES_TIPO}
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              disabled={enviando}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-stone-700">Descripción detallada</span>
            <textarea
              rows={5}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={enviando}
              placeholder="Cuéntanos el contexto, qué necesitas y para cuándo."
              className="mt-1.5 w-full rounded-xl border border-sand-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10 disabled:opacity-60"
              required
            />
          </label>

          <div>
            <span className="text-sm font-medium text-stone-700">Prioridad</span>
            <div className="mt-1.5 flex gap-2">
              {(['normal', 'urgente'] as SolicitudPrioridad[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrioridad(p)}
                  aria-pressed={prioridad === p}
                  disabled={enviando}
                  className={cn(
                    'flex-1 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-colors',
                    prioridad === p
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-sand-200 text-stone-600 hover:border-brand-300 hover:bg-brand-50',
                  )}
                >
                  {p === 'normal' ? 'Normal' : 'Urgente'}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={enviando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={enviando}>
              {enviando ? 'Enviando…' : 'Crear solicitud'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
