import { Link } from 'react-router-dom';
import { Coins, Flame, ClipboardList, FileText, ArrowRight, Download } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardBody } from '@shared/ui';
import { PageContainer } from '@features/dashboard/components/PageContainer';
import { StatCard } from '@features/dashboard/components/StatCard';
import { StatusBadge } from '@features/dashboard/components/StatusBadge';
import { DocumentTypeIcon } from '@features/dashboard/components/DocumentTypeIcon';
import { useAppStore } from '@shared/store/useAppStore';
import { formatNumber, formatRelative, formatFileSize } from '@shared/lib/format';
import { ROUTES } from '@app/routes';

export default function DashboardPage() {
  const { company, tokenSummary, requests, documents } = useAppStore();

  const activeRequests = requests.filter(
    (r) => r.status === 'pending' || r.status === 'in_review' || r.status === 'in_progress',
  );
  const recentDocs = [...documents]
    .sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))
    .slice(0, 5);
  const usagePct = Math.round((tokenSummary.consumed / tokenSummary.purchased) * 100);

  return (
    <PageContainer
      title={`Hola, ${company.contactName.split(' ')[0]} 👋`}
      description={`Resumen de actividad de ${company.name}.`}
      actions={
        <Link to={ROUTES.requests}>
          <Button variant="outline" size="sm" rightIcon={<ArrowRight size={16} />}>
            Ver solicitudes
          </Button>
        </Link>
      }
    >
      {/* métricas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tokens disponibles"
          value={formatNumber(tokenSummary.remaining)}
          icon={Coins}
          hint={`de ${formatNumber(tokenSummary.purchased)} adquiridos`}
          accent
        />
        <StatCard
          label="Tokens consumidos"
          value={formatNumber(tokenSummary.consumed)}
          icon={Flame}
          delta={12}
          hint={`${usagePct}% del total`}
        />
        <StatCard
          label="Solicitudes activas"
          value={formatNumber(activeRequests.length)}
          icon={ClipboardList}
          hint="en curso ahora mismo"
        />
        <StatCard
          label="Documentos"
          value={formatNumber(documents.length)}
          icon={FileText}
          delta={8}
          hint="total en tu cuenta"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* consumo + solicitudes activas */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Consumo de tokens</CardTitle>
              <span className="text-xs text-graphite-500">
                Renovación · plan {company.plan.name}
              </span>
            </CardHeader>
            <CardBody>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-navy-900">
                    {formatNumber(tokenSummary.consumed)}
                    <span className="text-base font-medium text-graphite-400">
                      {' '}
                      / {formatNumber(tokenSummary.purchased)}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-graphite-500">tokens utilizados este ciclo</p>
                </div>
                <span className="rounded-full bg-accent-50 px-3 py-1 text-sm font-semibold text-accent-700">
                  {usagePct}%
                </span>
              </div>
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-graphite-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-600 to-accent-400 transition-all"
                  style={{ width: `${usagePct}%` }}
                />
              </div>
              <div className="mt-3 flex justify-between text-xs text-graphite-400">
                <span>0</span>
                <span>{formatNumber(tokenSummary.remaining)} restantes</span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Solicitudes activas</CardTitle>
              <Link
                to={ROUTES.requests}
                className="text-xs font-medium text-accent-600 hover:text-accent-700"
              >
                Ver todas
              </Link>
            </CardHeader>
            <CardBody className="space-y-2 pt-2">
              {activeRequests.map((req) => (
                <Link
                  key={req.id}
                  to={ROUTES.requestDetail(req.id)}
                  className="flex items-center justify-between rounded-xl border border-graphite-200/70 px-4 py-3 transition-colors hover:border-accent-200 hover:bg-graphite-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy-900">{req.title}</p>
                    <p className="text-xs text-graphite-500">
                      {req.reference} · {req.assignedTo}
                    </p>
                  </div>
                  <StatusBadge status={req.status} />
                </Link>
              ))}
              {activeRequests.length === 0 && (
                <p className="py-6 text-center text-sm text-graphite-400">
                  No tienes solicitudes activas.
                </p>
              )}
            </CardBody>
          </Card>
        </div>

        {/* documentos recientes */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Documentos recientes</CardTitle>
            <Link
              to={ROUTES.documents}
              className="text-xs font-medium text-accent-600 hover:text-accent-700"
            >
              Ver todos
            </Link>
          </CardHeader>
          <CardBody className="space-y-1 pt-2">
            {recentDocs.map((doc) => (
              <div
                key={doc.id}
                className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-graphite-50"
              >
                <DocumentTypeIcon type={doc.type} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-navy-900">{doc.name}</p>
                  <p className="text-xs text-graphite-500">
                    {formatFileSize(doc.sizeKb)} · {formatRelative(doc.uploadedAt)}
                  </p>
                </div>
                <button
                  className="text-graphite-300 opacity-0 transition-opacity hover:text-accent-600 group-hover:opacity-100"
                  aria-label={`Descargar ${doc.name}`}
                >
                  <Download size={16} />
                </button>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  );
}
