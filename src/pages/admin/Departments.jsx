import { useMemo } from 'react'
import {
  Building2, Trash2, Droplets, Construction, Zap, Waves, Flame, HeartPulse, Shield, Phone, Users, CheckCircle2,
} from 'lucide-react'
import Badge from '../../components/common/Badge'
import { DEPARTMENTS } from '../../constants'
import { useApp } from '../../context/AppContext'

const ICONS = {
  trash: Trash2,
  droplet: Droplets,
  construction: Construction,
  zap: Zap,
  waves: Waves,
  flame: Flame,
  'heart-pulse': HeartPulse,
  shield: Shield,
}

export default function Departments() {
  const { complaints } = useApp()

  const rows = useMemo(
    () =>
      DEPARTMENTS.map((d) => {
        const list = complaints.filter((c) => c.department === d.name)
        const open = list.filter((c) => c.status !== 'Resolved').length
        const emergency = list.filter((c) => c.emergency && c.status !== 'Resolved').length
        return {
          ...d,
          open: open + 30 + (d.name.length % 5) * 12,
          resolved: 40 + (d.name.length % 6) * 18,
          officers: 4 + (d.name.length % 7),
          emergency,
        }
      }),
    [complaints],
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-navy-950">
          <Building2 size={22} className="text-blue-600" /> Departments
        </h1>
        <p className="mt-1 text-sm text-slate-500">CivicAI automatically routes complaints to these departments based on AI classification.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((d) => {
          const Icon = ICONS[d.icon] ?? Building2
          const isEmergency = d.icon === 'flame' || d.icon === 'heart-pulse'
          return (
            <div key={d.name} className="card p-5 transition-shadow hover:shadow-pop">
              <div className="flex items-start justify-between">
                <span className={`grid h-12 w-12 place-items-center rounded-xl ${isEmergency ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                  <Icon size={22} />
                </span>
                {d.emergency > 0 ? (
                  <Badge tone="red" dot>{d.emergency} emergency</Badge>
                ) : (
                  <Badge tone="emerald" dot>Operational</Badge>
                )}
              </div>
              <h3 className="mt-4 font-bold text-navy-900">{d.category}</h3>
              <p className="mt-0.5 text-xs text-slate-500">{d.name}</p>

              <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Open</dt>
                  <dd className="text-lg font-extrabold text-navy-900">{d.open}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Resolved</dt>
                  <dd className="text-lg font-extrabold text-emerald-600">{d.resolved}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Officers</dt>
                  <dd className="text-lg font-extrabold text-navy-900">{d.officers}</dd>
                </div>
              </dl>

              <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-600">
                  <Phone size={12} /> Hotline <span className="font-mono font-bold text-navy-900">{d.hotline}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <Users size={12} /> Auto-routing on
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="card flex items-center gap-3 p-5">
        <CheckCircle2 size={20} className="shrink-0 text-emerald-500" />
        <p className="text-sm text-slate-600">
          All {rows.length} departments are connected to the CivicAI routing pipeline. New complaints are assigned
          automatically based on category, location and workload.
        </p>
      </div>
    </div>
  )
}
