import { useMemo, useState } from 'react';
import { Search, Download, FileX } from 'lucide-react';
import { Card, Input, Select, Button } from '@shared/ui';
import { PageContainer } from '@features/dashboard/components/PageContainer';
import { DocumentTypeIcon } from '@features/dashboard/components/DocumentTypeIcon';
import { useAppStore } from '@shared/store/useAppStore';
import { DOCUMENT_TYPE_LABELS } from '@shared/constants/labels';
import { formatDate, formatFileSize } from '@shared/lib/format';
import type { DocumentType } from '@shared/types';

const TYPE_OPTIONS = [
  { value: 'all', label: 'Todos los tipos' },
  ...Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

export default function DocumentsPage() {
  const { documents } = useAppStore();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<string>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return documents
      .filter((d) => (type === 'all' ? true : d.type === type))
      .filter((d) => (q ? d.name.toLowerCase().includes(q) || d.owner.toLowerCase().includes(q) : true))
      .sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt));
  }, [documents, query, type]);

  return (
    <PageContainer
      title="Documentos"
      description="Centraliza, busca y descarga toda tu documentación jurídica."
    >
      {/* filtros */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="sm:max-w-xs sm:flex-1">
          <Input
            placeholder="Buscar por nombre o responsable…"
            leftIcon={<Search size={16} />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="sm:w-52">
          <Select
            options={TYPE_OPTIONS}
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
        </div>
        <span className="text-sm text-graphite-500 sm:ml-auto">
          {filtered.length} {filtered.length === 1 ? 'documento' : 'documentos'}
        </span>
      </div>

      <Card className="overflow-hidden">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-graphite-200/70 text-left text-xs uppercase tracking-wide text-graphite-500">
                  <th className="px-6 py-3.5 font-medium">Documento</th>
                  <th className="px-6 py-3.5 font-medium">Tipo</th>
                  <th className="hidden px-6 py-3.5 font-medium md:table-cell">Responsable</th>
                  <th className="hidden px-6 py-3.5 font-medium sm:table-cell">Tamaño</th>
                  <th className="px-6 py-3.5 font-medium">Fecha</th>
                  <th className="px-6 py-3.5 text-right font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-200/60">
                {filtered.map((doc) => (
                  <tr key={doc.id} className="group transition-colors hover:bg-graphite-50/60">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <DocumentTypeIcon type={doc.type} />
                        <span className="font-medium text-navy-900">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-graphite-600">
                      {DOCUMENT_TYPE_LABELS[doc.type as DocumentType]}
                    </td>
                    <td className="hidden px-6 py-3.5 text-graphite-600 md:table-cell">
                      {doc.owner}
                    </td>
                    <td className="hidden px-6 py-3.5 text-graphite-600 sm:table-cell">
                      {formatFileSize(doc.sizeKb)}
                    </td>
                    <td className="px-6 py-3.5 text-graphite-600">{formatDate(doc.uploadedAt)}</td>
                    <td className="px-6 py-3.5 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<Download size={15} />}
                        className="text-graphite-600 hover:text-accent-600"
                      >
                        <span className="hidden sm:inline">Descargar</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-graphite-100 text-graphite-400">
              <FileX size={22} />
            </span>
            <p className="mt-4 text-sm font-medium text-navy-900">Sin resultados</p>
            <p className="mt-1 text-sm text-graphite-500">
              Prueba con otra búsqueda o cambia el filtro de tipo.
            </p>
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
