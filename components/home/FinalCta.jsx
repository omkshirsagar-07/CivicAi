import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { CivicLogoMark } from '@/components/common/Brand';

export default function FinalCta() {
  return (
    <section className="py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-navy-950 px-6 py-16 text-center sm:px-16 lg:py-20">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            aria-hidden
            style={{
              backgroundImage:
                'linear-gradient(rgba(148,190,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(148,190,255,0.6) 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          />
          <div
            className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl"
            aria-hidden
          />
          <div className="pointer-events-none absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" aria-hidden />

          <div className="relative">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <CivicLogoMark size={30} />
            </span>
            <h2 className="mx-auto mt-6 max-w-2xl text-balance text-[30px] font-extrabold tracking-tight text-white sm:text-[40px]">
              Your voice can improve your city.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15.5px] leading-relaxed text-slate-400">
              Report a civic problem and help create faster, smarter responses. It takes less
              than two minutes.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
              <Link href="/report" className="btn btn-blue !rounded-xl px-7 py-3.5 text-[15px]">
                Report an Issue
                <ArrowRight size={18} aria-hidden />
              </Link>
              <Link href="/about" className="btn border border-white/20 bg-white/5 px-7 py-3.5 text-[15px] text-white hover:bg-white/10">
                Learn about CivicAI
              </Link>
            </div>
            <p className="mt-8 flex items-center justify-center gap-2 text-[13px] text-slate-500">
              <ShieldCheck size={15} className="text-sky-400" aria-hidden />
              Login only needed at final submission · your draft is preserved
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
