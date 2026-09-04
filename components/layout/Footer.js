import Link from 'next/link';
import Brand from '@/components/common/Brand';
import { Phone, ShieldCheck } from 'lucide-react';

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Report an Issue', href: '/report' },
      { label: 'Live Civic Map', href: '/map' },
      { label: 'How CivicAI Works', href: '/#how-it-works' },
      { label: 'About CivicAI', href: '/about' },
    ],
  },
  {
    title: 'Citizens',
    links: [
      { label: 'Create an Account', href: '/signup' },
      { label: 'Login', href: '/login' },
      { label: 'Forgot Password', href: '/forgot-password' },
      { label: 'Emergency Guidance', href: '/about#safety' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-navy-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2 lg:pr-12">
            <Brand subtitle={false} className="[&_span]:!text-white" />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
              CivicAI is an AI-powered civic reporting platform that helps citizens
              describe problems with text or voice, attach photographic evidence, and
              lets AI verify, prioritize and route the issue to the right department.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
              <span className="inline-flex items-center gap-2 text-slate-400">
                <ShieldCheck size={15} className="text-sky-400" aria-hidden />
                Your reports stay private &amp; secure
              </span>
              <span className="inline-flex items-center gap-2 text-slate-400">
                <Phone size={15} className="text-sky-400" aria-hidden />
                In emergencies, always call your local helpline
              </span>
            </div>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-slate-300 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-navy-800 pt-6 text-[12.5px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CivicAI · Demo build for civic technology demonstration.</p>
          <p>AI-assisted verification — final decisions rest with the responsible authority.</p>
        </div>
      </div>
    </footer>
  );
}
