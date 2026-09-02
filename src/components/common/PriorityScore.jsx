import { useEffect, useState } from 'react'
import { priorityColor } from './meta'

// Animated circular priority gauge (SVG) with count-up score.
export default function PriorityScore({ score, size = 132, label = 'Priority Score' }) {
  const [display, setDisplay] = useState(0)
  const stroke = 10
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const color = priorityColor(score)

  useEffect(() => {
    let raf
    const start = performance.now()
    const duration = 1100
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(eased * score))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [score])

  return (
    <div className="flex flex-col items-center" role="img" aria-label={`${label} ${score} out of 100`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e8eef6" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - (c * display) / 100}
            style={{ transition: 'stroke-dashoffset 0.15s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold tabular-nums text-navy-900">
            {display}
            <span className="text-sm font-semibold text-slate-400">/100</span>
          </span>
        </div>
      </div>
      <span className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
    </div>
  )
}
