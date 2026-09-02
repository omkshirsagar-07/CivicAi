import {
  Mic, ImagePlus, MapPin, Sparkles, Gauge, Siren, Copy, ArrowRight,
  Mic2, BrainCircuit, Send, CheckCircle2, ShieldCheck, Clock, Users,
} from 'lucide-react'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import PriorityScore from '../components/common/PriorityScore'
import MapPanel from '../components/civic/MapPanel'
import { useApp } from '../context/AppContext'

const PIPELINE = [
  { icon: Mic2, title: 'Report', desc: 'Citizen reports via voice, text, photo or live location — in seconds.' },
  { icon: BrainCircuit, title: 'AI Understands', desc: 'The issue is classified, severity detected and signals extracted.' },
  { icon: Gauge, title: 'Prioritise', desc: 'A priority score, duplicate check and emergency check run instantly.' },
  { icon: Send, title: 'Route & Resolve', desc: 'The complaint is routed to the correct department and tracked to resolution.' },
]

const FEATURES = [
  { icon: Mic, title: 'Voice Reporting', desc: 'Speak naturally in your language — your words are transcribed into a structured complaint.' },
  { icon: ImagePlus, title: 'Photo Evidence', desc: 'Attach a photo of the issue. Visual evidence speeds verification and prioritisation.' },
  { icon: MapPin, title: 'Live Location', desc: 'GPS pins the exact spot automatically — no need to know the ward or office.' },
  { icon: Sparkles, title: 'AI Classification', desc: 'Waste, water, roads, electricity — the AI detects the category and responsible department.' },
  { icon: Gauge, title: 'Priority Scoring', desc: 'Every complaint gets a 0–100 priority score so the most urgent issues are handled first.' },
  { icon: Copy, title: 'Duplicate Detection', desc: 'Similar reports are clustered automatically, amplifying citizen voices instead of duplicating work.' },
  { icon: Siren, title: 'Emergency Detection', desc: 'Fire, medical and safety emergencies are detected instantly and dispatched to 101 / 108 / 100.' },
  { icon: ShieldCheck, title: 'Transparent Tracking', desc: 'Citizens follow every stage — submitted, assigned, in progress, resolved — with a live timeline.' },
]

export default function Landing() {
  const { complaints, navigate } = useApp()
  const mapComplaints = complaints.slice(0, 12)

  return (
    <div>
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-gradient-to-b from-blue-50/70 via-blue-50/30 to-transparent" aria-hidden />
        <div className="relative mx-auto grid max-w-content items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="animate-fade-up">
            <Badge tone="blue" className="mb-5">
              <Sparkles size={12} /> AI-powered civic response platform
            </Badge>
            <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight text-navy-950 sm:text-5xl">
              Smarter Cities. <span className="text-blue-600">Faster Response.</span> Better Communities.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Report local problems with your <strong className="font-semibold text-slate-800">voice, text, photos or live location</strong>.
              CivicAI understands the issue, scores its priority, detects emergencies and routes it to the
              right department — automatically.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/report" size="lg" iconRight={ArrowRight}>Report an Issue</Button>
              <Button to="/track" size="lg" variant="outline">Track Complaint</Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
              {[
                { icon: Clock, value: '< 60s', label: 'to file a report' },
                { icon: BrainCircuit, value: '8', label: 'departments auto-routed' },
                { icon: Users, value: '1,284', label: 'citizens helped this month' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-600">
                    <s.icon size={18} />
                  </span>
                  <div>
                    <p className="text-lg font-extrabold leading-none text-navy-900">{s.value}</p>
                    <p className="mt-1 text-xs text-slate-500">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* App preview */}
          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-pop">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-3 rounded-md bg-white px-3 py-1 text-xs font-medium text-slate-400 ring-1 ring-slate-200">
                  civicai.gov.in/live-map
                </span>
              </div>
              <div className="p-3">
                <MapPanel complaints={mapComplaints} height="h-[300px]" showLegend={false} />
              </div>
            </div>

            {/* Floating AI card */}
            <div className="animate-float absolute -bottom-8 -left-2 w-60 rounded-xl border border-slate-200 bg-white p-4 shadow-pop sm:-left-8">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-blue-700">
                <Sparkles size={13} /> AI Analysis
              </p>
              <div className="mt-2 flex items-center gap-3">
                <PriorityScore score={91} size={74} label="" />
                <div className="text-xs">
                  <p className="font-bold text-navy-900">Water Supply</p>
                  <p className="text-slate-500">Water Supply Dept.</p>
                  <Badge tone="orange" dot className="mt-1.5">High severity</Badge>
                </div>
              </div>
            </div>

            {/* Floating emergency chip */}
            <div className="animate-float absolute -right-1 top-6 flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-white shadow-emergency [animation-delay:1.2s] sm:-right-4">
              <Siren size={17} />
              <div className="text-xs leading-tight">
                <p className="font-extrabold">EMERGENCY</p>
                <p className="text-red-100">Fire · dispatched</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Emergency strip ---------------- */}
      <section className="border-y border-red-200 bg-red-50">
        <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="flex items-center gap-2.5 text-sm font-semibold text-red-800">
            <Siren size={18} />
            Witnessing a fire, medical emergency or danger? CivicAI detects emergencies instantly and alerts Fire, Ambulance &amp; Police.
          </p>
          <Button variant="danger" size="sm" to="/report?emergency=1" icon={Siren}>
            Report an Emergency
          </Button>
        </div>
      </section>

      {/* ---------------- Pipeline ---------------- */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge tone="sky" className="mb-4">How CivicAI works</Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-navy-950">From report to resolution — intelligently</h2>
            <p className="mt-3 text-slate-600">
              One complaint flows through an AI pipeline that understands, prioritises and routes it — so the
              right team starts work within minutes.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PIPELINE.map((step, i) => (
              <div key={step.title} className="relative card p-6">
                <span className="absolute right-5 top-5 text-3xl font-extrabold text-slate-100">0{i + 1}</span>
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-600 text-white">
                  <step.icon size={22} />
                </span>
                <h3 className="mt-4 text-lg font-bold text-navy-900">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Features ---------------- */}
      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge tone="blue" className="mb-4">Built for citizens &amp; administrators</Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-navy-950">Everything a smart grievance system needs</h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6 transition-shadow hover:shadow-pop">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-blue-600">
                  <f.icon size={20} />
                </span>
                <h3 className="mt-4 font-bold text-navy-900">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="bg-navy-900 py-16">
        <div className="mx-auto flex max-w-content flex-col items-center px-4 text-center sm:px-6 lg:px-8">
          <CheckCircle2 size={36} className="text-blue-400" />
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white">Your report makes the city better</h2>
          <p className="mt-3 max-w-xl text-navy-100/80">
            Every complaint is analysed, prioritised and tracked to resolution. Join thousands of citizens
            building a faster, more responsive city.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" to="/report" iconRight={ArrowRight}>Report an Issue</Button>
            <Button
              size="lg"
              variant="outline"
              className="border-navy-700 bg-transparent text-white hover:bg-navy-800 hover:text-white"
              onClick={() => navigate('/admin')}
              to="/admin"
            >
              Open Admin Dashboard
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
