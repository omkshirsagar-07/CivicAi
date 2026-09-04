import { Flame, PhoneCall, Siren, Ambulance, ShieldAlert } from 'lucide-react';

export default function EmergencySection() {
  return (
    <section className="border-y border-slate-100 bg-white py-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <p className="text-[12.5px] font-bold uppercase tracking-[0.18em] text-civic-blue">
            Emergency awareness
          </p>
          <h2 className="mt-3 text-balance text-[30px] font-extrabold tracking-tight text-navy-950 sm:text-[36px]">
            Critical problems need immediate attention
          </h2>
          <p className="mt-4 max-w-lg text-[15.5px] leading-relaxed text-slate-600">
            CivicAI&apos;s AI can spot danger words like <em>fire</em>, <em>leak</em> or{' '}
            <em>collapse</em> and instantly flag a report as an emergency — showing the
            response units that should be involved.
          </p>
          <ul className="mt-6 space-y-3 text-[14.5px] text-slate-600">
            {[
              'AI flags active danger to life or property in seconds',
              'Shows recommended units — Fire, Police, Ambulance',
              'Emergency reports are prioritized above routine issues',
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
            <p className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-amber-900">
              <PhoneCall size={17} className="mt-0.5 shrink-0 text-amber-700" aria-hidden />
              <span>
                <span className="font-bold">In a real emergency, always call first.</span>{' '}
                CivicAI is an AI-assisted reporting system — it does not automatically contact
                emergency services. Dial your local emergency number (e.g. 112 in India)
                immediately when lives are at risk.
              </span>
            </p>
          </div>
        </div>

        {/* Emergency detection preview */}
        <div className="relative">
          <div className="absolute -left-4 -top-4 hidden rotate-[-3deg] rounded-lg border border-red-100 bg-red-50 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-widest text-red-600 sm:block">
            Demo AI output
          </div>
          <div className="overflow-hidden rounded-2xl border-2 border-red-200 shadow-soft">
            <div className="bg-red-600 px-5 py-4">
              <p className="flex items-center gap-2.5 text-[15px] font-bold text-white">
                <span className="relative flex h-6 w-6">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/40" />
                  <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-white/25">
                    <Siren size={14} className="text-white" aria-hidden />
                  </span>
                </span>
                Emergency detected
              </p>
            </div>
            <div className="space-y-4 bg-white p-6">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-wider text-red-500">
                  Fire reported near Central Market
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                  <Flame size={16} className="text-red-600" aria-hidden />
                  Severity: <span className="font-bold uppercase tracking-wide text-red-600">Critical</span>
                </p>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wider text-slate-400">
                  <ShieldAlert size={14} aria-hidden /> Recommended response
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    { label: 'Fire Department', Icon: Flame },
                    { label: 'Ambulance', Icon: Ambulance },
                    { label: 'Police', Icon: ShieldAlert },
                  ].map(({ label, Icon }) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50/70 px-3 py-1.5 text-[12.5px] font-semibold text-red-700"
                    >
                      <Icon size={13} aria-hidden />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-[12px] leading-relaxed text-slate-400">
                Sample detection shown for demonstration. Real emergency detection is powered by
                the Gemini model on the live /report flow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
