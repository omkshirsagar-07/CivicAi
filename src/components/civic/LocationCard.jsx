import { useEffect, useState } from 'react'
import { LocateFixed, MapPin, Loader2, CheckCircle2, Navigation } from 'lucide-react'

// Aurangabad / Chhatrapati Sambhajinagar fallback coords (simulated GPS)
const FALLBACK = { lat: 19.8762, lng: 75.3433, address: 'Jalna Road, near Kranti Chowk', area: 'Kranti Chowk' }

export default function LocationCard({ location, onLocationChange, compact = false }) {
  const [status, setStatus] = useState('detecting') // detecting | ready | error

  useEffect(() => {
    if (location) {
      setStatus('ready')
      return undefined
    }
    let cancelled = false
    const failTimer = window.setTimeout(() => {
      if (cancelled) return
      setStatus('ready')
      onLocationChange?.(FALLBACK)
    }, 1800)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return
          clearTimeout(failTimer)
          // Real GPS coordinates; nearest mock civic address for demo purposes
          onLocationChange?.({ ...FALLBACK, lat: +pos.coords.latitude.toFixed(4), lng: +pos.coords.longitude.toFixed(4) })
          setStatus('ready')
        },
        () => {
          // permission denied → simulated location keeps the demo flowing
        },
        { timeout: 2500 },
      )
    }
    return () => {
      cancelled = true
      clearTimeout(failTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const redetect = () => {
    setStatus('detecting')
    window.setTimeout(() => {
      onLocationChange?.(FALLBACK)
      setStatus('ready')
    }, 1200)
  }

  const detecting = status === 'detecting'

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h3 className="section-title flex items-center gap-2">
          <MapPin size={18} className="text-blue-600" aria-hidden /> Issue Location
        </h3>
        {status === 'ready' ? (
          <span className="chip bg-emerald-50 text-emerald-700">
            <CheckCircle2 size={13} /> Location detected
          </span>
        ) : (
          <span className="chip bg-sky-50 text-sky-700">
            <Loader2 size={13} className="animate-spin" /> Detecting…
          </span>
        )}
      </div>

      <div className={compact ? 'p-4' : 'p-5'}>
        {/* Stylised map preview */}
        <div className="relative mb-4 h-36 overflow-hidden rounded-lg border border-slate-200 bg-[#f1f5fa]">
          <svg viewBox="0 0 320 140" className="h-full w-full" aria-hidden="true">
            <rect width="320" height="140" fill="#eef3f9" />
            <path d="M-10 100 L330 40" stroke="#d7e1ee" strokeWidth="14" strokeLinecap="round" />
            <path d="M60 -10 L120 150" stroke="#dde6f1" strokeWidth="10" strokeLinecap="round" />
            <path d="M-10 30 L330 120" stroke="#e2e9f3" strokeWidth="8" strokeLinecap="round" />
            <path d="M220 -10 L260 150" stroke="#e2e9f3" strokeWidth="9" strokeLinecap="round" />
            <rect x="130" y="55" width="46" height="34" rx="4" fill="#dfe8f2" />
            <rect x="185" y="60" width="40" height="30" rx="4" fill="#e3ebf4" />
            <path d="M160 118 L210 130 L150 140 Z" fill="#bcd8f7" opacity="0.7" />
          </svg>
          {!detecting && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full animate-fade-in">
              <span className="relative flex h-4 w-4">
                <span className="marker-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-60" />
                <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow" />
              </span>
            </div>
          )}
          <span className="absolute bottom-2 right-2 chip bg-white/90 text-slate-500 shadow-sm">
            <Navigation size={11} /> Live GPS
          </span>
        </div>

        {detecting ? (
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin text-blue-600" />
            Acquiring location from device GPS…
          </div>
        ) : (
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Address</dt>
              <dd className="font-semibold text-navy-900">{location?.address ?? FALLBACK.address}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Latitude</dt>
              <dd className="font-mono font-semibold text-slate-700">{(location?.lat ?? FALLBACK.lat).toFixed(4)}° N</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Longitude</dt>
              <dd className="font-mono font-semibold text-slate-700">{(location?.lng ?? FALLBACK.lng).toFixed(4)}° E</dd>
            </div>
          </dl>
        )}

        <button
          type="button"
          onClick={redetect}
          disabled={detecting}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-60"
        >
          <LocateFixed size={16} /> Use My Location
        </button>
      </div>
    </div>
  )
}
