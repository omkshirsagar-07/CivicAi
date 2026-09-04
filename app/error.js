'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, Home } from 'lucide-react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('[CivicAI]', error);
  }, [error]);

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-20 text-center">
      <span className="text-5xl" aria-hidden>⚠️</span>
      <h1 className="mt-6 text-2xl font-bold text-navy-950">Something went wrong</h1>
      <p className="mt-2 text-sm text-slate-500">
        An unexpected error interrupted the page. Please try again — your in-progress
        report draft, if any, has been preserved in this browser.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => reset()} className="btn btn-primary">
          <RotateCcw size={16} aria-hidden />
          Try again
        </button>
        <Link href="/" className="btn btn-outline">
          <Home size={16} aria-hidden />
          Return home
        </Link>
      </div>
    </section>
  );
}
