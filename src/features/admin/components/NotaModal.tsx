import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@shared/ui';

interface NotaModalProps {
  open: boolean;
  titulo: string;
  notaInicial: string | null;
  onClose: () => void;
  onGuardar: (nota: string) => Promise<void>;
}

export function NotaModal({ open, titulo, notaInicial, onClose, onGuardar }: NotaModalProps) {
  const [nota, setNota] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setNota(notaInicial ?? '');
      setError(null);
    }
  }, [open, notaInicial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleGuardar() {
    setGuardando(true);
    setError(null);
    try {
      await onGuardar(nota);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la nota.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-glow"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-base font-semibold text-stone-900">{titulo}</h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-sand-100 hover:text-stone-900"
          >
            <X size={16} />
          </button>
        </div>

        <textarea
          rows={5}
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          disabled={guardando}
          placeholder="Escribe una nota interna…"
          className="mt-4 w-full rounded-xl border border-sand-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10 disabled:opacity-60"
        />

        {error && (
          <p role="alert" className="mt-2 text-sm font-medium text-rose-700">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button onClick={handleGuardar} disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar nota'}
          </Button>
        </div>
      </div>
    </div>
  );
}
