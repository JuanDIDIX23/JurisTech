import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Coins, User, Calendar, Tag, Plus, ClipboardList } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody, Button, Select } from '@shared/ui';
import { PageContainer } from '@features/dashboard/components/PageContainer';
import { StatusBadge } from '@features/dashboard/components/StatusBadge';
import { RequestTimeline } from '@features/dashboard/components/RequestTimeline';
import { useAppStore } from '@shared/store/useAppStore';
import { REQUEST_STATUS_LABELS, SERVICE_CATEGORY_LABELS } from '@shared/constants/labels';
import { formatDate } from '@shared/lib/format';
import { ROUTES } from '@app/routes';
import { cn } from '@shared/lib/cn';

const STATUS_FILTER = [
  { value: 'all', label: 'Todos los estados' },
  ...Object.entries(REQUEST_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

export default function RequestsPage() {
  const { requests } = useAppStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>('all');

  const filtered = useMemo(
    () =>
      requests
        .filter((r) => (status === 'all' ? true : r.status === status))
        .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    [requests, status],
  );

  const selected = useMemo(
    () => requests.find((r) => r.id === id) ?? filtered[0] ?? requests[0],
    [requests, id, filtered],
  );

  return (
    <PageContainer
      title="Solicitudes"
      description="Sigue el estado de tus solicitudes jurídicas en tiempo real."
      actions={
        <Button size="sm" leftIcon={<Plus size={16} />}>
          Nueva solicitud
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-5">
        {/* lista */}
        <div className="lg:col-span-2">
          <div className="mb-3">
            <Select
              options={STATUS_FILTER}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            {filtered.map((req) => {
              const active = selected?.id === req.id;
              return (
                <button
                  key={req.id}
                  onClick={() => navigate(ROUTES.requestDetail(req.id))}
                  className={cn(
                    'w-full rounded-2xl border bg-white p-4 text-left transition-all',
                    active
                      ? 'border-accent-300 shadow-card ring-1 ring-accent-200'
                      : 'border-graphite-200/70 hover:border-graphite-300 hover:shadow-card',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-graphite-400">{req.reference}</span>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-navy-900">{req.title}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-graphite-500">
                    <span className="inline-flex items-center gap-1">
                      <Tag size={13} />
                      {SERVICE_CATEGORY_LABELS[req.category]}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Coins size={13} />
                      {req.tokensCost} tokens
                    </span>
                  </div>
                </button>
              );
            })}

            {filtered.length === 0 && (
              <Card className="flex flex-col items-center py-14 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-graphite-100 text-graphite-400">
                  <ClipboardList size={20} />
                </span>
                <p className="mt-3 text-sm font-medium text-navy-900">Sin solicitudes</p>
                <p className="mt-1 text-sm text-graphite-500">No hay solicitudes con este estado.</p>
              </Card>
            )}
          </div>
        </div>

        {/* detalle */}
        <div className="lg:col-span-3">
          {selected ? (
            <Card>
              <CardHeader className="flex-col items-start gap-3 sm:flex-row sm:items-center">
                <div>
                  <span className="text-xs font-medium text-graphite-400">
                    {selected.reference}
                  </span>
                  <CardTitle className="mt-1 text-base">{selected.title}</CardTitle>
                </div>
                <StatusBadge status={selected.status} />
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 gap-4 rounded-xl bg-graphite-50 p-4 sm:grid-cols-4">
                  <Meta icon={Tag} label="Área" value={SERVICE_CATEGORY_LABELS[selected.category]} />
                  <Meta icon={User} label="Asignado a" value={selected.assignedTo} />
                  <Meta icon={Coins} label="Coste" value={`${selected.tokensCost} tokens`} />
                  <Meta icon={Calendar} label="Creada" value={formatDate(selected.createdAt)} />
                </div>

                <div className="mt-7">
                  <h4 className="mb-5 text-sm font-semibold text-navy-900">Seguimiento</h4>
                  <RequestTimeline events={selected.timeline} />
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card className="flex items-center justify-center py-20 text-sm text-graphite-400">
              Selecciona una solicitud para ver el detalle.
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Tag;
  label: string;
  value: string;
}) {
  return (
    <div>
      <span className="inline-flex items-center gap-1.5 text-xs text-graphite-500">
        <Icon size={13} />
        {label}
      </span>
      <p className="mt-1 text-sm font-medium text-navy-900">{value}</p>
    </div>
  );
}
