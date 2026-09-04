'use client';

import { useEffect, useState } from 'react';
import { fetchJson } from '@/utils/client';

export function useAdminReports(query = '') {
  let [state, setState] = useState({ loading: true, error: '', data: null });
  async function load() {
    setState((current) => ({ ...current, loading: true, error: '' }));
    try { let data = await fetchJson(`/api/admin/reports${query}`); setState({ loading: false, error: '', data }); }
    catch (err) { setState({ loading: false, error: err.message || 'Reports could not be loaded.', data: null }); }
  }
  useEffect(() => { load(); }, [query]);
  return { ...state, reload: load };
}

export function StatusBadge({ value }) { let tone = value === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : value === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'; return <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-bold ${tone}`}>{value || 'PENDING'}</span>; }
export function PriorityBadge({ value }) { let tone = value === 'Emergency' ? 'bg-red-50 text-red-700 border-red-200' : value === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' : value === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-sky-50 text-sky-700 border-sky-200'; return <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-bold ${tone}`}>{value}</span>; }
export function formatDate(value) { return value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'; }
