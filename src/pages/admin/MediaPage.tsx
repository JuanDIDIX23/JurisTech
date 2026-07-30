import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, ImageOff, Images } from 'lucide-react';
import { Button, Card } from '@shared/ui';
import { AgregarMediaModal } from '@features/admin/components/AgregarMediaModal';
import { actualizarOrden, eliminarMedia, getMediaAdmin } from '@shared/services/media';
import { cn } from '@shared/lib/cn';
import type { Media, MediaSeccion } from '@shared/types/supabase';

const PESTANAS: Array<{ id: MediaSeccion; label: string; ayuda: string }> = [
  {
    id: 'hero',
    label: 'Hero (carrusel)',
    ayuda:
      'Se muestran rotando como fondo del inicio. Sin fotos, el hero queda con el fondo azul sólido.',
  },
  {
    id: 'nosotros',
    label: 'Nosotros',
    ayuda:
      'Se usa la primera foto de la lista. Sin fotos, se muestra un marcador con el logo.',
  },
];

function FilaMedia({
  media,
  primera,
  ultima,
  ocupado,
  onSubir,
  onBajar,
  onEliminar,
}: {
  media: Media;
  primera: boolean;
  ultima: boolean;
  ocupado: boolean;
  onSubir: () => void;
  onBajar: () => void;
  onEliminar: () => void;
}) {
  const [falla, setFalla] = useState(false);

  return (
    <li
      className={cn(
        'flex items-center gap-4 rounded-xl border border-sand-200 p-3 transition-opacity',
        ocupado && 'opacity-50',
      )}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sand-100 text-xs font-semibold text-stone-600">
        {media.orden}
      </span>

      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-sand-100">
        {falla ? (
          <div className="flex h-full w-full items-center justify-center text-stone-400">
            <ImageOff size={18} />
          </div>
        ) : (
          <img
            src={media.url}
            alt={media.alt ?? ''}
            onError={() => setFalla(true)}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-stone-900" title={media.url}>
          {media.url}
        </p>
        <p className="mt-0.5 truncate text-xs text-stone-500">
          {media.alt ?? 'Sin texto alternativo'}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={onSubir}
          disabled={primera || ocupado}
          title="Subir"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-sand-100 disabled:opacity-30"
        >
          <ArrowUp size={15} />
        </button>
        <button
          onClick={onBajar}
          disabled={ultima || ocupado}
          title="Bajar"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-sand-100 disabled:opacity-30"
        >
          <ArrowDown size={15} />
        </button>
        <button
          onClick={onEliminar}
          disabled={ocupado}
          title="Eliminar"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-30"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </li>
  );
}

export default function MediaPage() {
  const [seccion, setSeccion] = useState<MediaSeccion>('hero');
  const [fotos, setFotos] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setFotos(await getMediaAdmin(seccion));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las imágenes.');
    } finally {
      setLoading(false);
    }
  }, [seccion]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  /** Intercambia el `orden` con el vecino y recarga. */
  async function mover(indice: number, direccion: -1 | 1) {
    const actual = fotos[indice];
    const vecino = fotos[indice + direccion];
    if (!actual || !vecino) return;

    setOcupado(true);
    try {
      await Promise.all([
        actualizarOrden(actual.id, vecino.orden),
        actualizarOrden(vecino.id, actual.orden),
      ]);
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar el orden.');
    } finally {
      setOcupado(false);
    }
  }

  async function borrar(media: Media) {
    setOcupado(true);
    try {
      await eliminarMedia(media.id);
      setFotos((actuales) => actuales.filter((f) => f.id !== media.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la imagen.');
    } finally {
      setOcupado(false);
    }
  }

  const ordenSugerido = fotos.length > 0 ? Math.max(...fotos.map((f) => f.orden)) + 1 : 0;
  const pestanaActual = PESTANAS.find((p) => p.id === seccion);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold leading-snug tracking-tight text-stone-900">Medios</h1>
          <p className="mt-1 text-sm text-stone-500">
            Fotos que se muestran en la landing pública.
          </p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
          Agregar foto
        </Button>
      </div>

      <div className="mt-6 inline-flex rounded-xl border border-sand-200 bg-white p-1">
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSeccion(p.id)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              seccion === p.id ? 'bg-brand-600 text-white' : 'text-stone-600 hover:bg-sand-100',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {pestanaActual && (
        <p className="mt-3 text-sm text-stone-500">{pestanaActual.ayuda}</p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {error}
        </p>
      )}

      <Card className="mt-4 p-5">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-sand-200 border-t-brand-500" />
          </div>
        ) : fotos.length === 0 ? (
          <div className="py-14 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sand-100 text-stone-400">
              <Images size={22} />
            </span>
            <p className="mt-4 text-sm font-medium text-stone-600">
              No hay fotos en esta sección.
            </p>
            <Button className="mt-5" leftIcon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
              Agregar la primera
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {fotos.map((media, i) => (
              <FilaMedia
                key={media.id}
                media={media}
                primera={i === 0}
                ultima={i === fotos.length - 1}
                ocupado={ocupado}
                onSubir={() => void mover(i, -1)}
                onBajar={() => void mover(i, 1)}
                onEliminar={() => void borrar(media)}
              />
            ))}
          </ul>
        )}
      </Card>

      <AgregarMediaModal
        open={modalOpen}
        seccion={seccion}
        ordenSugerido={ordenSugerido}
        onClose={() => setModalOpen(false)}
        onAgregada={() => void cargar()}
      />
    </div>
  );
}
