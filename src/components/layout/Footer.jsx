import Logo from '../common/Logo'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-content gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
            CivicAI is an AI-powered smart grievance and emergency response platform that helps
            citizens report local issues by voice, text, image or location — and routes them to the
            right authority instantly.
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            An initiative towards smarter, responsive cities
          </p>
        </div>
        <div>
          <h4 className="text-sm font-bold text-navy-900">Citizens</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><a className="hover:text-blue-700" href="#/report">Report an Issue</a></li>
            <li><a className="hover:text-blue-700" href="#/track">Track Complaint</a></li>
            <li><a className="hover:text-blue-700" href="#/map">Live Civic Map</a></li>
            <li><a className="font-semibold text-red-600 hover:text-red-700" href="#/report?emergency=1">Report Emergency</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold text-navy-900">Emergency Hotlines</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li>Fire — <span className="font-mono font-semibold text-slate-700">101</span></li>
            <li>Ambulance — <span className="font-mono font-semibold text-slate-700">108</span></li>
            <li>Police — <span className="font-mono font-semibold text-slate-700">100</span></li>
            <li>Electricity — <span className="font-mono font-semibold text-slate-700">1912</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © 2026 CivicAI · Smart Grievance &amp; Emergency Response System · Demo build with simulated AI services
      </div>
    </footer>
  )
}
