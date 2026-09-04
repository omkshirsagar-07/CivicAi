'use client';

import { CheckCircle2, Copy, Loader2, MapPin } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { cn, PRIORITY_STYLE } from '@/utils/client';
import { formatDistance } from '@/utils/geo';

function priorityTone(label) {
  const dot = PRIORITY_STYLE[label]?.dot;
  if (dot === 'bg-red-500') return 'red';
  if (dot === 'bg-orange-500') return 'orange';
  if (dot === 'bg-amber-500') return 'amber';
  return 'sky';
}

export default function DuplicateCard({ state, result, hasLocation }) {
  if (!hasLocation) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="flex items-start gap-3 border-b border-slate-100 px-4 py-3.5">
        {state === 'checking' ? (
          <Loader2 size={18} className="mt-0.5 animate-spin text-civic-blue" aria-hidden />
        ) : state === 'done' && (result?.count ?? 0) > 0 ? (
          <Copy size={18} className="mt-0.5 text-amber-600" aria-hidden />
        ) : (
          <CheckCircle2 size={18} className="mt-0.5 text-emerald-600" aria-hidden />
        )}
        <div>
          <h4 className="text-[14px] font-bold text-slate-900">Smart duplicate detection</h4>
          <p className="text-[12.5px] text-slate-500">
            {state === 'checking'
              ? 'Checking recent reports near this location…'
              : result && (result.count ?? 0) > 0
              ? `${result.count} similar report${result.count > 1 ? 's' : ''} appear${result.count > 1 ? '' : 's'} to exist nearby (within ~${formatDistance(result.radiusM || 2000)}).`
              : !result || result.available === false
              ? result?.message || 'Duplicate detection is temporarily unavailable.'
              : 'No similar reports found nearby. This looks like a fresh issue.'}
          </p>
        </div>
      </div>

      {state === 'done' && (result?.count ?? 0) > 0 && result.similar?.length > 0 && (
        <ul className="divide-y divide-slate-50">
          {result.similar.slice(0, 3).map((s, i) => (
            <li key={`${s.reportId || s.issue}-${i}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[13.5px] font-semibold text-slate-800">
                  <MapPin size={13} className="shrink-0 text-slate-400" aria-hidden />
                  <span className="truncate">{s.issue}</span>
                </p>
                <p className="mt-0.5 pl-5 text-[12px] text-slate-400">
                  {s.category} · {s.matchType} · {formatDistance(s.distanceMeters)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={priorityTone(s.priority)} uppercase className="!text-[10px]">
                  {s.priority}
                </Badge>
                <span className={cn('text-[12px] font-bold', s.similarity >= 60 ? 'text-amber-600' : 'text-slate-400')}>
                  {s.similarity}% similar
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {(state === 'done') && (
        <p className="border-t border-slate-50 px-4 py-2.5 text-[12px] text-slate-400">
          Your report is not blocked — duplicates simply help authorities group related requests.
        </p>
      )}
    </div>
  );
}
