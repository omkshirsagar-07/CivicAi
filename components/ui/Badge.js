import { cn } from '@/utils/client';

const tones = {
  navy: 'bg-navy-50 text-navy-800 border-navy-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  sky: 'bg-sky-50 text-sky-700 border-sky-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
  white: 'bg-white text-navy-800 border-slate-200',
};

export default function Badge({ tone = 'slate', children, className, dot, uppercase }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        tones[tone],
        uppercase && 'uppercase tracking-wide',
        className
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dot)} aria-hidden />}
      {children}
    </span>
  );
}
