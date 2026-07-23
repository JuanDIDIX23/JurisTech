import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Hash,
  Briefcase,
  Check,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody, Button, Badge } from '@shared/ui';
import { PageContainer } from '@features/dashboard/components/PageContainer';
import { useAppStore } from '@shared/store/useAppStore';
import { formatCurrency, formatDate, formatNumber } from '@shared/lib/format';

export default function ProfilePage() {
  const { company } = useAppStore();
  const { plan } = company;

  const initials = company.contactName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');

  return (
    <PageContainer
      title="Perfil"
      description="Gestiona los datos de tu empresa y tu plan contratado."
    >
      {/* cabecera empresa */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-stone-900 to-stone-700" />
        <div className="px-6 pb-6">
          <div className="-mt-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <span className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-brand-600 text-2xl font-bold text-white ring-4 ring-white">
                {initials}
              </span>
              <div className="pb-1">
                <h2 className="text-lg font-bold text-stone-900">{company.name}</h2>
                <p className="text-sm text-stone-500">{company.industry}</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Editar perfil
            </Button>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* datos empresa */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Datos de empresa</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <Field icon={Building2} label="Razón social" value={company.legalName} />
              <Field icon={Hash} label="NIT" value={company.taxId} />
              <Field icon={Briefcase} label="Sector" value={company.industry} />
              <Field icon={Mail} label="Email" value={company.email} />
              <Field icon={Phone} label="Teléfono" value={company.phone} />
              <Field
                icon={MapPin}
                label="Dirección"
                value={`${company.address}, ${company.city}, ${company.country}`}
              />
            </div>

            <div className="mt-6 border-t border-sand-200 pt-5">
              <h4 className="text-sm font-semibold text-stone-900">Persona de contacto</h4>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white">
                  {initials}
                </span>
                <div>
                  <p className="text-sm font-medium text-stone-900">{company.contactName}</p>
                  <p className="text-xs text-stone-500">{company.contactRole}</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* plan */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Plan contratado</CardTitle>
            <Badge className="bg-brand-50 text-brand-700 ring-brand-200">
              <Sparkles size={12} /> {plan.name}
            </Badge>
          </CardHeader>
          <CardBody>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-stone-900">
                {formatCurrency(plan.pricePerMonth)}
              </span>
              <span className="text-sm text-stone-500">/ mes</span>
            </div>
            <p className="mt-1 text-sm text-stone-500">
              {formatNumber(plan.monthlyTokens)} tokens mensuales incluidos
            </p>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-sand-50 px-4 py-3 text-sm text-stone-600">
              <CreditCard size={16} className="text-stone-400" />
              Renovación el {formatDate(plan.renewalDate)}
            </div>

            <ul className="mt-5 space-y-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-stone-700">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                    <Check size={11} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <Button className="mt-6 w-full">Cambiar de plan</Button>
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  );
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div>
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500">
        <Icon size={13} />
        {label}
      </span>
      <p className="mt-1 text-sm font-medium text-stone-900">{value}</p>
    </div>
  );
}
