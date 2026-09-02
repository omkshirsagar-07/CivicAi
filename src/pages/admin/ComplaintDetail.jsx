import { useMemo } from 'react'
import {
  ArrowLeft, MapPin, Calendar, Users, Building2, UserCheck, Sparkles, Siren, Copy,
  ImageIcon, Phone, ChevronRight, CheckCircle2,
} from 'lucide-react'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import PriorityScore from '../../components/common/PriorityScore'
import ComplaintTimeline from '../../components/civic/ComplaintTimeline'
import MapPanel from '../../components/civic/MapPanel'
import { StatusBadge, SeverityBadge } from '../../components/common/meta'
import { ErrorState } from '../../components/common/States'
import { STAGES, STATUS_META } from '../../constants'
import { formatDateTime } from '../../utils/format'
import { useApp } from '../../context/AppContext'

export default function ComplaintDetail({ complaintId }) {
  const { complaints, updateComplaint, navigate, pushToast } = useApp()
  const complaint = complaints.find((c) => c.id === complaintId)

  const stageIndex = useMemo(() => (complaint ? STATUS_META[complaint.status]?.stage ?? 0 : 0), [complaint])
  const nextStage = complaint && stageIndex < STAGES.length - 1 ? STAGES[stageIndex + 1] : null

  if (!complaint) {
    return (
      <div className="card">
        <ErrorState
          title="Complaint not found"
          message="This complaint may have been removed or the ID is incorrect."
          onRetry={() => navigate('/admin/complaints')}
        />
      </div>
    )
  }

  const advance = () => {
    if (!nextStage) return
    updateComplaint(complaint.id, { status: nextStage.label, officer: complaint.officer === 'Unassigned' || complaint.officer === 'Pending assignment' ? 'Officer on duty' : complaint.officer })
    pushToast({ tone: 'success', title: 'Status updated', message: `${complaint.id} moved to “${nextStage.label}”.` })
  }

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate('/admin/complaints')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-blue-700"
      >
        <ArrowLeft size={16} /> Back to Complaints
      </button>

      {/* Header */}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-blue-700">{complaint.id}</span>
              <StatusBadge status={complaint.status} />
              <SeverityBadge severity={complaint.severity} emergency={complaint.emergency} />
            </div>
            <h1 className="mt-2 text-xl font-extrabold tracking-tight text-navy-950 sm:text-2xl">{complaint.title}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1"><MapPin size={14} /> {complaint.location.address}</span>
              <span className="inline-flex items-center gap-1"><Calendar size={14} /> {formatDateTime(complaint.createdAt)}</span>
              <span className="inline-flex items-center gap-1"><Users size={14} /> {complaint.reports} citizen reports</span>
            </p>
          </div>
          {nextStage && (
            <Button onClick={advance} iconRight={ChevronRight}>
              Advance to {nextStage.label}
            </Button>
          )}
          {complaint.status === 'Resolved' && (
            <Badge tone="emerald" className="px-3 py-1.5"><CheckCircle2 size={13} /> Resolved & verified</Badge>
          )}
        </div>
      </div>

      {complaint.emergency && complaint.status !== 'Resolved' && (
        <div className="flex flex-col gap-3 rounded-xl border-2 border-red-500 bg-red-600 p-5 text-white shadow-emergency sm:flex-row sm:items-center">
          <Siren size={26} className="shrink-0" />
          <div className="flex-1">
            <p className="text-lg font-extrabold uppercase tracking-wide">Emergency — Immediate Response Required</p>
            <p className="text-sm text-red-100">
              Teams dispatched: {(complaint.teams ?? ['Fire Department', 'Ambulance', 'Police']).join(' · ')}
              {complaint.affected ? ` · ~${complaint.affected} people potentially affected` : ''}
            </p>
          </div>
          <Button variant="navy" className="bg-white !text-red-700 hover:bg-red-50" to="/admin/emergency" iconRight={ChevronRight}>
            Emergency Desk
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Complaint information */}
          <section className="card p-6">
            <h2 className="section-title">Complaint Information</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{complaint.description}</p>

            <div className="mt-5">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-navy-900">
                <ImageIcon size={15} className="text-blue-600" /> Photo Evidence
              </p>
              <div className="flex h-44 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50">
                <p className="text-center text-sm text-slate-400">
                  <ImageIcon size={22} className="mx-auto mb-2 text-slate-300" />
                  No photo attached to this report
                </p>
              </div>
            </div>
          </section>

          {/* AI analysis */}
          <section className="card p-6">
            <h2 className="section-title flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-white"><Sparkles size={15} /></span>
              AI Analysis
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Category', value: complaint.category },
                { label: 'Severity', value: complaint.emergency ? 'Critical — Emergency' : complaint.severity },
                { label: 'Recommended Department', value: complaint.department },
                { label: 'Emergency Status', value: complaint.emergency ? 'Detected — dispatched' : 'No emergency signals' },
                { label: 'Duplicate Status', value: complaint.reports > 15 ? `Part of a cluster (${complaint.reports} reports)` : complaint.reports > 1 ? 'Similar reports nearby' : 'No duplicates found' },
                { label: 'Confidence', value: '94%' },
              ].map((row) => (
                <div key={row.label} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3.5">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{row.label}</dt>
                  <dd className="mt-1 text-sm font-bold text-navy-900">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Assignment */}
          <section className="card p-6">
            <h2 className="section-title flex items-center gap-2">
              <Building2 size={18} className="text-blue-600" /> Assignment
            </h2>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-3 rounded-lg border border-slate-200 p-4">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-navy-100 text-navy-700">
                  <Building2 size={20} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Assigned Department</p>
                  <p className="text-sm font-bold text-navy-900">{complaint.department}</p>
                </div>
              </div>
              <div className="flex flex-1 items-center gap-3 rounded-lg border border-slate-200 p-4">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-blue-100 text-blue-700">
                  <UserCheck size={20} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Assigned Officer</p>
                  <p className="text-sm font-bold text-navy-900">{complaint.officer}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" icon={Phone}>Contact Department</Button>
              <Button variant="outline" size="sm" icon={Copy}>Link Cluster Reports</Button>
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <section className="card flex flex-col items-center p-6">
            <PriorityScore score={complaint.priority} size={148} />
            <p className="mt-3 text-center text-xs text-slate-500">
              Composite of severity ({complaint.emergency ? 'critical' : complaint.severity.toLowerCase()}), evidence and citizen reports.
            </p>
          </section>

          <section className="card p-6">
            <h2 className="section-title mb-5">Status Progression</h2>
            <ComplaintTimeline status={complaint.status} />
          </section>

          <section className="card p-4">
            <MapPanel complaints={[complaint]} selectedId={complaint.id} height="h-52" showLegend={false} />
            <p className="mt-3 px-1 text-xs text-slate-500">
              {complaint.location.lat.toFixed(4)}° N, {complaint.location.lng.toFixed(4)}° E
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
