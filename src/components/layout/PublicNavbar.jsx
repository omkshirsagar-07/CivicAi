import { useState } from 'react'
import { Menu, X, Siren, LayoutDashboard } from 'lucide-react'
import Logo from '../common/Logo'
import Button from '../common/Button'
import { PUBLIC_NAV } from '../../constants'
import { useApp } from '../../context/AppContext'

export default function PublicNavbar() {
  const [open, setOpen] = useState(false)
  const { path } = useApp()

  const isActive = (to) => (to === '/' ? path === '/' : path.startsWith(to.split('?')[0]))

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="#/" aria-label="CivicAI home" className="shrink-0">
          <Logo />
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {PUBLIC_NAV.map((item) => {
            const emergencyLink = item.label === 'Emergency'
            return (
              <a
                key={item.label}
                href={`#${item.to}`}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  emergencyLink
                    ? 'text-red-600 hover:bg-red-50'
                    : isActive(item.to)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-navy-900'
                }`}
              >
                {emergencyLink && <Siren size={14} className="mr-1 inline -translate-y-px" />}
                {item.label}
              </a>
            )
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button to="/login" variant="ghost" size="sm">Login</Button>
          <Button to="/register" variant="primary" size="sm">Register</Button>
          <Button to="/admin" variant="outline" size="sm" icon={LayoutDashboard}>
            Admin
          </Button>
        </div>

        <button
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="animate-fade-in border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {PUBLIC_NAV.map((item) => (
              <a
                key={item.label}
                href={`#${item.to}`}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${
                  item.label === 'Emergency' ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label === 'Emergency' && <Siren size={14} className="mr-2 inline" />}
                {item.label}
              </a>
            ))}
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
              <Button to="/login" variant="outline" size="sm" onClick={() => setOpen(false)}>Login</Button>
              <Button to="/register" variant="primary" size="sm" onClick={() => setOpen(false)}>Register</Button>
              <Button to="/admin" variant="navy" size="sm" onClick={() => setOpen(false)}>Admin</Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
