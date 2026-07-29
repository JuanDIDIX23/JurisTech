import { useEffect, useMemo, useState } from 'react';
import { Download, FileText, FileX } from 'lucide-react';
import { Card, Select } from '@shared/ui';
import { PageContainer } from '@features/dashboard/components/PageContainer';
import { getMyDocumentos } from '@shared/services/afiliado';
import { SOLICITUD_TIPO_LABELS } from '@shared/constants/labels';
import { formatDate } from '@shared/lib/format';
import type { Documento } from '@shared/types/supabase';

export default function DocumentsPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [solicitudId, setSolicitudId] = useState('');

  useEffect(() => {
    let cancelado = false;

    void getMyDocumentos()
      .then((data) => {
        if (!cancelado) setDocumentos(data);
      })
      .catch((err: unknown) => {
        if (!cancelado) {
          setError(err instanceof Error ? err.message : 'No se pudieron cargar tus documentos.');
        }
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  // Solo se ofrecen como filtro las solicitudes que realmente tienen
  // documentos asociados.
  const opcionesSolicitud = useMemo(() => {
    const vistas = new Map<string, string>();
    for (const d of documentos) {
      if (d.solicitud_id && d.solicitud) {
        vistas.set(
          d.solicitud_id,
          `${d.solicitud.codigo ?? '—'} · ${SOLICITUD_TIPO_LABELS[d.solicitud.tipo]}`,
        );
      }
    }
    return [
      { value: '', label: 'Todas las solicitudes' },
      ...[...vistas.entries()].map(([value, label]) => ({ value, label })),
      { value: 'sin', label: 'Sin solicitud asociada' },
    ];
  }, [documentos]);

  const filtrados = useMemo(() => {
    if (!solicitudId) return documentos;
    if (solicitudId === 'sin') return documentos.filter((d) => !d.solicitud_id);
    return documentos.filter((d) => d.solicitud_id === solicitudId);
  }, [documentos, solicitudId]);

  return (
    <PageContainer
      title="Documentos"
      description="Entregables y soportes de tus solicitudes."
    >
      {documentos.length > 0 && (
        <Card className="p-4">
          <div className="sm:max-w-sm">
            <Select
              options={opcionesSolicitud}
              value={solicitudId}
              onChange={(e) => setSolicitudId(e.target.value)}
              aria-label="Filtrar por solicitud"
            />
          </div>
        </Card>
      )}

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
      ) : filtrados.length === 0 ? (
        <Card className="mt-4 px-6 py-16 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sand-100 text-stone-400">
            <FileX size={22} />
          </span>
          <p className="mt-4 text-sm font-medium text-stone-600">
            {documentos.length === 0
              ? 'El equipo de JurisTech subirá aquí los documentos de tus solicitudes.'
              : 'No hay documentos para esta solicitud.'}
          </p>
        </Card>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((d) => (
            <Card key={d.id} className="flex flex-col p-5" hoverable>
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <FileText size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-stone-900" title={d.nombre}>
                    {d.nombre}
                  </h3>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {d.tipo_archivo ?? 'Archivo'} · {formatDate(d.created_at)}
                  </p>
                </div>
              </div>

              {d.descripcion && (
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-stone-600">
                  {d.descripcion}
                </p>
              )}

              {d.solicitud && (
                <p className="mt-3 text-xs text-stone-500">
                  Solicitud{' '}
                  <span className="font-semibold text-stone-700">
                    {d.solicitud.codigo ?? '—'}
                  </span>
                </p>
              )}

              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-sand-200 px-3.5 py-2 text-sm font-semibold text-stone-800 transition-colors hover:border-brand-300 hover:bg-brand-50"
              >
                <Download size={15} />
                Descargar
              </a>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
