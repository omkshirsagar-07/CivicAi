import { Check } from 'lucide-react'
import { STAGES, STATUS_META } from '../../constants'

export default function ComplaintTimeline({ status, compact = false }) {
  const currentStage = STATUS_META[status]?.stage ?? 0
  const resolved = status === 'Resolved'

  return (
    <ol className="relative">
      {STAGES.map((stage, i) => {
        const isDone = i < currentStage || resolved
        const isCurrent = i === currentStage && !resolved
        return (
          <li key={stage.key} className="relative flex gap-4 pb-6 last:pb-0">
            {i < STAGES.length - 1 && (
              <span
                className={`absolute left-[15px] top-8 h-[calc(100%-16px)] w-0.5 ${isDone ? 'bg-blue-500' : 'bg-slate-200'}`}
                aria-hidden
              />
            )}
            <span
              className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 ${
                isDone
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : isCurrent
                    ? 'border-blue-600 bg-white text-blue-600'
                    : 'border-slate-300 bg-white text-slate-300'
              }`}
            >
              {isDone ? (
                <Check size={15} strokeWidth={3} />
              ) : isCurrent ? (
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-600" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-slate-300" />
              )}
            </span>
            <div className="pt-1">
              <p className={`text-sm font-bold ${isDone || isCurrent ? 'text-navy-900' : 'text-slate-400'}`}>
                {stage.label}
                {isCurrent && (
                  <span className="ml-2 chip bg-blue-100 text-blue-800">Current</span>
                )}
              </p>
              {!compact && <p className="mt-0.5 text-xs text-slate-500">{stage.desc}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
