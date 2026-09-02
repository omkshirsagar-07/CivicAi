import { useState } from 'react'
import {
  LayoutDashboard, FileText, Siren, Map as MapIcon, Building2, BarChart3, Users, Settings,
  Search, Bell, Menu, X, LogOut, ChevronDown, ExternalLink,
} from 'lucide-react'
import Logo from '../common/Logo'
import { ADMIN_NAV } from '../../constants'
import { mockNotifications } from '../../data/mockData'
import { useApp } from '../../context/AppContext'

const ICONS = {
  'layout-dashboard': LayoutDashboard,
  'file-text': FileText,
  siren: Siren,
  map: MapIcon,
  'building-2': Building2,
  'bar-chart-3': BarChart3,
  users: Users,
  settings: Settings,
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

function SidebarContent({ path, onNavigate }) {
  const isActive = (item) => (item.end ? path === item.to : path.startsWith(item.to))
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-navy-800/60 px-5">
        <a href="#/" onClick={onNavigate}>
          <Logo light />
        </a>
      </div>
      <div className="px-4 pt-4">
        <p className="px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300/70">Control Center</p>
      </div>
      <nav className="mt-2 flex-1 space-y-1 px-3" aria-label="Admin navigation">
        {ADMIN_NAV.map((item) => {
          const Icon = ICONS[item.icon]
          const active = isActive(item)
          const emergency = item.to === '/admin/emergency'
          return (
            <a
              key={item.to}
              href={`#${item.to}`}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? emergency
                    ? 'bg-red-600 text-white'
                    : 'bg-blue-600 text-white'
                  : emergency
                    ? 'text-red-300 hover:bg-navy-800 hover:text-red-200'
                    : 'text-navy-100/80 hover:bg-navy-800 hover:text-white'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={17} />
              {item.label}
              {emergency && <span className="ml-auto h-2 w-2 rounded-full bg-red-400" aria-hidden />}
            </a>
          )
        })}
      </nav>
      <div className="border-t border-navy-800/60 p-3">
        <a
          href="#/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-navy-100/80 transition hover:bg-navy-800 hover:text-white"
        >
          <ExternalLink size={17} /> Citizen Portal
        </a>
        <a
          href="#/login"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-navy-100/80 transition hover:bg-navy-800 hover:text-white"
        >
          <LogOut size={17} /> Sign Out
        </a>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }) {
  const { path } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const unread = mockNotifications.filter((n) => n.unread).length

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-navy-900 lg:block">
        <SidebarContent path={path} />
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="animate-fade-in absolute inset-0 bg-navy-950/50" onClick={() => setMobileOpen(false)} />
          <aside className="animate-fade-up absolute inset-y-0 left-0 w-72 bg-navy-900 shadow-pop">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-navy-100 hover:bg-navy-800"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            <SidebarContent path={path} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
          <button
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open admin menu"
          >
            <Menu size={21} />
          </button>

          <div>
            <h1 className="text-base font-extrabold text-navy-900 sm:text-lg">
              {greeting()}, Administrator
            </h1>
            <p className="hidden text-xs text-slate-400 sm:block">Municipal Control Room · Chhatrapati Sambhajinagar</p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <label className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search complaints, citizens…"
                className="w-56 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                aria-label="Search"
              />
            </label>

            <div className="relative">
              <button
                onClick={() => setNotifOpen((o) => !o)}
                className="relative rounded-lg p-2.5 text-slate-500 transition hover:bg-slate-100"
                aria-label={`Notifications, ${unread} unread`}
                aria-expanded={notifOpen}
              >
                <Bell size={19} />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="animate-scale-in absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-pop">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="text-sm font-bold text-navy-900">Notifications</p>
                    </div>
                    <ul className="max-h-80 overflow-y-auto">
                      {mockNotifications.map((n) => (
                        <li key={n.id} className="flex gap-3 border-b border-slate-50 px-4 py-3 last:border-0 hover:bg-slate-50">
                          <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${n.unread ? 'bg-blue-600' : 'bg-slate-300'}`} />
                          <div>
                            <p className="text-sm font-medium text-slate-800">{n.title}</p>
                            <p className="mt-0.5 text-xs text-slate-400">{n.time}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>

            <button className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-slate-100">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-navy-900 text-sm font-bold text-white">A</span>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-bold text-navy-900">Admin Officer</span>
                <span className="block text-[11px] text-slate-400">Control Room</span>
              </span>
              <ChevronDown size={15} className="hidden text-slate-400 sm:block" />
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
