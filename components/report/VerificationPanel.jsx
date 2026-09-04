'use client';

import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, ShieldCheck } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { cn } from '@/utils/client';

function Ring({ value }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const color = pct >= 70 ? '#10b981' : pct >= 45 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative h-[120px] w-[120px]">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#eef2f7" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[26px] font-extrabold text-slate-900">{Math.round(value)}%</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">match</span>
      </div>
    </div>
  );
}

const STATUS_META = {
  VALID: { label: 'REPORT APPEARS VALID', tone: 'green', Icon: CheckCircle2, desc: 'The photo appears consistent with the complaint.' },
  SUSPICIOUS: { label: 'REPORT NEEDS REVIEW', tone: 'orange', Icon: AlertTriangle, desc: 'Some details could not be fully matched.' },
  UNVERIFIABLE: { label: 'EVIDENCE UNVERIFIABLE', tone: 'slate', Icon: HelpCircle, desc: 'Not enough usable evidence to cross-check.' },
  INVALID: { label: 'EVIDENCE MISMATCH', tone: 'red', Icon: XCircle, desc: 'The photo does not appear to match the complaint.' },
};

function Tick({ ok }) {
  return ok ? (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
      <CheckCircle2 size={13} aria-hidden />
    </span>
  ) : (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <span className="text-[10px] font-bold">—</span>
    </span>
  );
}

function CheckList({ title, items }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
      <p className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
      <ul className="mt-3 space-y-2.5">
        {items.map((it) => (
          <li key={it.label} className="flex items-center gap-2.5 text-[13px] text-slate-700">
            <Tick ok={it.ok} />
            <span>
              {it.label}
              {it.ok && <span className="sr-only">verified</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function VerificationPanel({ verification, textAnalysis, imageAnalysis }) {
  const meta = STATUS_META[verification?.verificationStatus] || STATUS_META.UNVERIFIABLE;
  const toneMap = {
    green: 'green',
    orange: 'orange',
    red: 'red',
    slate: 'slate',
  };

  const textChecks = [
    { label: 'Civic issue detected', ok: textAnalysis?.isCivicIssue !== false },
    { label: 'Category identified', ok: Boolean(textAnalysis?.category) },
    { label: 'Department identified', ok: Boolean(textAnalysis?.department) },
  ];
  const imageChecks = [
    { label: 'Civic issue visible in photo', ok: Boolean(imageAnalysis?.isCivicIssue) },
    { label: 'Image is relevant', ok: imageAnalysis?.imageRelevant !== false },
  ];

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="card !p-0">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-civic-blue">
            <ShieldCheck size={19} aria-hidden />
          </span>
          <div>
            <h3 className="text-[16px] font-bold text-slate-900">AI Evidence Verification</h3>
            <p className="text-[12.5px] text-slate-500">Cross-checking your description with the photograph</p>
          </div>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[240px_1fr]">
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-100 bg-white p-5">
            <Ring value={verification?.matchScore || 0} />
            <Badge tone={toneMap[meta.tone]} uppercase className="text-[11px]">
              {meta.label}
            </Badge>
            <p className="text-center text-[12.5px] leading-relaxed text-slate-500">{meta.desc}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <CheckList title="Text analysis" items={textChecks} />
            <CheckList title="Image analysis" items={imageChecks} />
          </div>
        </div>

        <div className="space-y-3 border-t border-slate-100 px-5 py-4">
          <div
            className={cn(
              'rounded-xl border px-4 py-3 text-[13.5px] leading-relaxed',
              meta.tone === 'green' && 'border-emerald-100 bg-emerald-50/60 text-emerald-900',
              meta.tone === 'orange' && 'border-amber-100 bg-amber-50/60 text-amber-900',
              meta.tone === 'red' && 'border-red-100 bg-red-50/60 text-red-900',
              meta.tone === 'slate' && 'border-slate-200 bg-slate-50 text-slate-700'
            )}
          >
            <p className="font-semibold">What CivicAI found</p>
            <p className="mt-1">{verification?.reason || 'Evidence could not be fully cross-checked.'}</p>
            {verification?.concerns?.length > 0 && (
              <ul className="mt-2 list-inside list-disc space-y-1 text-[12.5px] opacity-90">
                {verification.concerns.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            )}
          </div>
          <p className="text-[12px] text-slate-400">
            AI-assisted verification only. Final decisions should be reviewed by the responsible
            authority. No citizen is automatically accused of anything.
          </p>
        </div>
      </div>
    </div>
  );
}
