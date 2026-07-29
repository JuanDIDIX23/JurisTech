import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Input, Select } from '@shared/ui';
import { ModalBase } from './ModalBase';
import { subirDocumento } from '@shared/services/admin-afiliados';
import { SOLICITUD_TIPO_LABELS } from '@shared/constants/labels';
import type { Solicitud } from '@shared/types/supabase';

interface SubirDocumentoModalProps {
  open: boolean;
  afiliadoId: string;
  solicitudes: Solicitud[];
  onClose: () => void;
  onSubido: () => void;
}

export function SubirDocumentoModal({
  open,
  afiliadoId,
  solicitudes,
  onClose,
  onSubido,
}: SubirDocumentoModalProps) {
  const [nombre, setNombre] = useState('');
  const [solicitudId, setSolicitudId] = useState('');
  const [url, setUrl] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setNombre('');
      setSolicitudId('');
      setUrl('');
      setDescripcion('');
      setError(null);
    }
  }, [open]);

  /** Deduce la extensión desde la URL para mostrarla como tipo de archivo. */
  function tipoDesdeUrl(valor: string): string | undefined {
    const limpia = valor.split('?')[0].split('#')[0];
    const match = limpia.match(/\.([a-z0-9]{2,5})$/i);
    return match ? match[1].toUpperCase() : undefined;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (enviando) return;

    if (nombre.trim() === '') {
      setError('Escribe el nombre del documento.');
      return;
    }
    if (!/^https?:\/\/.+/i.test(url.trim())) {
      setError('La URL debe empezar por http:// o https://');
      return;
    }

    setError(null);
    setEnviando(true);
    try {
      await subirDocumento({
        afiliadoId,
        solicitudId: solicitudId || null,
        nombre,
        url,
        descripcion,
        tipoArchivo: tipoDesdeUrl(url),
      });
      onSubido();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el documento.');
    } finally {
      setEnviando(false);
    }
  }

  const opcionesSolicitud = [
    { value: '', label: 'Sin solicitud asociada' },
    ...solicitudes.map((s) => ({
      value: s.id,
      label: `${s.codigo ?? '—'} · ${SOLICITUD_TIPO_LABELS[s.tipo]}`,
    })),
  ];

  return (
    <ModalBase
      open={open}
      titulo="Subir documento"
      descripcion="El afiliado lo verá en su panel al instante."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Nombre del documento</span>
          <Input
            className="mt-1.5"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={enviando}
            placeholder="Ej. Contrato laboral revisado.pdf"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-700">Solicitud asociada</span>
          <Select
            className="mt-1.5"
            options={opcionesSolicitud}
            value={solicitudId}
            onChange={(e) => setSolicitudId(e.target.value)}
            disabled={enviando}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-700">URL del documento</span>
          <Input
            className="mt-1.5"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={enviando}
            placeholder="https://…"
            required
          />
          <span className="mt-1.5 block text-xs text-stone-500">
            Enlace de Supabase Storage o cualquier URL accesible.
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-700">Descripción (opcional)</span>
          <textarea
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            disabled={enviando}
            className="mt-1.5 w-full rounded-xl border border-sand-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10 disabled:opacity-60"
          />
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
          <Button type="button" variant="outline" onClick={onClose} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" disabled={enviando}>
            {enviando ? 'Guardando…' : 'Guardar documento'}
          </Button>
        </div>
      </form>
    </ModalBase>
  );
}
