import { Siren, Flame, Ambulance, ShieldAlert, Phone } from 'lucide-react'

const TEAM_META = {
  'Fire Department': { icon: Flame, eta: '4 min', hotline: '101' },
  Ambulance: { icon: Ambulance, eta: '6 min', hotline: '108' },
  Police: { icon: ShieldAlert, eta: '3 min', hotline: '100' },
}

export default function EmergencyPanel({ teams = ['Fire Department', 'Ambulance', 'Police'] }) {
  return (
    <div className="animate-fade-up overflow-hidden rounded-xl border-2 border-red-500 bg-white shadow-emergency" role="alert">
      <div className="flex items-center gap-3 bg-red-600 px-5 py-4 text-white">
        <span className="relative grid h-11 w-11 place-items-center rounded-full bg-white/15">
          <Siren size={24} className="pulse-ring rounded-full" />
        </span>
        <div>
          <p className="text-lg font-extrabold uppercase tracking-wide">Emergency Detected</p>
          <p className="text-sm text-red-100">Immediate Response Required — emergency services are being notified</p>
        </div>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-3">
        {teams.map((team) => {
          const meta = TEAM_META[team] ?? { icon: ShieldAlert, eta: '5 min', hotline: '112' }
          const Icon = meta.icon
          return (
            <div key={team} className="flex items-center gap-3 rounded-lg border border-red-100 bg-red-50/70 px-4 py-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-600 text-white">
                <Icon size={19} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-navy-900">{team}</p>
                <p className="text-xs font-semibold text-red-600">Dispatched · ETA {meta.eta}</p>
                <a
                  href={`tel:${meta.hotline}`}
                  className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-red-700"
                >
                  <Phone size={10} /> {meta.hotline}
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
