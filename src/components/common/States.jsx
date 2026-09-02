import { Loader2, Inbox, AlertTriangle } from 'lucide-react'
import Button from './Button'

export function Spinner({ size = 20, className = '' }) {
  return <Loader2 size={size} className={`animate-spin text-blue-600 ${className}`} aria-label="Loading" />
}

export function LoadingState({ label = 'Loading…', rows = 3 }) {
  return (
    <div className="space-y-3" role="status" aria-label={label}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-14 rounded-lg" />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  )
}

export function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', message, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon size={26} />
      </span>
      <h3 className="mt-4 text-base font-bold text-navy-900">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>}
      {actionLabel && (
        <Button variant="soft" size="sm" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', message = 'Unable to load data. Please try again.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center" role="alert">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-500">
        <AlertTriangle size={26} />
      </span>
      <h3 className="mt-4 text-base font-bold text-navy-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
