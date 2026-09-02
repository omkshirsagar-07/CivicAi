import { useState } from 'react'
import { complaintColor } from '../common/meta'
import { PRIORITY_LEGEND } from '../../constants'

// Stylised city map (front-end mock). Marker x/y are percentages on the map.
// Swap for Leaflet/Google Maps later — the complaint data contract is unchanged.
export default function MapPanel({ complaints = [], selectedId, onSelect, height = 'h-[420px]', showLegend = true }) {
  const [hover, setHover] = useState(null)

  return (
    <div className={`relative w-full overflow-hidden rounded-xl border border-slate-200 bg-[#eef3f9] ${height}`}>
      <svg viewBox="0 0 100 70" preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="img" aria-label="Civic issues map of the city">
        {/* land blocks */}
        <rect width="100" height="70" fill="#edf2f9" />
        <rect x="6" y="6" width="20" height="16" rx="1.5" fill="#e2eaf4" />
        <rect x="30" y="8" width="16" height="12" rx="1.5" fill="#e6edf6" />
        <rect x="70" y="6" width="24" height="14" rx="1.5" fill="#e2eaf4" />
        <rect x="8" y="48" width="22" height="16" rx="1.5" fill="#e5ecf5" />
        <rect x="72" y="46" width="20" height="18" rx="1.5" fill="#e2eaf4" />
        <rect x="34" y="52" width="26" height="12" rx="1.5" fill="#e7eef7" />

        {/* river */}
        <path d="M-2 62 C 18 56, 30 66, 48 60 S 78 52, 102 58 L102 74 L-2 74 Z" fill="#c9dff3" />

        {/* main roads */}
        <line x1="-4" y1="30" x2="104" y2="26" stroke="#ffffff" strokeWidth="3.4" />
        <line x1="-4" y1="30" x2="104" y2="26" stroke="#c9d6e6" strokeWidth="0.5" strokeDasharray="2 2" />
        <line x1="20" y1="-4" x2="26" y2="74" stroke="#ffffff" strokeWidth="3" />
        <line x1="58" y1="-4" x2="64" y2="74" stroke="#ffffff" strokeWidth="2.6" />
        <line x1="-4" y1="48" x2="104" y2="44" stroke="#ffffff" strokeWidth="2.6" />
        <line x1="80" y1="-4" x2="86" y2="74" stroke="#ffffff" strokeWidth="2.4" />
        <line x1="-4" y1="12" x2="104" y2="16" stroke="#f7fafd" strokeWidth="1.8" />

        {/* area labels */}
        <text x="12" y="38" fontSize="2.6" fill="#94a7c0" fontWeight="700">CIDCO</text>
        <text x="44" y="22" fontSize="2.6" fill="#94a7c0" fontWeight="700">JALNA ROAD</text>
        <text x="38" y="42" fontSize="2.6" fill="#94a7c0" fontWeight="700">CITY CHOWK</text>
        <text x="70" y="60" fontSize="2.6" fill="#94a7c0" fontWeight="700">GARKHEDA</text>

        {/* markers */}
        {complaints.map((c) => {
          const color = complaintColor(c)
          const active = c.id === selectedId || c.id === hover
          const cx = c.location.x
          const cy = c.location.y
          return (
            <g
              key={c.id}
              transform={`translate(${cx} ${cy})`}
              className="cursor-pointer"
              onMouseEnter={() => setHover(c.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect?.(c)}
              role="button"
              aria-label={`${c.title} — ${c.status}`}
            >
              {(c.emergency || c.severity === 'Critical') && c.status !== 'Resolved' && (
                <circle r="2.4" fill={color} opacity="0.25" className="marker-ping" />
              )}
              <circle r={active ? 3.1 : 2.3} fill={color} stroke="#fff" strokeWidth="0.7" />
              {active && (
                <g>
                  <rect x="3" y="-7" width={Math.min(46, 8 + c.title.length * 1.15)} height="9" rx="1.6" fill="#0a1830" opacity="0.92" />
                  <text x="5" y="-1" fontSize="2.6" fill="#fff" fontWeight="600">
                    {c.title.length > 34 ? `${c.title.slice(0, 34)}…` : c.title}
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </svg>

      {showLegend && (
        <div className="absolute left-3 top-3 rounded-lg border border-slate-200 bg-white/95 px-3 py-2.5 shadow-card backdrop-blur">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Legend</p>
          <ul className="space-y-1">
            {PRIORITY_LEGEND.map((l) => (
              <li key={l.key} className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                {l.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="absolute bottom-3 right-3 chip bg-white/95 text-slate-500 shadow-card">
        {complaints.length} active reports
      </div>
    </div>
  )
}
