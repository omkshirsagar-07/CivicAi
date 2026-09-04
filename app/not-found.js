import Link from 'next/link';
import { Home, MapPinPlus } from 'lucide-react';
import { CivicLogoMark } from '@/components/common/Brand';

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-20 text-center">
      <div className="relative">
        <CivicLogoMark size={72} />
        <span className="absolute -right-5 -top-4 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-500 shadow-sm">
          404
        </span>
      </div>
      <h1 className="mt-8 text-2xl font-bold text-navy-950">This page does not exist</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        The address you followed may be outdated, or the page may have moved.
        Head back home or report a civic issue instead.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">
          <Home size={16} aria-hidden />
          Back to home
        </Link>
        <Link href="/report" className="btn btn-outline">
          <MapPinPlus size={16} aria-hidden />
          Report an issue
        </Link>
      </div>
    </section>
  );
}
