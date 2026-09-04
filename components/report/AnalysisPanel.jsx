'use client';

import { BadgeCheck, BrainCircuit, Building2, FileText, Lightbulb, Scale } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import EmergencyAlert from './EmergencyAlert';
import { PRIORITY_STYLE } from '@/utils/client';

function Meter({ value, max = 10, tone = 'blue', label }) {
  const pct = Math.round((value / max) * 100);
  const bar = {
    blue: 'bg-gradient-to-r from-sky-500 to-blue-600',
    emerald: 'bg-emerald-500',
    orange: 'bg-gradient-to-r from-amber-400 to-orange-500',
    red: 'bg-gradient-to-r from-red-500 to-red-600',
  };
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</span>
        <span className="text-[15px] font-bold text-slate-900">{value}{max ? ` / ${max}` : ''}</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all duration-700 ${bar[tone]}`} style={{ width: `${Math.max(2, pct)}%` }} />
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <span className="shrink-0 pt-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </span>
      <span className="text-right text-[14px] font-semibold text-slate-800">{children}</span>
    </div>
  );
}

export default function AnalysisPanel({ analysis, priority, emergency }) {
  const pStyle = PRIORITY_STYLE[priority?.label] || PRIORITY_STYLE.Low;
  const isEmergency = Boolean(emergency?.isEmergency) || analysis?.isEmergency;

  return (
    <div className="space-y-5 animate-fade-in-up">
      {isEmergency && <EmergencyAlert emergency={emergency} />}

      <div className="card !p-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
          <h3 className="flex items-center gap-2 text-[16px] font-bold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-civic-blue">
              <BrainCircuit size={18} aria-hidden />
            </span>
            AI Understood Your Complaint
          </h3>
          <Badge tone="green" className="gap-1.5">
            <BadgeCheck size={13} aria-hidden />
            Analysis complete
          </Badge>
        </div>

        <dl className="px-5">
          <Row label="Issue">
            <span className="inline-flex items-center gap-1.5">
              <FileText size={14} className="text-slate-400" aria-hidden />
              {analysis.issue}
            </span>
          </Row>
          <Row label="Category">{analysis.category}</Row>
          <Row label="Department">
            <span className="inline-flex items-center gap-1.5">
              <Building2 size={14} className="text-slate-400" aria-hidden />
              {analysis.department}
            </span>
          </Row>
          <Row label="Priority">
            <Badge tone={pStyle.tone || 'slate'} dot={pStyle.dot} uppercase>
              {priority?.label || analysis.priority}
            </Badge>
          </Row>
        </dl>

        <div className="grid gap-6 px-5 pb-5 pt-2 sm:grid-cols-3">
          <Meter label="Severity" value={analysis.severity} tone={analysis.severity >= 8 ? 'red' : analysis.severity >= 5 ? 'orange' : 'blue'} />
          <Meter label="Confidence" value={Math.round((analysis.confidence || 0) * 100)} max={100} tone="emerald" />
          <Meter label="Priority score" value={priority?.score || analysis.priorityScore || 0} max={100} tone="blue" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
          <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-slate-500">
            <Lightbulb size={14} className="text-amber-500" aria-hidden />
            AI summary
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-slate-700">{analysis.summary}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
          <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-slate-500">
            <Scale size={14} className="text-civic-blue" aria-hidden />
            Why AI rated it this way
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-slate-700">{analysis.reason}</p>
          {priority?.notes?.length > 0 && (
            <ul className="mt-3 space-y-1 border-t border-slate-200 pt-3">
              {priority.notes.map((n) => (
                <li key={n} className="flex items-start gap-2 text-[12.5px] text-slate-500">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-civic-blue" aria-hidden />
                  {n}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
