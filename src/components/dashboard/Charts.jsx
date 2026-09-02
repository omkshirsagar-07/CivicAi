import { useMemo } from 'react'

// --- Horizontal bar chart: complaints by department -----------------------
export function DepartmentBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <ul className="space-y-3.5">
      {data.map((d) => (
        <li key={d.label}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600">{d.label}</span>
            <span className="font-bold tabular-nums text-navy-900">{d.value}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(d.value / max) * 100}%`, backgroundColor: d.color }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

// --- Donut chart: priority distribution -----------------------------------
export function PriorityDonut({ data }) {
  const total = data.reduce((a, d) => a + d.value, 0)
  const radius = 42
  const circ = 2 * Math.PI * radius
  let offset = 0

  const segments = useMemo(() => {
    let acc = 0
    return data.map((d) => {
      const frac = d.value / total
      const seg = { ...d, dash: frac * circ, gap: circ - frac * circ, offset: -acc * circ }
      acc += frac
      return seg
    })
  }, [data, total, circ])

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <svg viewBox="0 0 110 110" className="h-40 w-40 -rotate-90">
        <circle cx="55" cy="55" r={radius} fill="none" stroke="#eef2f7" strokeWidth="13" />
        {segments.map((s) => (
          <circle
            key={s.label}
            cx="55"
            cy="55"
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth="13"
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={s.offset}
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        ))}
        <g className="rotate-90" style={{ transformOrigin: 'center' }}>
          <text x="55" y="52" textAnchor="middle" className="fill-navy-900" fontSize="16" fontWeight="800" transform="rotate(90 55 55)">
            {total}
          </text>
          <text x="55" y="66" textAnchor="middle" className="fill-slate-400" fontSize="7.5" fontWeight="600" transform="rotate(90 55 55)">
            reports
          </text>
        </g>
      </svg>
      <ul className="w-full space-y-2">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2.5 text-sm">
            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: d.color }} />
            <span className="flex-1 text-slate-600">{d.label}</span>
            <span className="font-bold tabular-nums text-navy-900">{d.value}</span>
            <span className="w-10 text-right text-xs tabular-nums text-slate-400">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// --- Trend chart: weekly complaints (SVG area + line) ----------------------
export function TrendChart({ data }) {
  const W = 560
  const H = 180
  const P = 24
  const max = Math.max(...data.map((d) => d.value)) * 1.15
  const min = 0
  const x = (i) => P + (i * (W - P * 2)) / (data.length - 1)
  const y = (v) => H - P - ((v - min) / (max - min)) * (H - P * 2)
  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(d.value)}`).join(' ')
  const area = `${line} L${x(data.length - 1)},${H - P} L${x(0)},${H - P} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Weekly complaint trend">
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <line key={g} x1={P} x2={W - P} y1={H - P - g * (H - P * 2)} y2={H - P - g * (H - P * 2)} stroke="#eef2f7" strokeWidth="1.5" />
      ))}
      <path d={area} fill="url(#trendFill)" />
      <path d={line} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <g key={d.label}>
          <circle cx={x(i)} cy={y(d.value)} r="4" fill="#fff" stroke="#2563eb" strokeWidth="2.5" />
          <text x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fontWeight="600" fill="#94a3b8">{d.label}</text>
          <text x={x(i)} y={y(d.value) - 9} textAnchor="middle" fontSize="10" fontWeight="700" fill="#112544">{d.value}</text>
        </g>
      ))}
    </svg>
  )
}
