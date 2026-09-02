import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import { AI_STEPS } from '../../utils/ai'

// Full-panel simulation of the CivicAI pipeline shown after submission.
export default function AIProcessing({ onComplete }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (step >= AI_STEPS.length) {
      const t = window.setTimeout(onComplete, 700)
      return () => clearTimeout(t)
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), 650)
    return () => clearTimeout(t)
  }, [step, onComplete])

  const done = step >= AI_STEPS.length

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-sm" role="status" aria-live="polite">
      <div className="animate-scale-in w-full max-w-md rounded-2xl bg-white p-7 shadow-pop">
        <div className="flex items-center gap-3">
          <span className={`grid h-11 w-11 place-items-center rounded-xl ${done ? 'bg-emerald-600' : 'bg-blue-600'} text-white`}>
            {done ? <CheckCircle2 size={22} /> : <Sparkles size={22} className="animate-pulse" />}
          </span>
          <div>
            <h3 className="text-lg font-extrabold text-navy-900">{done ? 'AI Analysis Complete' : 'AI Analysing Complaint'}</h3>
            <p className="text-sm text-slate-500">{done ? 'Routing to the responsible department' : 'Running the CivicAI intelligence pipeline'}</p>
          </div>
        </div>

        <ul className="mt-6 space-y-1">
          {AI_STEPS.map((label, i) => {
            const state = i < step ? 'done' : i === step && !done ? 'active' : 'pending'
            return (
              <li
                key={label}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  state === 'active' ? 'bg-blue-50 font-semibold text-blue-800' : state === 'done' ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                {state === 'done' ? (
                  <CheckCircle2 size={17} className="text-emerald-500" />
                ) : state === 'active' ? (
                  <Loader2 size={17} className="animate-spin text-blue-600" />
                ) : (
                  <span className="ml-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-300" />
                )}
                {label.replace('…', '')}
                {state === 'done' && <span className="ml-auto text-xs font-medium text-emerald-600">Done</span>}
              </li>
            )
          })}
        </ul>

        {/* progress bar */}
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{ width: `${Math.min(100, (step / AI_STEPS.length) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
