const TONES = {
  slate: 'bg-slate-100 text-slate-700',
  blue: 'bg-blue-100 text-blue-800',
  sky: 'bg-sky-100 text-sky-800',
  indigo: 'bg-indigo-100 text-indigo-800',
  navy: 'bg-navy-100 text-navy-800',
  red: 'bg-red-100 text-red-700',
  orange: 'bg-orange-100 text-orange-700',
  amber: 'bg-amber-100 text-amber-800',
  emerald: 'bg-emerald-100 text-emerald-700',
  white: 'bg-white/15 text-white',
}

const DOT_TONES = {
  slate: 'bg-slate-400',
  blue: 'bg-blue-500',
  sky: 'bg-sky-500',
  indigo: 'bg-indigo-500',
  navy: 'bg-navy-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  amber: 'bg-amber-500',
  emerald: 'bg-emerald-500',
  white: 'bg-white',
}

export default function Badge({ tone = 'slate', children, dot = false, className = '' }) {
  return (
    <span className={`chip ${TONES[tone] ?? TONES.slate} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${DOT_TONES[tone] ?? DOT_TONES.slate}`} aria-hidden />}
      {children}
    </span>
  )
}
