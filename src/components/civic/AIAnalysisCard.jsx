import { Sparkles, Building2, Tag, Activity, CheckCircle2, Cpu } from 'lucide-react'
import PriorityScore from '../common/PriorityScore'
import Badge from '../common/Badge'

function Row({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="flex items-center gap-2 text-sm text-slate-500">
        <Icon size={15} className="text-blue-500" aria-hidden /> {label}
      </span>
      {tone ? (
        <Badge tone={tone} dot>{value}</Badge>
      ) : (
        <span className="text-right text-sm font-bold text-navy-900">{value}</span>
      )}
    </div>
  )
}

export default function AIAnalysisCard({ analysis }) {
  if (!analysis) return null
  const severityTone = analysis.emergency ? 'red' : analysis.severity === 'High' ? 'orange' : analysis.severity === 'Medium' ? 'amber' : 'sky'

  return (
    <div className="animate-fade-up relative overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/80 via-white to-sky-50/60 p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-blue-100/50 blur-2xl" aria-hidden />
      <div className="relative">
        <div className="flex items-center justify-between">
          <h3 className="section-title flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-white">
              <Sparkles size={16} />
            </span>
            AI Analysis
          </h3>
          <span className="chip bg-blue-100 text-blue-800">
            <Cpu size={12} /> {analysis.confidence}% confidence
          </span>
        </div>

        <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <div className="shrink-0">
            <PriorityScore score={analysis.priority} size={128} />
          </div>
          <div className="w-full flex-1 divide-y divide-blue-100/70">
            <Row icon={Tag} label="Category" value={analysis.category} />
            <Row icon={Building2} label="Department" value={analysis.department} />
            <Row icon={Activity} label="Severity" value={analysis.severity} tone={severityTone} />
            <Row
              icon={CheckCircle2}
              label="Status"
              value={analysis.emergency ? 'Immediate Response Required' : 'Requires Attention'}
              tone={analysis.emergency ? 'red' : 'amber'}
            />
          </div>
        </div>

        {analysis.detectedSignals?.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-blue-100/70 pt-3">
            <span className="text-xs font-semibold text-slate-400">Signals detected:</span>
            {analysis.detectedSignals.map((s) => (
              <span key={s} className="chip bg-white text-blue-700 ring-1 ring-blue-200">{s}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
