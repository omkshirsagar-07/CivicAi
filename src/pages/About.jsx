import { Sparkles, ShieldCheck, BrainCircuit, Siren, Mic2, MapPin } from 'lucide-react'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'

const PILLARS = [
  { icon: Mic2, title: 'Report anywhere', desc: 'Voice, text, photo or live GPS — citizens choose the easiest way to report.' },
  { icon: BrainCircuit, title: 'AI intelligence', desc: 'Automatic classification, severity detection, priority scoring and duplicate clustering.' },
  { icon: Siren, title: 'Emergency-first', desc: 'Fire, medical and safety emergencies are detected and dispatched within seconds.' },
  { icon: ShieldCheck, title: 'Transparent tracking', desc: 'Every complaint has a public timeline from submission through resolution.' },
  { icon: MapPin, title: 'City-wide visibility', desc: 'A live operations map shows every report colour-coded by priority and status.' },
  { icon: Sparkles, title: 'Built for scale', desc: 'Designed for municipal corporations, ready for real AI and REST API integration.' },
]

export default function About() {
  return (
    <div>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-content px-4 py-14 text-center sm:px-6 lg:px-8">
          <Badge tone="blue" className="mb-4">About CivicAI</Badge>
          <h1 className="mx-auto max-w-3xl text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">
            Bridging citizens and municipal services with artificial intelligence
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            CivicAI is a smart grievance and emergency response platform. Citizens report local issues through
            voice, text, photos or location; the platform understands each complaint, scores its urgency, detects
            emergencies and routes it to the department that can solve it — then tracks it to resolution.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to="/report" size="lg">Report an Issue</Button>
            <Button to="/admin" size="lg" variant="outline">Explore Admin Dashboard</Button>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((p) => (
              <div key={p.title} className="card p-6">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-blue-600">
                  <p.icon size={20} />
                </span>
                <h3 className="mt-4 font-bold text-navy-900">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-blue-200 bg-blue-50/60 p-6 text-center sm:p-10">
            <h2 className="text-xl font-extrabold text-navy-950 sm:text-2xl">The AI pipeline at a glance</h2>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold">
              {['Understand', 'Classify', 'Detect severity', 'Identify department', 'Score priority', 'Check duplicates', 'Detect emergency', 'Route & track'].map((s, i, arr) => (
                <span key={s} className="flex items-center gap-2">
                  <span className="rounded-lg bg-white px-3.5 py-2 text-navy-900 shadow-card ring-1 ring-blue-100">{s}</span>
                  {i < arr.length - 1 && <span className="text-blue-400">→</span>}
                </span>
              ))}
            </div>
            <p className="mt-6 text-sm text-slate-500">
              This demo runs the entire pipeline in the browser with realistic simulations — the UI is structured
              so real AI services and REST APIs can replace the mocks without any redesign.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
