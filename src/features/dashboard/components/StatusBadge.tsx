import type { RequestStatus } from '@shared/types';
import { REQUEST_STATUS_LABELS, REQUEST_STATUS_TONE } from '@shared/constants/labels';
import { Badge } from '@shared/ui';

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <Badge dot className={REQUEST_STATUS_TONE[status]}>
      {REQUEST_STATUS_LABELS[status]}
    </Badge>
  );
}
