'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { Info, Loader2, MapPin } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { cn, PRIORITY_STYLE, formatReportTime } from '@/utils/client';

const LiveCivicLeafletMap = dynamic(() => import('./LiveCivicLeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-slate-500">
      <Loader2 size={18} className="mr-2 animate-spin" aria-hidden />
      Loading civic issues…
    </div>
  ),
});

const COLOR_HEX = {
  red: '#dc2626',
  orange: '#ea580c',
  amber: '#d97706',
  sky: '#0284c7',
};

function pinSvg(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40"><path d="M15 39C15 39 27 25 27 15a12 12 0 1 0-24 0c0 10 12 24 12 24Z" fill="${color}"/><circle cx="15" cy="15" r="5" fill="#fff"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/** Demo sample markers — only shown when no real reports exist yet. */
const DEMO_MARKERS = [
  { issue: 'Water pipeline leakage near bus stand (sample)', category: 'Water Supply', priority: 'High', severity: 8, demo: true, location: { latitude: 19.1089, longitude: 74.7549 }, createdAt: null },
  { issue: 'Garbage accumulation near market (sample)', category: 'Waste Management', priority: 'Medium', severity: 6, demo: true, location: { latitude: 19.092, longitude: 74.772 }, createdAt: null },
  { issue: 'Street light not working (sample)', category: 'Street Lights', priority: 'Low', severity: 3, demo: true, location: { latitude: 19.119, longitude: 74.739 }, createdAt: null },
  { issue: 'Fire reported near central market (sample)', category: 'Fire', priority: 'Emergency', severity: 10, demo: true, location: { latitude: 19.099, longitude: 74.761 }, createdAt: null },
];

function toMiniMap(markers) {
  if (!markers.length) return [];
  const lats = markers.map((m) => m.location.latitude);
  const lngs = markers.map((m) => m.location.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const padLat = (maxLat - minLat || 0.02) * 0.25;
  const padLng = (maxLng - minLng || 0.02) * 0.25;
  const W = 400;
  const H = 300;
  return markers.map((m) => {
    const x = ((m.location.longitude - (minLng - padLng)) / (maxLng - minLng + padLng * 2 || 1)) * W;
    const y = ((maxLat + padLat - m.location.latitude) / (maxLat - minLat + padLat * 2 || 1)) * H;
    const tone = PRIORITY_STYLE[m.priority]?.tone || 'sky';
    return { x: Math.max(10, Math.min(W - 10, x)), y: Math.max(10, Math.min(H - 10, y)), color: tone };
  });
}

export default function PublicCivicMap() {
  const [realMarkers, setRealMarkers] = useState([]);
  const [loadState, setLoadState] = useState('loading'); // loading | ready | unavailable
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('All');
  const [useDemo, setUseDemo] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch('/api/map')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (data?.ok && data.available && Array.isArray(data.markers) && data.markers.length) {
          setRealMarkers(data.markers);
          setLoadState('ready');
          setUseDemo(false);
        } else {
          setRealMarkers([]);
          setLoadState('ready');
          setUseDemo(true);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setLoadState('ready');
        setUseDemo(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const displayMarkers = useMemo(() => (useDemo ? DEMO_MARKERS : realMarkers), [useDemo, realMarkers]);
  const filtered = useMemo(() => {
    if (filter === 'All') return displayMarkers;
    return displayMarkers.filter((m) => m.priority === filter);
  }, [filter, displayMarkers]);

  const miniDots = toMiniMap(filtered);

  const filters = ['All', 'Emergency', 'High', 'Medium', 'Low'];
  const countOf = (f) => (f === 'All' ? displayMarkers.length : displayMarkers.filter((m) => m.priority === f).length);

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      {/* Sidebar */}
      <aside className="order-2 lg:order-1">
        <div className="card !p-0">
          <div className="border-b border-slate-100 px-4 py-3.5">
            <p className="text-[14px] font-bold text-slate-900">Reported issues</p>
            <p className="text-[12px] text-slate-400">
              {useDemo ? 'No real reports yet — sample markers shown' : `${realMarkers.length} civic reports (privacy-safe)`}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 border-b border-slate-100 px-4 py-3">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  'rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors',
                  filter === f
                    ? 'border-navy-900 bg-navy-900 text-white'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                )}
              >
                {f}
                <span className={cn('ml-1', filter === f ? 'text-sky-200' : 'text-slate-400')}>{countOf(f)}</span>
              </button>
            ))}
          </div>

          <ul className="max-h-[420px] divide-y divide-slate-50 overflow-y-auto">
            {filtered.length === 0 && (
              <li className="px-4 py-10 text-center text-[13px] text-slate-400">
                No issues in this category right now.
              </li>
            )}
            {filtered.map((m) => {
              const tone = PRIORITY_STYLE[m.priority]?.tone || 'sky';
              const active = selected === m;
              return (
                <li key={m.issue + (m.location.latitude || '')} className={cn('px-4 py-3 transition-colors', active ? 'bg-blue-50/50' : 'hover:bg-slate-50')}>
                  <button type="button" onClick={() => setSelected(m)} className="block w-full text-left">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13.5px] font-semibold leading-snug text-slate-800">{m.issue}</p>
                      <Badge tone={tone} uppercase className="shrink-0 !text-[9.5px]">
                        {m.priority}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[12px] text-slate-400">
                      {m.category}
                      {m.createdAt ? ` · ${formatReportTime(m.createdAt)}` : ' · sample'}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex items-start gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3">
            <Info size={14} className="mt-0.5 shrink-0 text-civic-blue" aria-hidden />
            <p className="text-[11.5px] leading-relaxed text-slate-500">
              The map shows only the issue, category, priority and approximate location. Citizen
              names and personal details are never published.
            </p>
          </div>
        </div>
      </aside>

      {/* Map */}
      <div className="order-1 lg:order-2">
        <div className="relative h-[440px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-card lg:h-[640px]">
          {loadState === 'loading' && (
            <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 size={18} className="animate-spin" aria-hidden /> Loading civic issues…
            </div>
          )}

          {loadState === 'ready' && (
            <div className="absolute inset-0 h-full w-full">
              <LiveCivicLeafletMap markers={filtered} selected={selected} onSelect={setSelected} />
            </div>
          )}

          {loadState === 'ready' && (
            <span className="absolute left-3 top-3 z-[500] flex items-center gap-1.5 rounded-full border border-white/80 bg-white/95 px-3 py-1.5 text-[12px] font-semibold text-slate-700 shadow-sm">
              <MapPin size={13} className="text-blue-700" aria-hidden />
              {filtered.length} marker{filtered.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        <p className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[12px] text-slate-400">
          <span>
            <span className="font-semibold text-slate-500">Legend:</span> red emergency · orange
            high · amber medium · blue low
          </span>
          {useDemo && <span>Sample markers appear until the first real report is submitted.</span>}
        </p>
      </div>
    </div>
  );
}
