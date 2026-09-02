import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { mockComplaints } from '../data/mockData'

const AppCtx = createContext(null)

const readHash = () => {
  const raw = window.location.hash.replace(/^#/, '') || '/'
  const [path, query = ''] = raw.split('?')
  return { path: path || '/', query }
}

const parseQuery = (q) =>
  Object.fromEntries(new URLSearchParams(q).entries())

export function AppProvider({ children }) {
  const [{ path, query }, setRoute] = useState(readHash)
  const [complaints, setComplaints] = useState(mockComplaints)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const onHash = () => {
      setRoute(readHash())
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = useCallback((to) => {
    window.location.hash = to
  }, [])

  const addComplaint = useCallback((complaint) => {
    setComplaints((prev) => [complaint, ...prev])
  }, [])

  const updateComplaint = useCallback((id, patch) => {
    setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const pushToast = useCallback(
    (toast) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((prev) => [...prev.slice(-3), { id, tone: 'success', ...toast }])
      window.setTimeout(() => dismissToast(id), 4500)
    },
    [dismissToast],
  )

  const value = useMemo(
    () => ({
      path,
      queryParams: parseQuery(query),
      navigate,
      complaints,
      addComplaint,
      updateComplaint,
      toasts,
      pushToast,
      dismissToast,
    }),
    [path, query, navigate, complaints, addComplaint, updateComplaint, toasts, pushToast, dismissToast],
  )

  return (
    <AppCtx.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </AppCtx.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

const TONE_STYLES = {
  success: { icon: CheckCircle2, cls: 'border-emerald-200 bg-emerald-50 text-emerald-900', iconCls: 'text-emerald-600' },
  error: { icon: AlertTriangle, cls: 'border-red-200 bg-red-50 text-red-900', iconCls: 'text-red-600' },
  emergency: { icon: AlertTriangle, cls: 'border-red-300 bg-red-600 text-white', iconCls: 'text-white' },
  info: { icon: Info, cls: 'border-blue-200 bg-blue-50 text-blue-900', iconCls: 'text-blue-600' },
}

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-2.5"
    >
      {toasts.map((t) => {
        const tone = TONE_STYLES[t.tone] ?? TONE_STYLES.info
        const Icon = tone.icon
        return (
          <div
            key={t.id}
            role="status"
            className={`animate-scale-in flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-pop ${tone.cls}`}
          >
            <Icon size={18} className={`mt-0.5 shrink-0 ${tone.iconCls}`} aria-hidden />
            <div className="flex-1">
              <p className="font-semibold">{t.title}</p>
              {t.message && <p className="mt-0.5 text-xs opacity-80">{t.message}</p>}
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="shrink-0 rounded p-0.5 opacity-60 transition hover:opacity-100"
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
