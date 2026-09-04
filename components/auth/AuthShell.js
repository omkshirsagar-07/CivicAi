import Brand from '@/components/common/Brand';
import { ShieldCheck, Sparkles, MapPin, ImagePlus } from 'lucide-react';

const bullets = [
  {
    Icon: Sparkles,
    title: 'AI understands your complaint',
    text: 'Gemini-powered classification, severity and routing.',
  },
  {
    Icon: ImagePlus,
    title: 'Photographic evidence',
    text: 'AI cross-checks your words against your photo.',
  },
  {
    Icon: MapPin,
    title: 'Location-aware',
    text: 'Automatic location or manual map selection.',
  },
];

/**
 * Split auth layout: navy brand panel (left) + form (right).
 * Renders as a compact header on small screens.
 */
export default function AuthShell({ children, heading, subheading }) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-68px)] max-w-6xl lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-navy-950 p-10 lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.13]"
          aria-hidden
          style={{
            backgroundImage:
              'linear-gradient(rgba(148,190,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,190,255,0.5) 1px, transparent 1px)',
            backgroundSize: '34px 34px',
          }}
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <Brand subtitle={false} className="[&_span]:!text-white" />
          <h1 className="mt-10 max-w-sm text-[28px] font-bold leading-tight text-white">
            Report civic problems that matter to your city.
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
            One secure account lets you submit verified civic reports with text,
            voice and photos — and get a unique reference for every issue.
          </p>
          <ul className="mt-9 space-y-5">
            {bullets.map(({ Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sky-300">
                  <Icon size={18} aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-[13px] text-slate-400">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative flex items-center gap-2 text-[12.5px] text-slate-500">
          <ShieldCheck size={15} className="text-sky-400" aria-hidden />
          Passwords are hashed. Sessions are secure. Your data stays private.
        </p>
      </aside>

      {/* Form panel */}
      <section className="flex flex-col justify-center bg-white px-5 py-12 sm:px-10 lg:px-14">
        <div className="mb-8 lg:hidden">
          <Brand />
        </div>
        <div className="mx-auto w-full max-w-md">
          <h2 className="text-[26px] font-bold tracking-tight text-navy-950">{heading}</h2>
          {subheading && <p className="mt-2 text-sm leading-relaxed text-slate-500">{subheading}</p>}
          <div className="mt-7">{children}</div>
        </div>
      </section>
    </div>
  );
}
