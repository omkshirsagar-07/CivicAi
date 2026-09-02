import { TrendingUp, TrendingDown } from 'lucide-react'

const TONES = {
  blue: 'bg-blue-50 text-blue-600',
  navy: 'bg-navy-100 text-navy-700',
  red: 'bg-red-50 text-red-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
}

export default function KpiCard({ icon: Icon, label, value, delta, deltaUp = true, tone = 'blue', hint }) {
  return (
    <div className="card p-5 transition-shadow hover:shadow-pop">
      <div className="flex items-start justify-between">
        <span className={`grid h-11 w-11 place-items-center rounded-xl ${TONES[tone]}`}>
          <Icon size={20} />
        </span>
        {delta && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${
              deltaUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {deltaUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {delta}
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-extrabold tabular-nums tracking-tight text-navy-900">{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}
