import { useEffect, useRef, useState } from 'react'
import { Mic, Loader2, CheckCircle2, RotateCcw } from 'lucide-react'
import { VOICE_SAMPLE } from '../../constants'

const STATE_LABELS = {
  idle: 'Ready',
  listening: 'Listening…',
  processing: 'Processing speech…',
  completed: 'Transcription complete',
}

// Front-end simulation of voice reporting. Swap start() with a real
// Web Speech / STT API call later — the UI contract stays identical.
export default function VoiceRecorder({ onResult, sampleText = VOICE_SAMPLE }) {
  const [state, setState] = useState('idle')
  const [seconds, setSeconds] = useState(0)
  const timers = useRef([])

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  useEffect(() => clearTimers, [])

  const start = () => {
    clearTimers()
    setState('listening')
    setSeconds(0)
    const tick = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    timers.current.push(tick)
    timers.current.push(
      window.setTimeout(() => {
        clearInterval(tick)
        setState('processing')
      }, 3000),
    )
    timers.current.push(
      window.setTimeout(() => {
        setState('completed')
        onResult?.(sampleText)
      }, 4300),
    )
  }

  const reset = () => {
    clearTimers()
    setState('idle')
    setSeconds(0)
  }

  const listening = state === 'listening'
  const processing = state === 'processing'

  return (
    <div
      className={`flex flex-col items-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors sm:flex-row sm:text-left ${
        listening ? 'border-red-300 bg-red-50/60' : 'border-slate-200 bg-slate-50/60'
      }`}
    >
      <button
        type="button"
        onClick={listening || processing ? undefined : state === 'completed' ? reset : start}
        disabled={processing}
        aria-label={listening ? 'Recording in progress' : 'Speak your complaint'}
        className={`relative grid h-16 w-16 shrink-0 place-items-center rounded-full transition-all ${
          listening
            ? 'pulse-ring bg-red-600 text-white'
            : processing
              ? 'bg-blue-100 text-blue-700'
              : state === 'completed'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
        }`}
      >
        {processing ? (
          <Loader2 size={26} className="animate-spin" />
        ) : state === 'completed' ? (
          <CheckCircle2 size={26} />
        ) : (
          <Mic size={26} />
        )}
      </button>

      <div className="mt-4 flex-1 sm:mt-0 sm:ml-5">
        <p className="font-bold text-navy-900">
          {listening ? 'Listening to your complaint…' : processing ? 'Converting speech to text…' : state === 'completed' ? 'Voice captured' : 'Speak Your Complaint'}
        </p>
        <p className="mt-0.5 text-sm text-slate-500" aria-live="polite">
          {STATE_LABELS[state]}
          {listening && <span className="ml-2 font-mono text-xs font-semibold text-red-600">0:0{seconds}</span>}
        </p>

        {listening && (
          <div className="mt-3 flex h-7 items-end gap-1" aria-hidden="true">
            {[0.9, 0.5, 1.1, 0.7, 1.3, 0.6, 1, 0.8, 1.2, 0.55, 0.95].map((d, i) => (
              <span
                key={i}
                className="eq-bar w-1 rounded-full bg-red-500"
                style={{ height: '100%', animationDelay: `${i * 0.08}s`, animationDuration: `${d}s` }}
              />
            ))}
          </div>
        )}
        {state === 'completed' && (
          <p className="mt-2 line-clamp-2 text-xs text-emerald-700">“{sampleText}”</p>
        )}
      </div>

      <div className="mt-4 sm:mt-0 sm:ml-4">
        {state === 'completed' ? (
          <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-700">
            <RotateCcw size={14} /> Record again
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            disabled={listening || processing}
            className="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-50"
          >
            {listening ? 'Recording…' : processing ? 'Processing…' : '🎙️ Start Recording'}
          </button>
        )}
      </div>
    </div>
  )
}
