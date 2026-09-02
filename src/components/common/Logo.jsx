export default function Logo({ compact = false, light = false, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-600 shadow-sm">
        <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
          <path
            d="M16 5.5l8.5 3.2v6.6c0 5.4-3.6 9.2-8.5 11.3-4.9-2.1-8.5-5.9-8.5-11.3V8.7z"
            fill="white"
            opacity="0.96"
          />
          <circle cx="16" cy="15" r="2.7" fill="#1d4ed8" />
          <path d="M16 10.6v-3.4M20.4 15h3.4M16 19.4v3.4M11.6 15H8.2" stroke="#1d4ed8" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className={`block text-[17px] font-extrabold tracking-tight ${light ? 'text-white' : 'text-navy-900'}`}>
            Civic<span className="text-blue-600">AI</span>
          </span>
          <span className={`block text-[10px] font-semibold uppercase tracking-[0.14em] ${light ? 'text-blue-100' : 'text-slate-400'}`}>
            Smart Civic Response
          </span>
        </span>
      )}
    </span>
  )
}
