'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import { useAdminReports, StatusBadge, PriorityBadge } from '@/components/admin/AdminData';

const AdminLeafletMap = dynamic(() => import('@/components/map/AdminLeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[560px] items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-sm text-slate-500">
      Loading admin map…
    </div>
  ),
});

export default function AdminMapPage() {
  const { data, loading, error, reload } = useAdminReports('?limit=200');
  const [selected, setSelected] = useState(null);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  const reports = (data?.reports || []).filter(
    (report) =>
      report.location?.latitude != null &&
      report.location?.longitude != null &&
      (!category || report.category === category) &&
      (!status || (report.status || 'PENDING') === status) &&
      (!priority || report.priority === priority)
  );

  const categories = [...new Set((data?.reports || []).map((report) => report.category).filter(Boolean))];

  return (
    <div>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-civic-blue">Geographic operations</p>
          <h1 className="mt-1 text-3xl font-bold text-navy-950">Live map</h1>
          <p className="mt-1 text-sm text-slate-500">{reports.length} reports with confirmed coordinates</p>
        </div>

        <button className="btn btn-outline px-3 py-2" onClick={reload} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </header>

      <div className="mt-7 grid gap-3 md:grid-cols-3">
        <select className="input-base" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          <option>PENDING</option>
          <option>IN_PROGRESS</option>
          <option>RESOLVED</option>
        </select>

        <select className="input-base" value={priority} onChange={(event) => setPriority(event.target.value)}>
          <option value="">All priorities</option>
          <option>Emergency</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <select className="input-base" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      {error && (
        <p role="alert" className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <MapCanvas reports={reports} selected={selected} setSelected={setSelected} loading={loading} />

        <section className="max-h-[620px] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-card">
          {selected ? (
            <div className="border-b border-slate-100 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Selected report</p>
              <Link href={`/admin/reports/${selected.reportId}`} className="mt-1 block font-bold text-civic-blue">
                {selected.reportId}
              </Link>
              <p className="mt-2 text-sm text-slate-700">{selected.issue}</p>
              <div className="mt-3 flex gap-2">
                <StatusBadge status={selected.status || 'PENDING'} />
                <PriorityBadge priority={selected.priority} />
              </div>
              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                <p className="font-semibold text-slate-700">Location</p>
                <p className="mt-1">{selected.location?.address || selected.location?.city || 'Address unavailable'}</p>
                <p className="mt-1 font-mono text-[11px] text-slate-500">
                  {selected.location?.latitude}, {selected.location?.longitude}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-5 text-sm text-slate-500">Select a marker or report below.</div>
          )}

          <div className="divide-y divide-slate-100">
            {reports.map((report) => (
              <button
                key={report.reportId}
                type="button"
                onClick={() => setSelected(report)}
                className={`block w-full p-4 text-left transition-colors ${
                  selected?.reportId === report.reportId ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-navy-950">{report.issue}</p>
                    <p className="mt-1 text-xs text-slate-500">{report.reportId}</p>
                  </div>
                  <PriorityBadge priority={report.priority} />
                </div>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <StatusBadge status={report.status || 'PENDING'} />
                  <span className="text-[11px] text-slate-400">{report.category}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function MapCanvas({ reports, selected, setSelected, loading }) {
  return (
    <div className="relative min-h-[560px] overflow-hidden rounded-xl border border-slate-200 bg-slate-200 shadow-card">
      {loading && (
        <p className="absolute left-4 top-4 z-10 rounded-lg bg-white px-3 py-2 text-xs text-slate-600 shadow">
          Loading reports...
        </p>
      )}

      <div className="h-[560px] w-full">
        <AdminLeafletMap reports={reports} selected={selected} onSelect={setSelected} />
      </div>
    </div>
  );
}
