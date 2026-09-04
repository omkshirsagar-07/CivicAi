import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Landmark,
  MapPin,
  Mic,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import MiniMap from './MiniMap';
import { CivicLogoMark } from '@/components/common/Brand';

function AiAnalysisCard() {
  return (
    <div className="card overflow-hidden !p-0 shadow-soft">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-civic-blue">
            <Bot size={15} aria-hidden />
          </span>
          AI Analysis
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-emerald-700">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-500" />
          Live
        </span>
      </div>
      <dl className="space-y-3.5 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Issue</dt>
          <dd className="text-right text-[13px] font-semibold text-slate-900">
            Water Pipeline Leakage
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Category</dt>
          <dd className="text-right text-[13px] font-semibold text-slate-900">Water Supply</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Priority</dt>
          <dd>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-orange-700">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              High
            </span>
          </dd>
        </div>
        <div>
          <div className="flex items-center justify-between text-[12.5px]">
            <dt className="font-bold uppercase tracking-[0.1em] text-slate-400 text-[11px]">Severity</dt>
            <dd className="font-semibold text-slate-700">8 / 10</dd>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-[80%] rounded-full bg-gradient-to-r from-sky-500 to-blue-600" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-[12.5px]">
            <dt className="font-bold uppercase tracking-[0.1em] text-slate-400 text-[11px]">Confidence</dt>
            <dd className="font-semibold text-slate-700">94%</dd>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-[94%] rounded-full bg-emerald-500" />
          </div>
        </div>
      </dl>
      <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
        <p className="flex items-center gap-1.5 text-[12px] text-slate-500">
          <Landmark size={13} className="text-civic-blue" aria-hidden />
          Routed to: <span className="font-semibold text-slate-700">Water Supply Department</span>
        </p>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 10%, rgba(37,99,235,0.07), transparent 32%), radial-gradient(circle at 85% 30%, rgba(14,165,233,0.06), transparent 34%)',
        }}
      />
      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1fr_1.02fr] lg:items-center lg:gap-10 lg:px-8 lg:pb-24 lg:pt-20">
        {/* Copy */}
        <div className="animate-fade-in-up">
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/70 px-3.5 py-1.5 text-[12.5px] font-semibold text-blue-700">
            <Sparkles size={14} aria-hidden />
            AI-powered civic reporting for Indian cities
          </p>
          <h1 className="mt-6 text-balance text-[38px] font-extrabold leading-[1.06] tracking-tight text-navy-950 sm:text-[48px] lg:text-[54px]">
            Smarter Cities. <br className="hidden sm:block" />
            Faster Response. <span className="text-civic-blue">Better Communities.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[16.5px] leading-relaxed text-slate-600">
            Report civic problems using voice, text, images and location. CivicAI uses
            artificial intelligence to understand, verify, prioritize and route civic
            complaints — with evidence you can trust.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Link href="/report" className="btn btn-primary !rounded-xl px-6 py-3.5 text-[15px]">
              Report an Issue
              <ArrowRight size={18} aria-hidden />
            </Link>
            <Link
              href="/#how-it-works"
              className="btn btn-outline !rounded-xl border-slate-300 px-6 py-3.5 text-[15px]"
            >
              Explore CivicAI
            </Link>
          </div>

          {/* capability chips */}
          <ul className="mt-8 flex flex-wrap gap-2.5">
            {[
              { Icon: Mic, label: 'Voice · EN / हिं / मरा' },
              { Icon: MapPin, label: 'Live location & map' },
              { Icon: ShieldCheck, label: 'Evidence verification' },
              { Icon: BadgeCheck, label: 'Secure report ID' },
            ].map(({ Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-600 shadow-card"
              >
                <Icon size={15} className="text-civic-blue" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Product preview */}
        <div className="relative animate-fade-in-up" style={{ animationDelay: '120ms' }}>
          <div className="absolute -right-6 -top-6 hidden rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-500 shadow-card lg:block">
            Interactive sample preview
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_290px] sm:items-start">
            <div className="relative h-[340px] overflow-hidden rounded-2xl border border-slate-200 shadow-card sm:h-[430px]">
              <MiniMap
                className="absolute inset-0"
                markers={[
                  { x: 128, y: 120, color: 'amber' },
                  { x: 250, y: 96, color: 'sky' },
                  { x: 318, y: 210, color: 'orange' },
                ]}
                highlight={{ x: 196, y: 178 }}
                label="Sample civic map showing a water leakage report"
              />
              {/* overlay chips */}
              <div className="absolute left-3 top-3 flex flex-col gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-[12px] font-semibold text-slate-800 shadow-sm">
                  <MapPin size={13} className="text-blue-700" />
                  Near main bus stand
                </span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/70 bg-white/95 px-3.5 py-2.5 shadow-sm backdrop-blur">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-700" /> Selected location confirmed
                  </span>
                  <span>19.8762° N, 75.3433° E</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <AiAnalysisCard />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2.5">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                    <ShieldCheck size={13} aria-hidden /> Verified
                  </p>
                  <p className="mt-1 text-[11.5px] text-emerald-800">Text ↔ photo match 94%</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    <CivicLogoMark size={14} /> Emergency
                  </p>
                  <p className="mt-1 text-[11.5px] text-slate-600">Not detected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
