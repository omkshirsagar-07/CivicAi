'use client';

import { PencilLine, FileText, Bot, Camera, ShieldCheck, MapPin, Flame } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { cn, PRIORITY_STYLE, VERIFICATION_META, displayCoordinates } from '@/utils/client';

function Section({ icon: Icon, title, onEdit, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/50 px-4 py-2.5">
        <h4 className="flex items-center gap-2 text-[13.5px] font-bold text-slate-800">
          <Icon size={15} className="text-civic-blue" aria-hidden />
          {title}
        </h4>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] font-semibold text-civic-blue hover:bg-blue-50"
          >
            <PencilLine size={12} aria-hidden /> Edit
          </button>
        )}
      </div>
      <div className="px-4 py-3.5">{children}</div>
    </section>
  );
}

function KV({ k, v, strong }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <span className="shrink-0 text-[11.5px] font-bold uppercase tracking-wide text-slate-400">{k}</span>
      <span className={cn('text-right text-[13.5px]', strong ? 'font-semibold text-slate-900' : 'text-slate-700')}>
        {v || '—'}
      </span>
    </div>
  );
}

export default function ReviewPanel({ draft, onJump }) {
  const { complaint, analysis, priority, emergency, image, imageAnalysis, verification, location, duplicates } = draft;
  const pStyle = PRIORITY_STYLE[priority?.label] || PRIORITY_STYLE.Low;
  const vMeta = VERIFICATION_META[verification?.verificationStatus] || VERIFICATION_META.UNVERIFIABLE;
  const isEmergency = Boolean(emergency?.isEmergency);

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Emergency strip */}
      {isEmergency && (
        <div className="flex items-center gap-3 rounded-2xl border-2 border-red-300 bg-red-50 px-4 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white">
            <Flame size={18} aria-hidden />
          </span>
          <div>
            <p className="text-[13px] font-bold uppercase tracking-wide text-red-700">Emergency report</p>
            <p className="text-[12.5px] text-red-800">
              {emergency.type} · call 112 if this is happening right now
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Section icon={FileText} title="Complaint" onEdit={() => onJump(1)}>
          <p className="text-[14px] leading-relaxed text-slate-700">{complaint}</p>
        </Section>

        <Section icon={Bot} title="AI classification" onEdit={() => onJump(2)}>
          <div className="divide-y divide-slate-50">
            <KV k="Issue" v={analysis?.issue} strong />
            <KV k="Category" v={analysis?.category} />
            <KV k="Department" v={analysis?.department} />
            <KV k="Severity" v={`${analysis?.severity}/10`} />
            <KV k="Confidence" v={`${Math.round((analysis?.confidence || 0) * 100)}%`} />
          </div>
        </Section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section icon={Camera} title="Photographic evidence" onEdit={() => onJump(3)}>
          <div className="flex items-start gap-3">
            {image ? (
              <img
                src={`/api/images/${image.fileId}`}
                alt="Evidence preview"
                className="h-20 w-24 rounded-xl border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-20 w-24 items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-300">
                <Camera size={22} aria-hidden />
              </div>
            )}
            <div className="min-w-0">
              {imageAnalysis?.isCivicIssue ? (
                <>
                  <p className="text-[13.5px] font-semibold text-slate-800">{imageAnalysis.detectedIssue}</p>
                  <p className="text-[12px] text-slate-400">
                    {imageAnalysis.category} · severity {imageAnalysis.severity}/10
                  </p>
                </>
              ) : imageAnalysis ? (
                <p className="text-[13px] text-red-600">{imageAnalysis.notCivicReason || 'No civic issue visible.'}</p>
              ) : (
                <p className="text-[13px] text-slate-400">No photo attached.</p>
              )}
            </div>
          </div>
        </Section>

        <Section icon={ShieldCheck} title="AI verification" onEdit={() => onJump(4)}>
          <div className="flex items-center justify-between">
            <div>
              <Badge tone={vMeta.tone || 'slate'} uppercase>
                {vMeta.label}
              </Badge>
              <p className="mt-2 text-[12.5px] text-slate-400">Match score</p>
              <p className="text-[20px] font-extrabold text-slate-900">{verification?.matchScore ?? 0}%</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Priority</p>
              <Badge tone={pStyle.tone || 'slate'} dot={pStyle.dot} uppercase className="mt-1">
                {priority?.label || '—'}
              </Badge>
              <p className="mt-2 text-[12px] text-slate-400">
                Score <span className="font-bold text-slate-700">{priority?.score ?? '—'}/100</span>
              </p>
            </div>
          </div>
        </Section>
      </div>

      <Section icon={MapPin} title="Location" onEdit={() => onJump(5)}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[13.5px] font-semibold text-slate-800">
              {location?.address || location?.city || 'Location confirmed'}
            </p>
            <p className="text-[12.5px] text-slate-400">
              {displayCoordinates(location?.latitude, location?.longitude)}
              {location?.city ? ` · ${location.city}` : ''}
            </p>
          </div>
          {duplicates && (duplicates.count ?? 0) > 0 && (
            <Badge tone="amber" dot="bg-amber-500">
              {duplicates.count} similar nearby
            </Badge>
          )}
        </div>
      </Section>
    </div>
  );
}
