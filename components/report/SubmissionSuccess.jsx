'use client';

import Link from 'next/link';
import { CheckCircle2, Home, PlusCircle, ReceiptText } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { PRIORITY_STYLE, VERIFICATION_META, formatReportTime } from '@/utils/client';

function Field({ k, v }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
      <span className="text-[11.5px] font-bold uppercase tracking-wide text-slate-400">{k}</span>
      <span className="text-right text-[13.5px] font-semibold text-slate-800">{v}</span>
    </div>
  );
}

export default function SubmissionSuccess({ report, emergency }) {
  if (!report) return null;
  const pStyle = PRIORITY_STYLE[report.priority] || PRIORITY_STYLE.Low;
  const vMeta = VERIFICATION_META[report.verificationStatus] || VERIFICATION_META.UNVERIFIABLE;

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 text-center animate-fade-in-up">
      <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-soft">
          <CheckCircle2 size={30} aria-hidden />
        </span>
      </span>
      <h1 className="mt-7 text-[30px] font-extrabold tracking-tight text-navy-950">
        Report submitted successfully
      </h1>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-slate-500">
        Your civic report has been submitted. Keep the Report ID below as your reference —
        save it somewhere safe.
      </p>

      {emergency?.isEmergency && (
        <div className="mx-auto mt-6 max-w-md rounded-2xl border-2 border-red-200 bg-red-50 px-5 py-3.5 text-[13.5px] text-red-800">
          Your report was flagged as an emergency and prioritized. If the danger is happening
          right now, also call <strong>112</strong>.
        </div>
      )}

      <div className="mx-auto mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-card">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-navy-950 px-5 py-4">
          <ReceiptText size={20} className="text-sky-300" aria-hidden />
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Report ID
            </p>
            <p className="font-mono text-[19px] font-bold tracking-wide text-white">
              {report.reportId}
            </p>
          </div>
          <span className="ml-auto rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-sky-200">
            {formatReportTime(report.createdAt)}
          </span>
        </div>
        <div className="px-5 py-3">
          <Field k="Issue" v={report.issue} />
          <Field k="Category" v={report.category} />
          <Field k="Department" v={report.department} />
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
            <span className="text-[11.5px] font-bold uppercase tracking-wide text-slate-400">Priority</span>
            <Badge tone={pStyle.tone} dot={pStyle.dot} uppercase>
              {report.priority}
              {Number.isFinite(report.priorityScore) ? ` · ${report.priorityScore}/100` : ''}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <span className="text-[11.5px] font-bold uppercase tracking-wide text-slate-400">Verification</span>
            <Badge tone={vMeta.tone || 'slate'} uppercase>
              {vMeta.label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-9 flex max-w-md flex-col gap-3 sm:flex-row">
        <Link href="/report" className="btn btn-blue flex-1 py-3">
          <PlusCircle size={17} aria-hidden />
          Report another issue
        </Link>
        <Link href="/" className="btn btn-outline flex-1 py-3">
          <Home size={17} aria-hidden />
          Return home
        </Link>
      </div>
      <p className="mt-5 text-[12.5px] text-slate-400">
        Your report is now with the responsible department conceptually. This demo does not
        include complaint tracking — you may report again anytime.
      </p>
    </div>
  );
}
