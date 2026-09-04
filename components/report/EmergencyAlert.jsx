import { PhoneCall, Siren } from 'lucide-react';

/**
 * Red, urgency-first banner shown when the AI flags an emergency.
 * Includes an explicit call-your-helpline note — CivicAI never claims to
 * contact services itself.
 */
export default function EmergencyAlert({ emergency }) {
  const headline = emergency?.headline || `${emergency?.type || 'Emergency'} reported — immediate attention recommended`;
  const units = emergency?.recommendedResponses || ['Fire Department', 'Police', 'Ambulance'];

  return (
    <div role="alert" className="overflow-hidden rounded-2xl border-2 border-red-300">
      <div className="flex items-center gap-2.5 bg-red-600 px-4 py-2.5">
        <span className="relative flex h-5 w-5" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/40" />
          <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-white/25">
            <Siren size={13} className="text-white" />
          </span>
        </span>
        <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-white">
          Emergency detected
        </p>
      </div>
      <div className="border-t border-red-100 bg-white p-4">
        <p className="text-[15px] font-bold text-navy-950">{headline}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {units.map((unit) => (
            <span
              key={unit}
              className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[12.5px] font-semibold text-red-700"
            >
              {unit}
            </span>
          ))}
        </div>
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-red-50/70 px-3 py-2 text-[12.5px] leading-relaxed text-red-800">
          <PhoneCall size={14} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            If this is happening right now, <strong>call 112</strong> (or your local emergency
            number) immediately. CivicAI routes this report for attention but does not contact
            services automatically.
          </span>
        </p>
      </div>
    </div>
  );
}
