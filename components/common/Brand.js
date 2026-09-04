import Link from 'next/link';
import { cn } from '@/utils/client';

/** CivicAI wordmark with an inline-SVG emblem (no external assets). */
export function CivicLogoMark({ size = 38, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden
      role="img"
    >
      <rect width="40" height="40" rx="11" fill="#0c1f45" />
      {/* location pin */}
      <path
        d="M20 28.5c3.9-4.7 6-7.8 6-10.3a6 6 0 1 0-12 0c0 2.5 2.1 5.6 6 10.3Z"
        fill="#0ea5e9"
      />
      <circle cx="20" cy="18.2" r="2.1" fill="#fff" />
      {/* AI spark */}
      <circle cx="29.5" cy="8.5" r="2.5" fill="#7dd3fc" />
      <path d="M29.5 3.5v1.4M33.1 5.6l-1 .9M29.5 13.5v-1.4M25.9 11.6l1-.9" stroke="#7dd3fc" strokeWidth="1.1" strokeLinecap="round" opacity="0.85" />
      <circle cx="29.5" cy="8.5" r="5.4" stroke="#7dd3fc" strokeOpacity="0.4" />
    </svg>
  );
}

export default function Brand({ className, link = true, subtitle = true, onClick }) {
  const inner = (
    <span className={cn('flex items-center gap-2.5', className)}>
      <CivicLogoMark size={38} />
      <span className="flex flex-col leading-none">
        <span className="text-[20px] font-extrabold tracking-tight text-navy-950">
          Civic<span className="text-civic-blue">AI</span>
        </span>
        {subtitle && (
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Smart Civic Response
          </span>
        )}
      </span>
    </span>
  );

  if (!link) return inner;
  return (
    <Link href="/" onClick={onClick} aria-label="CivicAI — home" className="shrink-0">
      {inner}
    </Link>
  );
}
