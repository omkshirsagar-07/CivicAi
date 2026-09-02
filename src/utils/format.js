export function timeAgo(isoString) {
  const date = new Date(isoString)
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`
  const days = Math.floor(diff / 86400)
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export function genComplaintId(existing) {
  const max = existing.reduce((acc, c) => {
    const n = Number(c.id.split('-').pop())
    return Number.isFinite(n) ? Math.max(acc, n) : acc
  }, 923)
  return `CIV-2026-${String(max + 1).padStart(4, '0')}`
}
