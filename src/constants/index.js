// ---------------------------------------------------------------------------
// CivicAI domain constants — single source of truth for categories, statuses,
// priorities and navigation. Replaceable by API data later without touching UI.
// ---------------------------------------------------------------------------

export const STAGES = [
  { key: 'submitted', label: 'Submitted', desc: 'Complaint registered on CivicAI' },
  { key: 'ai-analysis', label: 'AI Analysis', desc: 'Classified & prioritized by AI' },
  { key: 'assigned', label: 'Department Assigned', desc: 'Routed to responsible authority' },
  { key: 'review', label: 'Under Review', desc: 'Officer verifying the complaint' },
  { key: 'progress', label: 'In Progress', desc: 'Resolution work underway' },
  { key: 'resolved', label: 'Resolved', desc: 'Issue closed and verified' },
]

export const STATUS_META = {
  Submitted: { tone: 'slate', stage: 0 },
  'AI Analysis': { tone: 'sky', stage: 1 },
  'Department Assigned': { tone: 'blue', stage: 2 },
  'Under Review': { tone: 'indigo', stage: 3 },
  'In Progress': { tone: 'blue', stage: 4 },
  Resolved: { tone: 'emerald', stage: 5 },
}

// severity drives priority colour
export const SEVERITY_META = {
  Critical: { tone: 'red', label: 'Emergency', min: 95, max: 99 },
  High: { tone: 'orange', label: 'High', min: 76, max: 92 },
  Medium: { tone: 'amber', label: 'Medium', min: 48, max: 74 },
  Low: { tone: 'sky', label: 'Low', min: 24, max: 47 },
}

export const PRIORITY_LEGEND = [
  { key: 'emergency', label: 'Emergency', color: '#dc2626' },
  { key: 'high', label: 'High Priority', color: '#ea580c' },
  { key: 'medium', label: 'Medium Priority', color: '#d97706' },
  { key: 'low', label: 'Low Priority', color: '#2563eb' },
  { key: 'resolved', label: 'Resolved', color: '#059669' },
]

export const DEPARTMENTS = [
  { name: 'Municipal Corporation — Sanitation', category: 'Waste Management', icon: 'trash', hotline: '1800-120-2225' },
  { name: 'Water Supply Department', category: 'Water Supply', icon: 'droplet', hotline: '1800-120-2230' },
  { name: 'Roads & Infrastructure Department', category: 'Road Damage', icon: 'construction', hotline: '1800-120-2240' },
  { name: 'Electricity Distribution (MSEDCL)', category: 'Streetlight & Electricity', icon: 'zap', hotline: '1912' },
  { name: 'Drainage & Sewerage Division', category: 'Drainage & Sewerage', icon: 'waves', hotline: '1800-120-2255' },
  { name: 'Fire & Emergency Services', category: 'Fire Emergency', icon: 'flame', hotline: '101' },
  { name: 'Health & Emergency Services', category: 'Medical Emergency', icon: 'heart-pulse', hotline: '108' },
  { name: 'Traffic & Police Department', category: 'Public Safety', icon: 'shield', hotline: '100' },
]

export const CATEGORY_COLORS = {
  'Waste Management': '#64748b',
  'Water Supply': '#0284c7',
  'Road Damage': '#b45309',
  'Streetlight & Electricity': '#ca8a04',
  'Drainage & Sewerage': '#0d9488',
  'Fire Emergency': '#dc2626',
  'Medical Emergency': '#e11d48',
  'Public Safety': '#1d4ed8',
}

export const PUBLIC_NAV = [
  { label: 'Home', to: '/' },
  { label: 'Report Issue', to: '/report' },
  { label: 'Track Complaint', to: '/track' },
  { label: 'Live Map', to: '/map' },
  { label: 'Emergency', to: '/report?emergency=1' },
  { label: 'About', to: '/about' },
]

export const ADMIN_NAV = [
  { label: 'Dashboard', to: '/admin', icon: 'layout-dashboard', end: true },
  { label: 'Complaints', to: '/admin/complaints', icon: 'file-text' },
  { label: 'Emergency Cases', to: '/admin/emergency', icon: 'siren' },
  { label: 'Live Map', to: '/admin/map', icon: 'map' },
  { label: 'Departments', to: '/admin/departments', icon: 'building-2' },
  { label: 'Analytics', to: '/admin/analytics', icon: 'bar-chart-3' },
  { label: 'Users', to: '/admin/users', icon: 'users' },
  { label: 'Settings', to: '/admin/settings', icon: 'settings' },
]

export const VOICE_SAMPLE =
  'There is a major water pipeline leakage near the bus stand. Water is flooding the road and traffic is affected.'

export const EMERGENCY_SAMPLE =
  'There is a fire in a building near the market. People are trapped on the first floor and smoke is spreading fast.'
