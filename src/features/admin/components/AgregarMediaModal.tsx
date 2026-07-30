import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { ImageOff, Upload, Link2, FileImage } from 'lucide-react';
import { Button, Input } from '@shared/ui';
import { ModalBase } from './ModalBase';
import { agregarMedia, subirImagen } from '@shared/services/media';
import { cn } from '@shared/lib/cn';
import type { MediaSeccion } from '@shared/types/supabase';

interface AgregarMediaModalProps {
  open: boolean;
  seccion: MediaSeccion;
  /** siguiente valor libre de orden, propuesto por defecto */
  ordenSugerido: number;
  onClose: () => void;
  onAgregada: () => void;
}

type Origen = 'archivo' | 'url';

const LIMITE_BYTES = 10 * 1024 * 1024;
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

function formatearTamano(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AgregarMediaModal({
  open,
  seccion,
  ordenSugerido,
  onClose,
  onAgregada,
}: AgregarMediaModalProps) {
  const [origen, setOrigen] = useState<Origen>('archivo');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [previewLocal, setPreviewLocal] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [orden, setOrden] = useState('0');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewFalla, setPreviewFalla] = useState(false);
  const inputArchivo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setOrigen('archivo');
      setArchivo(null);
      setPreviewLocal(null);
      setUrl('');
      setAlt('');
      setOrden(String(ordenSugerido));
      setError(null);
      setPreviewFalla(false);
    }
  }, [open, ordenSugerido]);

  // El object URL de la vista previa hay que liberarlo o queda en memoria.
  useEffect(() => {
    return () => {
      if (previewLocal) URL.revokeObjectURL(previewLocal);
    };
  }, [previewLocal]);

  const urlValida = /^https?:\/\/.+/i.test(url.trim());

  function handleArchivo(e: ChangeEvent<HTMLInputElement>) {
    const elegido = e.target.files?.[0] ?? null;
    if (!elegido) return;

    // Se valida en cliente para dar un mensaje inmediato; el bucket
    // aplica los mismos límites por su cuenta.
    if (!TIPOS_PERMITIDOS.includes(elegido.type)) {
      setError('Formato no permitido. Usa JPG, PNG, WebP, AVIF o GIF.');
      return;
    }
    if (elegido.size > LIMITE_BYTES) {
      setError(`La imagen pesa ${formatearTamano(elegido.size)} y el límite son 10 MB.`);
      return;
    }

    if (previewLocal) URL.revokeObjectURL(previewLocal);
    setArchivo(elegido);
    setPreviewLocal(URL.createObjectURL(elegido));
    setError(null);
    if (alt.trim() === '') {
      setAlt(elegido.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]/g, ' '));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (enviando) return;

    const n = Number(orden);
    if (!Number.isInteger(n)) {
      setError('El orden debe ser un número entero.');
      return;
    }

    if (origen === 'archivo' && !archivo) {
      setError('Selecciona una imagen de tu dispositivo.');
      return;
    }
    if (origen === 'url' && !urlValida) {
      setError('La URL debe empezar por http:// o https://');
      return;
    }

    setError(null);
    setEnviando(true);
    try {
      const urlFinal =
        origen === 'archivo' && archivo ? await subirImagen(seccion, archivo) : url.trim();

      await agregarMedia({ seccion, url: urlFinal, alt, orden: n });
      onAgregada();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo agregar la imagen.');
    } finally {
      setEnviando(false);
    }
  }

  const preview = origen === 'archivo' ? previewLocal : urlValida ? url.trim() : null;

  return (
    <ModalBase
      open={open}
      titulo="Agregar foto"
      descripcion={seccion === 'hero' ? 'Carrusel del inicio' : 'Sección «Nuestra historia»'}
      onClose={onClose}
      ancho="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* origen de la imagen */}
        <div className="inline-flex w-full rounded-xl border border-sand-200 bg-white p-1">
          {(
            [
              { id: 'archivo' as Origen, label: 'Subir archivo', icon: Upload },
              { id: 'url' as Origen, label: 'Pegar URL', icon: Link2 },
            ] satisfies Array<{ id: Origen; label: string; icon: typeof Upload }>
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              disabled={enviando}
              onClick={() => {
                setOrigen(id);
                setError(null);
              }}
              className={cn(
                'inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50',
                origen === id ? 'bg-brand-600 text-white' : 'text-stone-600 hover:bg-sand-100',
              )}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {origen === 'archivo' ? (
          <div>
            <input
              ref={inputArchivo}
              type="file"
              accept="image/*"
              onChange={handleArchivo}
              disabled={enviando}
              className="sr-only"
            />
            <button
              type="button"
              onClick={() => inputArchivo.current?.click()}
              disabled={enviando}
              className="flex w-full items-center gap-3 rounded-xl border border-dashed border-sand-300 px-4 py-3 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/40 disabled:opacity-50"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <FileImage size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-stone-900">
                  {archivo ? archivo.name : 'Subir desde dispositivo'}
                </span>
                <span className="block text-xs text-stone-500">
                  {archivo
                    ? formatearTamano(archivo.size)
                    : 'JPG, PNG, WebP, AVIF o GIF · máximo 10 MB'}
                </span>
              </span>
            </button>
          </div>
        ) : (
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
            />
          </label>
        )}

        {/* vista previa */}
        <div className="overflow-hidden rounded-xl border border-sand-200 bg-sand-50">
          {preview && !previewFalla ? (
            <img
              src={preview}
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

        {/* progreso: la API de Storage no expone porcentaje, así que la
            barra es indeterminada en vez de mostrar un avance inventado */}
        {enviando && origen === 'archivo' && (
          <div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-sand-100">
              <div className="h-full w-1/3 animate-progress rounded-full bg-gradient-to-r from-brand-600 to-brand-400" />
            </div>
            <p className="mt-1.5 text-xs text-stone-500">Subiendo imagen…</p>
          </div>
        )}

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
