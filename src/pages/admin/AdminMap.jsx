import { useState } from 'react'
import { Map as MapIcon, List } from 'lucide-react'
import Badge from '../../components/common/Badge'
import MapPanel from '../../components/civic/MapPanel'
import ComplaintCard from '../../components/civic/ComplaintCard'
import { useApp } from '../../context/AppContext'

export default function AdminMap() {
  const { complaints, navigate } = useApp()
  const [selected, setSelected] = useState(null)
  const sorted = complaints.slice().sort((a, b) => b.priority - a.priority)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-navy-950">
          <MapIcon size={22} className="text-blue-600" /> Live Operations Map
        </h1>
        <p className="mt-1 text-sm text-slate-500">City-wide view of every active report. Click a marker or card to open the complaint.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="card p-3 xl:col-span-2">
          <MapPanel
            complaints={complaints}
            selectedId={selected}
            onSelect={(c) => setSelected(c.id)}
            height="h-[560px]"
          />
        </div>
        <div className="card">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
            <h2 className="flex items-center gap-2 font-bold text-navy-900">
              <List size={17} className="text-blue-600" /> Incident Queue
            </h2>
            <Badge tone="blue" dot>Live</Badge>
          </div>
          <div className="max-h-[560px] space-y-3 overflow-y-auto p-4">
            {sorted.map((c) => (
              <ComplaintCard
                key={c.id}
                complaint={c}
                active={selected === c.id}
                onClick={() => {
                  setSelected(c.id)
                  navigate(`/admin/complaints/${c.id}`)
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
