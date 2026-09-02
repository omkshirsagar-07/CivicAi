import { Siren, Flame, HeartPulse, ShieldAlert, MapPin, Clock, Users, Ambulance, CheckCircle2, Radio } from 'lucide-react'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import MapPanel from '../../components/civic/MapPanel'
import { timeAgo } from '../../utils/format'
import { useApp } from '../../context/AppContext'

const TEAM_ICON = {
  'Fire Department': Flame,
  Ambulance: Ambulance,
  Police: ShieldAlert,
}

const TYPE_ICON = {
  'Fire Emergency': Flame,
  'Medical Emergency': HeartPulse,
}

function EmergencyCard({ c, onResolve, onMap }) {
  const TypeIcon = TYPE_ICON[c.category] ?? Siren
  return (
    <article className="animate-fade-up overflow-hidden rounded-xl border-2 border-red-200 bg-white shadow-card">
      <div className="flex items-center gap-3 border-b border-red-100 bg-red-50/70 px-5 py-3.5">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-red-600 text-white">
          <TypeIcon size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] font-semibold text-red-600">{c.id}</p>
          <h3 className="truncate font-extrabold text-navy-950">{c.title}</h3>
        </div>
        <span className="chip bg-red-600 text-white pulse-ring hidden sm:inline-flex">
          <Radio size={12} /> LIVE
        </span>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin size={15} className="shrink-0 text-red-500" />
            <span className="truncate">{c.location.area}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Clock size={15} className="shrink-0 text-red-500" /> {timeAgo(c.createdAt)}
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Users size={15} className="shrink-0 text-red-500" /> ~{c.affected ?? 10} affected
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Response Teams</p>
          <div className="flex flex-wrap gap-2">
            {(c.teams ?? ['Fire Department', 'Ambulance', 'Police']).map((team) => {
              const Icon = TEAM_ICON[team] ?? Siren
              return (
                <span key={team} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-navy-900">
                  <Icon size={13} className="text-red-600" /> {team}
                  <span className="text-emerald-600">· ETA {team === 'Police' ? '3 min' : team === 'Fire Department' ? '4 min' : '6 min'}</span>
                </span>
              )
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
          <Badge tone="red" dot>Severity: Critical</Badge>
          <Badge tone="blue">{c.status}</Badge>
          <span className="ml-auto text-xs font-semibold text-slate-500">Priority {c.priority}/100</span>
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onMap(c.id)}>View on Map</Button>
          <Button variant="danger" size="sm" className="flex-1" icon={CheckCircle2} onClick={() => onResolve(c.id)}>
            Mark Resolved
          </Button>
        </div>
      </div>
    </article>
  )
}

export default function Emergency() {
  const { complaints, updateComplaint, navigate, pushToast } = useApp()
  const active = complaints.filter((c) => c.emergency && c.status !== 'Resolved')
  const handled = complaints.filter((c) => c.emergency && c.status === 'Resolved')
  const affected = active.reduce((a, c) => a + (c.affected ?? 10), 0)
  const teams = active.length * 3

  const resolve = (id) => {
    updateComplaint(id, { status: 'Resolved' })
    pushToast({ tone: 'success', title: 'Emergency marked resolved', message: `${id} — response teams stood down.` })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-red-700">
            <Siren size={24} /> Emergency Response Desk
          </h1>
          <p className="mt-1 text-sm text-slate-500">Critical incidents bypass the standard queue — live dispatch tracking for fire, medical and police.</p>
        </div>
        <Button variant="danger" icon={Siren} to="/report?emergency=1">New Emergency Report</Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border-2 border-red-200 bg-red-600 p-5 text-white shadow-emergency">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-red-100">Active Emergencies</p>
            <Siren size={20} />
          </div>
          <p className="mt-2 text-4xl font-extrabold">{active.length}</p>
          <p className="mt-1 text-xs text-red-100">requires immediate response</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">Teams Deployed</p>
            <Radio size={20} className="text-blue-600" />
          </div>
          <p className="mt-2 text-4xl font-extrabold text-navy-900">{teams}</p>
          <p className="mt-1 text-xs text-slate-400">fire · ambulance · police units</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">People Potentially Affected</p>
            <Users size={20} className="text-amber-600" />
          </div>
          <p className="mt-2 text-4xl font-extrabold text-navy-900">~{affected}</p>
          <p className="mt-1 text-xs text-slate-400">estimated from reports</p>
        </div>
      </div>

      {/* Active cards + map */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Active Incidents ({active.length})</h2>
          {active.map((c) => (
            <EmergencyCard
              key={c.id}
              c={c}
              onResolve={resolve}
              onMap={() => navigate('/admin/map')}
            />
          ))}
          {active.length === 0 && (
            <div className="card p-10 text-center">
              <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
              <p className="mt-3 font-bold text-navy-900">No active emergencies</p>
              <p className="text-sm text-slate-500">All critical incidents have been resolved.</p>
            </div>
          )}
        </div>

        <div className="space-y-5 lg:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Incident Map</h2>
          <div className="card p-3">
            <MapPanel complaints={active.length ? active : complaints.slice(0, 8)} height="h-72" />
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-navy-900">Recently Resolved Emergencies</h3>
            <ul className="mt-3 divide-y divide-slate-100">
              {handled.map((c) => (
                <li key={c.id} className="flex items-center gap-3 py-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-navy-900">{c.title}</p>
                    <p className="text-xs text-slate-400">{c.id} · {c.location.area}</p>
                  </div>
                  <Badge tone="emerald" dot>Resolved</Badge>
                </li>
              ))}
              {handled.length === 0 && <li className="py-3 text-sm text-slate-400">No resolved emergencies yet.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
