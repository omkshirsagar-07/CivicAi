import { Copy, MapPin, Users, ArrowRight } from 'lucide-react'
import Button from '../common/Button'

export default function DuplicatePanel({ similar, onView }) {
  if (!similar) return null
  return (
    <div className="animate-fade-up flex flex-col gap-4 rounded-xl border border-amber-200 bg-amber-50/70 p-5 sm:flex-row sm:items-center">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700">
        <Copy size={20} />
      </span>
      <div className="flex-1">
        <p className="font-bold text-navy-900">Similar Issue Detected</p>
        <p className="mt-0.5 text-sm text-slate-600">
          <span className="font-bold text-amber-700">{similar.reports} citizens</span> have reported a similar issue nearby.
          Your report will be added to this cluster, increasing its priority.
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
          <span className="inline-flex items-center gap-1">
            <span className="font-mono font-semibold text-slate-700">{similar.complaintId}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin size={12} /> {similar.location} · {similar.distanceKm.toFixed(1)} km away
          </span>
          <span className="inline-flex items-center gap-1">
            <Users size={12} /> {similar.reports} affected citizens
          </span>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={() => onView?.(similar.complaintId)} iconRight={ArrowRight} className="shrink-0 border-amber-300 text-amber-800 hover:bg-amber-100">
        View Existing Complaint
      </Button>
    </div>
  )
}
