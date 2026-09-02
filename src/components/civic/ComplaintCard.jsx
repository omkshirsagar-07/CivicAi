import { MapPin, Users, Clock, ChevronRight, Siren } from 'lucide-react'
import { StatusBadge, SeverityBadge, complaintColor } from '../common/meta'
import { timeAgo } from '../../utils/format'

export default function ComplaintCard({ complaint, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border p-4 text-left transition-all ${
        active ? 'border-blue-400 bg-blue-50/50 shadow-card ring-1 ring-blue-200' : 'border-slate-200 bg-white hover:border-blue-200 hover:shadow-card'
      }`}
      aria-current={active}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: complaintColor(complaint) }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-mono text-[11px] font-semibold text-slate-400">{complaint.id}</p>
            {complaint.emergency && complaint.status !== 'Resolved' && (
              <span className="chip bg-red-50 text-red-600">
                <Siren size={11} /> Emergency
              </span>
            )}
          </div>
          <h4 className="mt-0.5 truncate text-sm font-bold text-navy-900">{complaint.title}</h4>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} /> {complaint.location.area}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users size={12} /> {complaint.reports} reports
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={12} /> {timeAgo(complaint.createdAt)}
            </span>
          </p>
          <div className="mt-2.5 flex items-center justify-between">
            <div className="flex gap-1.5">
              <StatusBadge status={complaint.status} />
              <SeverityBadge severity={complaint.severity} emergency={complaint.emergency} />
            </div>
            <ChevronRight size={15} className="shrink-0 text-slate-300" />
          </div>
        </div>
      </div>
    </button>
  )
}
