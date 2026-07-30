import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ImageOff } from 'lucide-react';
import { Button, Input } from '@shared/ui';
import { ModalBase } from './ModalBase';
import { agregarMedia } from '@shared/services/media';
import type { MediaSeccion } from '@shared/types/supabase';

interface AgregarMediaModalProps {
  open: boolean;
  seccion: MediaSeccion;
  /** siguiente valor libre de orden, propuesto por defecto */
  ordenSugerido: number;
  onClose: () => void;
  onAgregada: () => void;
}

export function AgregarMediaModal({
  open,
  seccion,
  ordenSugerido,
  onClose,
  onAgregada,
}: AgregarMediaModalProps) {
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [orden, setOrden] = useState('0');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewFalla, setPreviewFalla] = useState(false);

  useEffect(() => {
    if (open) {
      setUrl('');
      setAlt('');
      setOrden(String(ordenSugerido));
      setError(null);
      setPreviewFalla(false);
    }
  }, [open, ordenSugerido]);

  const urlValida = /^https?:\/\/.+/i.test(url.trim());

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (enviando) return;

    if (!urlValida) {
      setError('La URL debe empezar por http:// o https://');
      return;
    }
    const n = Number(orden);
    if (!Number.isInteger(n)) {
      setError('El orden debe ser un número entero.');
      return;
    }

    setError(null);
    setEnviando(true);
    try {
      await agregarMedia({ seccion, url, alt, orden: n });
      onAgregada();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo agregar la imagen.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ModalBase
      open={open}
      titulo="Agregar foto"
      descripcion={seccion === 'hero' ? 'Carrusel del inicio' : 'Sección «Nuestra historia»'}
      onClose={onClose}
      ancho="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-stone-700">URL de la imagen</span>
          <Input
            className="mt-1.5"
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setPreviewFalla(false);
            }}
            disabled={enviando}
            placeholder="https://…"
            required
          />
          <span className="mt-1.5 block text-xs text-stone-500">
            Enlace de Supabase Storage o cualquier URL pública de imagen.
          </span>
        </label>

        {/* vista previa en vivo */}
        <div className="overflow-hidden rounded-xl border border-sand-200 bg-sand-50">
          {urlValida && !previewFalla ? (
            <img
              src={url.trim()}
              alt="Vista previa"
              onError={() => setPreviewFalla(true)}
              className="h-44 w-full object-cover"
            />
          ) : (
            <div className="flex h-44 w-full flex-col items-center justify-center gap-2 text-stone-400">
              <ImageOff size={22} />
              <span className="text-xs">
                {previewFalla ? 'No se pudo cargar la imagen' : 'La vista previa aparecerá aquí'}
              </span>
            </div>
          )}
        </div>

        <label className="block">
          <span className="text-sm font-medium text-stone-700">Texto alternativo</span>
          <Input
            className="mt-1.5"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            disabled={enviando}
            placeholder="Describe la imagen para lectores de pantalla"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-700">Orden</span>
          <Input
            className="mt-1.5"
            type="number"
            step={1}
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            disabled={enviando}
          />
          <span className="mt-1.5 block text-xs text-stone-500">
            Menor número aparece primero.
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
          <Button type="button" variant="outline" onClick={onClose} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" disabled={enviando}>
            {enviando ? 'Guardando…' : 'Agregar foto'}
          </Button>
        </div>
      </form>
    </ModalBase>
  );
}
