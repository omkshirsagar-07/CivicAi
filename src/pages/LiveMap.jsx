import { useMemo, useState } from 'react'
import { Map as MapIcon, List } from 'lucide-react'
import Badge from '../components/common/Badge'
import MapPanel from '../components/civic/MapPanel'
import ComplaintCard from '../components/civic/ComplaintCard'
import Button from '../components/common/Button'
import { PRIORITY_LEGEND } from '../constants'
import { useApp } from '../context/AppContext'

const FILTERS = [
  { key: 'all', label: 'All Issues' },
  { key: 'emergency', label: 'Emergency' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
  { key: 'resolved', label: 'Resolved' },
]

function matches(c, key) {
  switch (key) {
    case 'emergency':
      return c.emergency && c.status !== 'Resolved'
    case 'high':
      return c.severity === 'High' && !c.emergency
    case 'medium':
      return c.severity === 'Medium'
    case 'low':
      return c.severity === 'Low' && c.status !== 'Resolved'
    case 'resolved':
      return c.status === 'Resolved'
    default:
      return true
  }
}

export default function LiveMap() {
  const { complaints, navigate } = useApp()
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const visible = useMemo(() => complaints.filter((c) => matches(c, filter)), [complaints, filter])
  const emergencyCount = complaints.filter((c) => c.emergency && c.status !== 'Resolved').length

  return (
    <div className="bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl">
                <MapIcon size={26} className="text-blue-600" /> Live Civic Map
              </h1>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                Real-time view of reported civic issues across the city — coloured by priority and response status.
              </p>
            </div>
            <Button to="/report" size="md">Report an Issue</Button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  filter === f.key
                    ? f.key === 'emergency'
                      ? 'bg-red-600 text-white'
                      : 'bg-navy-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
                {f.key === 'emergency' && emergencyCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-white/20 px-1.5 text-[10px]">{emergencyCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-content gap-6 px-4 py-6 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="lg:col-span-2">
          <div className="card p-3">
            <MapPanel complaints={visible} selectedId={selected} onSelect={(c) => setSelected(c.id)} height="h-[520px]" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
            {PRIORITY_LEGEND.map((l) => (
              <span key={l.key} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="card">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
              <h2 className="flex items-center gap-2 font-bold text-navy-900">
                <List size={17} className="text-blue-600" /> Issues ({visible.length})
              </h2>
              <Badge tone="blue" dot>Live</Badge>
            </div>
            <div className="max-h-[560px] space-y-3 overflow-y-auto p-4">
              {visible.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-400">No issues match this filter.</p>
              ) : (
                visible
                  .slice()
                  .sort((a, b) => b.priority - a.priority)
                  .map((c) => (
                    <ComplaintCard
                      key={c.id}
                      complaint={c}
                      active={selected === c.id}
                      onClick={() => {
                        setSelected(c.id)
                        navigate(`/admin/complaints/${c.id}`)
                      }}
                    />
                  ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
