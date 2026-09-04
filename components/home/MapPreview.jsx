import Link from 'next/link';
import { ArrowRight, ExternalLink, MapPin } from 'lucide-react';
import MiniMap from './MiniMap';

const legend = [
  { color: 'red', label: 'Emergency' },
  { color: 'orange', label: 'High priority' },
  { color: 'amber', label: 'Medium priority' },
  { color: 'sky', label: 'Low priority' },
];

const dotClasses = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  amber: 'bg-amber-500',
  sky: 'bg-sky-500',
};

export default function MapPreview() {
  return (
    <section className="bg-slate-50/60 py-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:px-8">
        <div>
          <p className="text-[12.5px] font-bold uppercase tracking-[0.18em] text-civic-blue">
            Location intelligence
          </p>
          <h2 className="mt-3 text-balance text-[30px] font-extrabold tracking-tight text-navy-950 sm:text-[36px]">
            See civic issues around you
          </h2>
          <p className="mt-4 max-w-lg text-[15.5px] leading-relaxed text-slate-600">
            The public civic map surfaces verified reports by priority. Click any marker for the
            issue, category and approximate area — private citizen details are never shown.
          </p>
          <ul className="mt-7 flex flex-wrap gap-3">
            {legend.map((l) => (
              <li
                key={l.color}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-medium text-slate-600 shadow-card"
              >
                <span className={`h-2.5 w-2.5 rounded-full ${dotClasses[l.color]}`} aria-hidden />
                {l.label}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link href="/map" className="btn btn-blue !rounded-xl px-6 py-3.5 text-[15px]">
              Open Live Civic Map
              <ArrowRight size={18} aria-hidden />
            </Link>
            <p className="mt-3 text-[12.5px] text-slate-400">
              Live map opens with demo markers when no real reports exist yet.
            </p>
          </div>
        </div>

        <div className="relative h-[380px] overflow-hidden rounded-2xl border border-slate-200 shadow-card lg:h-[460px]">
          <MiniMap
            className="absolute inset-0"
            markers={[
              { x: 150, y: 90, color: 'amber' },
              { x: 250, y: 150, color: 'sky' },
              { x: 96, y: 200, color: 'orange' },
              { x: 300, y: 250, color: 'red' },
              { x: 205, y: 132, color: 'sky' },
              { x: 120, y: 120, color: 'amber' },
            ]}
            label="Live civic map preview"
          />
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="relative flex h-16 w-16">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400/30" />
                <span className="relative m-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-card">
                  <MapPin size={22} className="text-blue-700" />
                </span>
              </span>
            </div>
          </div>
          <Link
            href="/map"
            className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-xl border border-white/70 bg-white/95 px-4 py-2.5 text-[13px] font-bold text-navy-900 shadow-card backdrop-blur transition-colors hover:bg-white"
          >
            <ExternalLink size={15} aria-hidden />
            View live map
          </Link>
        </div>
      </div>
    </section>
  );
}
