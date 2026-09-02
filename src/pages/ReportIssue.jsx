import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Mic, FileText, ImagePlus, MapPin, Sparkles, Siren, Send, CheckCircle2,
  ArrowRight, RotateCcw,
} from 'lucide-react'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { Textarea, Field } from '../components/common/Input'
import VoiceRecorder from '../components/civic/VoiceRecorder'
import ImageUpload from '../components/civic/ImageUpload'
import LocationCard from '../components/civic/LocationCard'
import AIAnalysisCard from '../components/civic/AIAnalysisCard'
import EmergencyPanel from '../components/civic/EmergencyPanel'
import DuplicatePanel from '../components/civic/DuplicatePanel'
import AIProcessing from '../components/civic/AIProcessing'
import PriorityScore from '../components/common/PriorityScore'
import { StatusBadge } from '../components/common/meta'
import { analyzeComplaint, findSimilar } from '../utils/ai'
import { genComplaintId, formatDateTime } from '../utils/format'
import { VOICE_SAMPLE, EMERGENCY_SAMPLE } from '../constants'
import { useApp } from '../context/AppContext'

const EXAMPLES = [
  { label: 'Water pipeline leakage', text: VOICE_SAMPLE },
  { label: 'Fire near market', text: EMERGENCY_SAMPLE },
  { label: 'Garbage overflow', text: 'Garbage has not been collected near Paithan Gate for four days and it is overflowing onto the footpath.' },
]

function deriveTitle(text) {
  const first = text.split(/[.!?]/)[0].trim()
  if (first.length <= 64) return first.charAt(0).toUpperCase() + first.slice(1)
  return `${first.slice(0, 61).trim()}…`
}

export default function ReportIssue() {
  const { complaints, addComplaint, navigate, queryParams, pushToast } = useApp()

  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [location, setLocation] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  const [error, setError] = useState('')
  const debounceRef = useRef(null)

  // Pre-fill emergency example when arriving from the Emergency CTA
  useEffect(() => {
    if (queryParams.emergency === '1') {
      setText(EMERGENCY_SAMPLE)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounced AI analysis as the citizen types (simulates live AI service)
  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (text.trim().length < 12) {
      setAnalysis(null)
      setAnalyzing(false)
      return
    }
    setAnalyzing(true)
    debounceRef.current = window.setTimeout(() => {
      setAnalysis(analyzeComplaint(text, { hasImage: Boolean(image), hasLocation: Boolean(location) }))
      setAnalyzing(false)
    }, 900)
    return () => clearTimeout(debounceRef.current)
  }, [text, image, location])

  const similar = useMemo(
    () => (analysis ? findSimilar(analysis, complaints) : null),
    [analysis, complaints],
  )

  const handleSubmit = () => {
    if (text.trim().length < 12) {
      setError('Please describe the issue in at least 12 characters, or use the voice button.')
      return
    }
    if (!location) {
      setError('We could not detect your location yet. Please wait or tap "Use My Location".')
      return
    }
    setError('')
    setProcessing(true)
  }

  const handleProcessingComplete = () => {
    const result = analyzeComplaint(text, { hasImage: Boolean(image), hasLocation: true })
    const id = genComplaintId(complaints)
    const isFire = result.category === 'Fire Emergency'
    const teams = result.emergency ? (isFire ? ['Fire Department', 'Ambulance', 'Police'] : ['Ambulance', 'Police']) : undefined

    const complaint = {
      id,
      title: deriveTitle(text),
      description: text.trim(),
      category: result.category,
      department: result.department,
      severity: result.severity,
      priority: result.priority,
      emergency: result.emergency,
      status: 'Department Assigned',
      location: {
        address: location.address,
        area: location.area,
        lat: location.lat,
        lng: location.lng,
        x: 48 + (id.charCodeAt(id.length - 1) % 30),
        y: 35 + (id.charCodeAt(id.length - 2) % 25),
      },
      reports: 1,
      createdAt: new Date().toISOString(),
      officer: 'Pending assignment',
      ...(teams ? { teams, affected: 0 } : {}),
    }
    addComplaint(complaint)
    setProcessing(false)
    setSubmitted(complaint)
    pushToast(
      result.emergency
        ? { tone: 'emergency', title: 'Emergency services dispatched', message: `${id} · Fire, ambulance and police have been alerted.` }
        : { tone: 'success', title: 'Complaint submitted successfully', message: `${id} routed to ${result.department}.` },
    )
  }

  const reset = () => {
    setText('')
    setImage(null)
    setAnalysis(null)
    setSubmitted(null)
    setError('')
  }

  // ---------------- Confirmation screen ----------------
  if (submitted) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="card animate-scale-in overflow-hidden">
          <div className={`px-6 py-8 text-center sm:px-10 ${submitted.emergency ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/15">
              {submitted.emergency ? <Siren size={30} /> : <CheckCircle2 size={30} />}
            </span>
            <h2 className="mt-4 text-2xl font-extrabold">
              {submitted.emergency ? 'Emergency Reported — Services Dispatched' : 'Complaint Submitted Successfully'}
            </h2>
            <p className="mt-1.5 text-sm opacity-90">
              {submitted.emergency
                ? 'Your report has been flagged critical. Emergency teams are being dispatched now.'
                : 'Your complaint has been analysed by AI and routed to the responsible department.'}
            </p>
          </div>

          <div className="px-6 py-6 sm:px-10">
            <div className="flex flex-col items-center gap-6 rounded-xl border border-slate-200 bg-slate-50/60 p-6 sm:flex-row">
              <PriorityScore score={submitted.priority} size={110} />
              <dl className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Complaint ID</dt>
                  <dd className="font-mono text-sm font-bold text-blue-700">{submitted.id}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Category</dt>
                  <dd className="text-sm font-bold text-navy-900">{submitted.category}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Department</dt>
                  <dd className="text-sm font-bold text-navy-900">{submitted.department}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Location</dt>
                  <dd className="text-sm font-bold text-navy-900">{submitted.location.area}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Current Status</dt>
                  <dd className="mt-0.5"><StatusBadge status={submitted.status} /></dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Submitted</dt>
                  <dd className="text-sm font-bold text-navy-900">{formatDateTime(submitted.createdAt)}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="flex-1" iconRight={ArrowRight} onClick={() => navigate(`/track?id=${submitted.id}`)}>
                Track Complaint
              </Button>
              <Button size="lg" variant="outline" className="flex-1" iconRight={ArrowRight} onClick={() => navigate('/admin/complaints')}>
                View in Admin Dashboard
              </Button>
            </div>
            <button
              onClick={reset}
              className="mx-auto mt-5 flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-700"
            >
              <RotateCcw size={14} /> Submit another complaint
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---------------- Form screen ----------------
  return (
    <div className="bg-slate-50">
      {processing && <AIProcessing onComplete={handleProcessingComplete} />}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
          <Badge tone="blue" className="mb-3"><Sparkles size={12} /> AI-assisted reporting</Badge>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl">Report a Civic Issue</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
            Describe the problem with text, your voice or a photo. CivicAI will automatically classify the
            issue, score its priority and route it to the right department.
          </p>
        </div>
      </div>

      {queryParams.emergency === '1' && (
        <div className="mx-auto max-w-content px-4 pt-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 rounded-xl border border-red-300 bg-red-600 px-5 py-3.5 text-white shadow-emergency">
            <Siren size={22} className="shrink-0" />
            <p className="text-sm font-semibold">
              Emergency mode — describe the danger below. Fire, ambulance and police will be dispatched automatically.
            </p>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-content gap-6 px-4 py-8 sm:px-6 lg:grid-cols-5 lg:px-8">
        {/* -------- Left: inputs -------- */}
        <div className="space-y-6 lg:col-span-3">
          {/* Description */}
          <section className="card p-5 sm:p-6">
            <h2 className="section-title flex items-center gap-2">
              <FileText size={18} className="text-blue-600" /> Describe the Issue
            </h2>

            <div className="mt-4">
              <Field
                label="What is the problem?"
                required
                error={error}
                htmlFor="complaint-text"
              >
                <Textarea
                  id="complaint-text"
                  rows={5}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Describe the problem… e.g. “There is a major water pipeline leakage near the bus stand.”"
                  className="text-[15px]"
                  aria-describedby="example-hint"
                />
              </Field>
              <div id="example-hint" className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400">Try a demo:</span>
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    type="button"
                    onClick={() => setText(ex.text)}
                    className="chip bg-slate-100 text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-navy-900">
                <Mic size={16} className="text-blue-600" /> Or speak your complaint
              </p>
              <VoiceRecorder onResult={(t) => setText(t)} />
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-navy-900">
                <ImagePlus size={16} className="text-blue-600" /> Add a photo (optional)
              </p>
              <ImageUpload image={image} onImageChange={setImage} />
            </div>
          </section>

          {/* Location */}
          <LocationCard location={location} onLocationChange={setLocation} />
        </div>

        {/* -------- Right: AI analysis -------- */}
        <div className="space-y-5 lg:col-span-2">
          <div className="lg:sticky lg:top-20 space-y-5">
            {!analysis && !analyzing && (
              <div className="card flex flex-col items-center px-6 py-12 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-500">
                  <Sparkles size={26} />
                </span>
                <h3 className="mt-4 font-bold text-navy-900">AI analysis appears here</h3>
                <p className="mt-1.5 max-w-xs text-sm text-slate-500">
                  Start typing or record your voice — CivicAI will detect the category, severity,
                  department and priority score automatically.
                </p>
              </div>
            )}

            {analyzing && (
              <div className="card p-6" aria-live="polite">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 animate-pulse place-items-center rounded-lg bg-blue-600 text-white">
                    <Sparkles size={18} />
                  </span>
                  <div>
                    <p className="font-bold text-navy-900">AI is analysing your complaint…</p>
                    <p className="text-xs text-slate-500">Classifying · scoring · checking duplicates</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2.5">
                  {['Category detection', 'Severity analysis', 'Department routing'].map((s) => (
                    <div key={s} className="skeleton h-9 rounded-lg" />
                  ))}
                </div>
              </div>
            )}

            {analysis && !analyzing && (
              <>
                <AIAnalysisCard analysis={analysis} />
                {analysis.emergency && (
                  <EmergencyPanel teams={analysis.category === 'Fire Emergency' ? ['Fire Department', 'Ambulance', 'Police'] : ['Ambulance', 'Police']} />
                )}
                {!analysis.emergency && <DuplicatePanel similar={similar} onView={(id) => navigate(`/track?id=${id}`)} />}

                <div className="card p-5">
                  <p className="flex items-center gap-2 text-sm font-semibold text-navy-900">
                    <MapPin size={15} className="text-blue-600" /> Ready to submit
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Your report will be logged with {location ? 'live GPS coordinates' : 'location pending'}
                    {image ? ', an attached photo' : ''} and routed to <strong>{analysis.department}</strong>.
                  </p>
                  <Button
                    variant={analysis.emergency ? 'danger' : 'primary'}
                    size="lg"
                    className="mt-4 w-full"
                    icon={analysis.emergency ? Siren : Send}
                    onClick={handleSubmit}
                  >
                    {analysis.emergency ? 'Submit Emergency Report' : 'Submit Complaint'}
                  </Button>
                  {analysis.emergency && (
                    <p className="mt-2 text-center text-xs font-semibold text-red-600">
                      Emergency hotlines: Fire 101 · Ambulance 108 · Police 100
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
