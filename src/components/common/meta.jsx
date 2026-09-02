import Badge from './Badge'
import { STATUS_META, SEVERITY_META } from '../../constants'

export function StatusBadge({ status, className = '' }) {
  const meta = STATUS_META[status] ?? { tone: 'slate' }
  return (
    <Badge tone={meta.tone} dot className={className}>
      {status}
    </Badge>
  )
}

export function SeverityBadge({ severity, emergency, className = '' }) {
  const meta = SEVERITY_META[severity] ?? SEVERITY_META.Medium
  return (
    <Badge tone={emergency ? 'red' : meta.tone} dot className={className}>
      {emergency ? 'Emergency' : meta.label}
    </Badge>
  )
}

// colour used across maps, charts and gauges for a complaint
export function complaintColor(c) {
  if (c.status === 'Resolved') return '#059669'
  if (c.emergency || c.severity === 'Critical') return '#dc2626'
  if (c.severity === 'High') return '#ea580c'
  if (c.severity === 'Medium') return '#d97706'
  return '#2563eb'
}

export function priorityColor(p) {
  if (p >= 95) return '#dc2626'
  if (p >= 76) return '#ea580c'
  if (p >= 48) return '#d97706'
  return '#2563eb'
}
