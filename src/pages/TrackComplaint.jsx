import { useEffect, useState } from 'react'
import { Search, FileSearch, MapPin, Building2, Clock, Users, Tag } from 'lucide-react'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { Input, Field } from '../components/common/Input'
import ComplaintTimeline from '../components/civic/ComplaintTimeline'
import MapPanel from '../components/civic/MapPanel'
import PriorityScore from '../components/common/PriorityScore'
import { StatusBadge, SeverityBadge } from '../components/common/meta'
import { LoadingState, EmptyState } from '../components/common/States'
import { formatDateTime } from '../utils/format'
import { useApp } from '../context/AppContext'

export default function TrackComplaint() {
  const { complaints, queryParams } = useApp()
  const [idInput, setIdInput] = useState('')
  const [searchedId, setSearchedId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (queryParams.id) {
      setIdInput(queryParams.id)
      runSearch(queryParams.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams.id])

  const runSearch = (rawId) => {
    const id = (rawId ?? idInput).trim().toUpperCase()
    if (!id) return
    setLoading(true)
    setNotFound(false)
    setSearchedId(null)
    // simulate API latency
    window.setTimeout(() => {
      const found = complaints.find((c) => c.id.toUpperCase() === id)
      setLoading(false)
      if (found) setSearchedId(found.id)
      else setNotFound(true)
    }, 800)
  }

  const complaint = complaints.find((c) => c.id === searchedId)

  return (
    <div className="bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl">Track Your Complaint</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Enter the complaint ID you received after submission to see its live status and resolution timeline.
          </p>
          <form
            className="mt-5 flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              runSearch()
            }}
          >
            <div className="flex-1">
              <label htmlFor="track-id" className="sr-only">Complaint ID</label>
              <div className="relative">
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  id="track-id"
                  value={idInput}
                  onChange={(e) => setIdInput(e.target.value)}
                  placeholder="Enter Complaint ID — e.g. CIV-2026-0917"
                  className="pl-10 py-3 font-mono"
                  autoComplete="off"
                />
              </div>
            </div>
            <Button type="submit" size="lg" icon={Search} loading={loading}>Track Complaint</Button>
          </form>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>Try a demo ID:</span>
            {['CIV-2026-0917', 'CIV-2026-0923', 'CIV-2026-0908'].map((id) => (
              <button key={id} onClick={() => { setIdInput(id); runSearch(id) }} className="chip bg-slate-100 font-mono text-slate-600 hover:bg-blue-50 hover:text-blue-700">
                {id}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
        {loading && (
          <div className="card p-6">
            <LoadingState label="Fetching complaint status" rows={4} />
          </div>
        )}

        {!loading && notFound && (
          <div className="card">
            <EmptyState
              icon={FileSearch}
              title="Complaint not found"
              message={`We could not find a complaint with ID “${idInput}”. Please check the ID and try again.`}
              actionLabel="Report a new issue"
              onAction={() => (window.location.hash = '/report')}
            />
          </div>
        )}

        {!loading && complaint && (
          <div className="grid animate-fade-up gap-6 lg:grid-cols-5">
            {/* Details */}
            <div className="space-y-6 lg:col-span-3">
              <div className="card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs font-semibold text-blue-700">{complaint.id}</p>
                    <h2 className="mt-1 text-xl font-extrabold text-navy-950">{complaint.title}</h2>
                  </div>
                  <StatusBadge status={complaint.status} className="px-3 py-1.5" />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{complaint.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <SeverityBadge severity={complaint.severity} emergency={complaint.emergency} />
                  <Badge tone="slate"><Tag size={11} /> {complaint.category}</Badge>
                  {complaint.emergency && <Badge tone="red">Emergency response active</Badge>}
                </div>

                <dl className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
                  <div className="flex gap-2.5">
                    <Building2 size={16} className="mt-0.5 shrink-0 text-blue-500" />
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Department</dt>
                      <dd className="text-sm font-semibold text-navy-900">{complaint.department}</dd>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-blue-500" />
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Location</dt>
                      <dd className="text-sm font-semibold text-navy-900">{complaint.location.address}</dd>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <Clock size={16} className="mt-0.5 shrink-0 text-blue-500" />
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Submitted</dt>
                      <dd className="text-sm font-semibold text-navy-900">{formatDateTime(complaint.createdAt)}</dd>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <Users size={16} className="mt-0.5 shrink-0 text-blue-500" />
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Citizen Reports</dt>
                      <dd className="text-sm font-semibold text-navy-900">{complaint.reports} people reported this</dd>
                    </div>
                  </div>
                </dl>
              </div>

              <div className="card p-6">
                <h3 className="section-title mb-5">Resolution Timeline</h3>
                <ComplaintTimeline status={complaint.status} />
              </div>
            </div>

            {/* Side column */}
            <div className="space-y-6 lg:col-span-2">
              <div className="card flex flex-col items-center p-6">
                <PriorityScore score={complaint.priority} size={150} />
                <p className="mt-3 text-center text-xs text-slate-500">
                  AI-assigned priority based on severity, evidence and citizen reports.
                </p>
              </div>
              <div className="card p-4">
                <MapPanel complaints={[complaint]} selectedId={complaint.id} height="h-56" showLegend={false} />
                <p className="mt-3 px-1 text-xs text-slate-500">
                  <MapPin size={12} className="mr-1 inline" />
                  {complaint.location.lat.toFixed(4)}° N, {complaint.location.lng.toFixed(4)}° E
                </p>
              </div>
            </div>
          </div>
        )}

        {!loading && !complaint && !notFound && (
          <div className="card">
            <EmptyState
              icon={FileSearch}
              title="Track any complaint"
              message="Enter a complaint ID like CIV-2026-0917 to see its category, priority, assigned department and live resolution timeline."
            />
          </div>
        )}
      </div>
    </div>
  )
}
