'use client';

import Link from 'next/link';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAdminReports, StatusBadge, PriorityBadge, formatDate } from '@/components/admin/AdminData';

export default function AdminDashboard() {
  let { user } = useAuth();
  let { data, loading, error, reload } = useAdminReports('?limit=8');
  let stats = data?.stats || {};
  let cards = [['Total reports', data?.total || 0], ['Pending', stats.PENDING || 0], ['In progress', stats.IN_PROGRESS || 0], ['Resolved', stats.RESOLVED || 0], ['Urgent+', (data?.priorityStats?.Emergency || 0) + (data?.priorityStats?.High || 0)]];
  return <div><header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold text-civic-blue">Operations overview</p><h1 className="mt-1 text-3xl font-bold text-navy-950">Dashboard</h1><p className="mt-1 text-sm text-slate-500">{user?.department ? `${user.department} queue` : 'All CivicAI reports'}</p></div><button className="btn btn-outline px-3 py-2" onClick={reload} disabled={loading}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} />Refresh</button></header>{error && <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{cards.map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card"><p className="text-sm text-slate-500">{label}</p><p className="mt-3 text-3xl font-bold text-navy-950">{loading ? '—' : value}</p></div>)}</div><section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-card"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-navy-950">Recent reports</h2><Link href="/admin/reports" className="flex items-center gap-1 text-sm font-semibold text-civic-blue">View all <ArrowRight size={15} /></Link></div>{!loading && !data?.reports?.length ? <p className="px-5 py-10 text-center text-sm text-slate-500">No reports in this queue.</p> : <div className="divide-y divide-slate-100">{(data?.reports || []).map((report) => <Link key={report.reportId} href={`/admin/reports/${report.reportId}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50"><div><p className="font-semibold text-navy-950">{report.issue}</p><p className="mt-1 text-xs text-slate-500">{report.reportId} · {formatDate(report.createdAt)}</p></div><div className="flex items-center gap-2"><PriorityBadge value={report.priority} /><StatusBadge value={report.status} /></div></Link>)}</div>}</section></div>;
}
