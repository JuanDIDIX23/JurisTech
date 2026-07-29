import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Info } from 'lucide-react';
import { Badge, Card } from '@shared/ui';
import { PageContainer } from '@features/dashboard/components/PageContainer';
import { SolicitudTimeline } from '@features/dashboard/components/SolicitudTimeline';
import { getMyDocumentos, getSolicitudById } from '@shared/services/afiliado';
import {
  SOLICITUD_ESTADO_LABELS,
  SOLICITUD_ESTADO_TONE,
  SOLICITUD_PRIORIDAD_LABELS,
  SOLICITUD_PRIORIDAD_TONE,
  SOLICITUD_TIPO_LABELS,
} from '@shared/constants/labels';
import { formatDateTime } from '@shared/lib/format';
import { ROUTES } from '@app/routes';
import type { Documento, Solicitud } from '@shared/types/supabase';

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-widest text-stone-500">{label}</dt>
      <dd className="mt-1 text-sm text-stone-900">{valor}</dd>
    </div>
  );
}

export default function SolicitudDetallePage() {
  const { id } = useParams<{ id: string }>();
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelado = false;

    async function cargar() {
      setLoading(true);
      setError(null);
      try {
        const [s, docs] = await Promise.all([getSolicitudById(id as string), getMyDocumentos()]);
        if (cancelado) return;
        setSolicitud(s);
        setDocumentos(docs.filter((d) => d.solicitud_id === id));
      } catch (err) {
        if (!cancelado) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar la solicitud.');
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    void cargar();
    return () => {
      cancelado = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sand-200 border-t-brand-500" />
      </div>
    );
  }

  if (error || !solicitud) {
    return (
      <PageContainer title="Solicitud">
        <Card className="px-6 py-16 text-center">
          <p className="text-sm font-medium text-stone-600">
            {error ?? 'No encontramos esta solicitud.'}
          </p>
          <Link
            to={ROUTES.requests}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <ArrowLeft size={14} /> Volver a solicitudes
          </Link>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={solicitud.codigo ?? 'Solicitud'}
      description={SOLICITUD_TIPO_LABELS[solicitud.tipo]}
      actions={
        <Link
          to={ROUTES.requests}
          className="inline-flex items-center gap-1.5 rounded-xl border border-sand-200 px-3.5 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-sand-100"
        >
          <ArrowLeft size={15} /> Volver
        </Link>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={SOLICITUD_ESTADO_TONE[solicitud.estado]} dot>
                {SOLICITUD_ESTADO_LABELS[solicitud.estado]}
              </Badge>
              <Badge className={SOLICITUD_PRIORIDAD_TONE[solicitud.prioridad]}>
                {SOLICITUD_PRIORIDAD_LABELS[solicitud.prioridad]}
              </Badge>
            </div>

            <dl className="mt-5 grid gap-5 sm:grid-cols-2">
              <Dato label="Tipo" valor={SOLICITUD_TIPO_LABELS[solicitud.tipo]} />
              <Dato label="Creada" valor={formatDateTime(solicitud.created_at)} />
              <Dato
                label="Tokens estimados"
                valor={
                  solicitud.tokens_estimados !== null
                    ? String(solicitud.tokens_estimados)
                    : 'Por definir'
                }
              />
              <Dato label="Tokens consumidos" valor={String(solicitud.tokens_consumidos)} />
              <Dato label="Última actualización" valor={formatDateTime(solicitud.updated_at)} />
              <Dato label="Responsable" valor={solicitud.asignado_a ?? 'Por asignar'} />
            </dl>

            <div className="mt-6 border-t border-sand-200 pt-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-500">
                Descripción
              </h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-stone-700">
                {solicitud.descripcion}
              </p>
            </div>

            {solicitud.notas_admin && (
              <div className="mt-5 rounded-xl border border-brand-200 bg-brand-50/60 p-4">
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-700">
                  <Info size={14} />
                  Notas del equipo
                </h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-stone-700">
                  {solicitud.notas_admin}
                </p>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-stone-900">Documentos adjuntos</h3>
            {documentos.length === 0 ? (
              <p className="mt-4 text-sm text-stone-400">
                Aún no hay documentos asociados a esta solicitud.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {documentos.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center gap-3 rounded-xl border border-sand-200 p-3"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <FileText size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-stone-900">{d.nombre}</p>
                      {d.descripcion && (
                        <p className="truncate text-xs text-stone-500">{d.descripcion}</p>
                      )}
                    </div>
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                    >
                      <Download size={14} />
                      Descargar
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card className="h-fit p-5">
          <h3 className="text-sm font-semibold text-stone-900">Seguimiento</h3>
          <div className="mt-5">
            <SolicitudTimeline estado={solicitud.estado} />
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
