import { FileText, FileSignature, FileBarChart, ReceiptText, ShieldCheck, File } from 'lucide-react';
import type { DocumentType } from '@shared/types';

const MAP: Record<DocumentType, { icon: typeof FileText; tone: string }> = {
  contract: { icon: FileSignature, tone: 'bg-brand-50 text-brand-600' },
  legal_opinion: { icon: FileText, tone: 'bg-violet-50 text-violet-600' },
  report: { icon: FileBarChart, tone: 'bg-emerald-50 text-emerald-600' },
  invoice: { icon: ReceiptText, tone: 'bg-amber-50 text-amber-600' },
  policy: { icon: ShieldCheck, tone: 'bg-sky-50 text-sky-600' },
  other: { icon: File, tone: 'bg-sand-100 text-stone-600' },
};

export function DocumentTypeIcon({ type, size = 16 }: { type: DocumentType; size?: number }) {
  const { icon: Icon, tone } = MAP[type];
  return (
    <span
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}
      aria-hidden
    >
      <Icon size={size} />
    </span>
  );
}
