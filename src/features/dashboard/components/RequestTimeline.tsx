import type { RequestTimelineEvent } from '@shared/types';
import { REQUEST_STATUS_TONE } from '@shared/constants/labels';
import { formatDateTime } from '@shared/lib/format';
import { cn } from '@shared/lib/cn';
import { Check } from 'lucide-react';

export function RequestTimeline({ events }: { events: RequestTimelineEvent[] }) {
  return (
    <ol className="relative space-y-6 pl-2">
      {events.map((ev, i) => {
        const isLast = i === events.length - 1;
        return (
          <li key={ev.id} className="relative flex gap-4">
            {/* línea conectora */}
            {!isLast && (
              <span className="absolute left-[15px] top-8 h-[calc(100%+0.6rem)] w-px bg-sand-200" />
            )}
            <span
              className={cn(
                'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white',
                REQUEST_STATUS_TONE[ev.status],
              )}
            >
              <Check size={14} />
            </span>
            <div className="pt-0.5">
              <p className="text-sm font-semibold text-stone-900">{ev.title}</p>
              <p className="mt-0.5 text-sm text-stone-500">{ev.description}</p>
              <p className="mt-1 text-xs text-stone-400">{formatDateTime(ev.date)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
