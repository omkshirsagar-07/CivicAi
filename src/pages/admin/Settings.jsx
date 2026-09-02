import { useState } from 'react'
import { Settings as SettingsIcon, Bell, BrainCircuit, Siren, Save } from 'lucide-react'
import Button from '../../components/common/Button'
import { useApp } from '../../context/AppContext'

function Toggle({ on, onChange, label, desc }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div>
        <p className="text-sm font-bold text-navy-900">{label}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <button
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => onChange(!on)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-blue-600' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  )
}

export default function Settings() {
  const { pushToast } = useApp()
  const [prefs, setPrefs] = useState({
    autoRoute: true,
    emergencySms: true,
    duplicateCluster: true,
    priorityEmail: false,
    nightDigest: false,
  })

  const set = (k) => (v) => setPrefs((p) => ({ ...p, [k]: v }))

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-navy-950">
          <SettingsIcon size={22} className="text-blue-600" /> Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">Configure the AI pipeline, emergency alerts and notification preferences.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="section-title flex items-center gap-2">
            <BrainCircuit size={18} className="text-blue-600" /> AI Pipeline
          </h2>
          <div className="mt-2 divide-y divide-slate-100">
            <Toggle on={prefs.autoRoute} onChange={set('autoRoute')} label="Auto-route complaints" desc="AI assigns each complaint to a department automatically." />
            <Toggle on={prefs.duplicateCluster} onChange={set('duplicateCluster')} label="Duplicate clustering" desc="Merge similar nearby reports into a single tracked cluster." />
          </div>
        </section>

        <section className="card p-6">
          <h2 className="section-title flex items-center gap-2">
            <Siren size={18} className="text-red-600" /> Emergency Alerts
          </h2>
          <div className="mt-2 divide-y divide-slate-100">
            <Toggle on={prefs.emergencySms} onChange={set('emergencySms')} label="Instant dispatch SMS" desc="Notify Fire (101), Ambulance (108) and Police (100) automatically." />
            <Toggle on={prefs.priorityEmail} onChange={set('priorityEmail')} label="High-priority email digests" desc="Email control room for any priority score above 85." />
          </div>
        </section>

        <section className="card p-6 lg:col-span-2">
          <h2 className="section-title flex items-center gap-2">
            <Bell size={18} className="text-blue-600" /> Notifications
          </h2>
          <div className="mt-2 divide-y divide-slate-100">
            <Toggle on={prefs.nightDigest} onChange={set('nightDigest')} label="Nightly summary digest" desc="One summary email with the day's complaints and resolutions." />
          </div>
          <div className="mt-4 flex justify-end">
            <Button icon={Save} onClick={() => pushToast({ tone: 'success', title: 'Settings saved', message: 'Your preferences have been updated.' })}>
              Save Settings
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
