import { useMemo } from 'react'
import { FileText, Activity, Siren, CheckCircle2, ArrowRight, Flame } from 'lucide-react'
import KpiCard from '../../components/dashboard/KpiCard'
import { DepartmentBarChart, PriorityDonut, TrendChart } from '../../components/dashboard/Charts'
import ComplaintCard from '../../components/civic/ComplaintCard'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import { DEPARTMENTS, CATEGORY_COLORS } from '../../constants'
import { useApp } from '../../context/AppContext'

const TREND = [
  { label: 'Mon', value: 142 },
  { label: 'Tue', value: 168 },
  { label: 'Wed', value: 155 },
  { label: 'Thu', value: 197 },
  { label: 'Fri', value: 224 },
  { label: 'Sat', value: 176 },
  { label: 'Sun', value: 218 },
]

export default function Dashboard() {
  const { complaints, navigate } = useApp()

  const stats = useMemo(() => {
    const active = complaints.filter((c) => c.status !== 'Resolved').length
    const emergency = complaints.filter((c) => c.emergency && c.status !== 'Resolved').length
    const resolved = complaints.filter((c) => c.status === 'Resolved').length
    const byDept = DEPARTMENTS.slice(0, 6)
      .map((d) => ({
        label: d.category,
        value: complaints.filter((c) => c.category === d.category).length + 120 + (d.category.length % 5) * 24,
        color: CATEGORY_COLORS[d.category] ?? '#2563eb',
      }))
      .sort((a, b) => b.value - a.value)
    const donut = [
      { label: 'Emergency', value: 18, color: '#dc2626' },
      { label: 'High', value: 126, color: '#ea580c' },
      { label: 'Medium', value: 184, color: '#d97706' },
      { label: 'Low', value: 116, color: '#2563eb' },
      { label: 'Resolved', value: 840, color: '#059669' },
    ]
    return { active, emergency, resolved, byDept, donut }
  }, [complaints])

  const activeEmergencies = complaints.filter((c) => c.emergency && c.status !== 'Resolved')
  const recent = complaints.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Emergency banner */}
      {activeEmergencies.length > 0 && (
        <div className="animate-fade-in flex flex-col items-start gap-3 rounded-xl border border-red-300 bg-red-600 p-4 text-white shadow-emergency sm:flex-row sm:items-center">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15">
            <Siren size={22} />
          </span>
          <div className="flex-1">
            <p className="font-extrabold">{stats.emergency} active emergency {stats.emergency === 1 ? 'case' : 'cases'} require immediate attention</p>
            <p className="text-sm text-red-100">{activeEmergencies.map((e) => e.title).join(' · ')}</p>
          </div>
          <Button variant="navy" size="sm" className="bg-white !text-red-700 hover:bg-red-50" to="/admin/emergency" iconRight={ArrowRight}>
            Open Emergency Desk
          </Button>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={FileText} label="Total Complaints" value="1,284" delta="12.4%" deltaUp tone="blue" hint="vs last month" />
        <KpiCard icon={Activity} label="Active Issues" value={426} delta="4.1%" deltaUp={false} tone="amber" hint="being worked on" />
        <KpiCard icon={Siren} label="Emergency Cases" value={18} delta="3 new" deltaUp tone="red" hint="last 24 hours" />
        <KpiCard icon={CheckCircle2} label="Resolved" value="840" delta="8.7%" deltaUp tone="emerald" hint="resolution rate 94%" />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="section-title">Complaint Trends</h2>
              <p className="text-xs text-slate-400">New reports over the last 7 days</p>
            </div>
            <Badge tone="emerald" dot>+18% this week</Badge>
          </div>
          <TrendChart data={TREND} />
        </div>
        <div className="card p-5">
          <h2 className="section-title">Priority Distribution</h2>
          <p className="mb-4 text-xs text-slate-400">All open &amp; resolved reports</p>
          <PriorityDonut data={stats.donut} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Department bars */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="section-title">Complaints by Department</h2>
              <p className="text-xs text-slate-400">Routed volume across civic departments</p>
            </div>
            <Button variant="ghost" size="sm" to="/admin/analytics" iconRight={ArrowRight}>Analytics</Button>
          </div>
          <DepartmentBarChart data={stats.byDept} />
        </div>

        {/* Recent complaints */}
        <div className="card">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
            <h2 className="font-bold text-navy-900">Latest Reports</h2>
            <Button variant="ghost" size="sm" to="/admin/complaints">View all</Button>
          </div>
          <div className="space-y-3 p-4">
            {recent.map((c) => (
              <ComplaintCard key={c.id} complaint={c} onClick={() => navigate(`/admin/complaints/${c.id}`)} />
            ))}
          </div>
        </div>
      </div>

      {/* Quick emergency reminder */}
      <div className="card flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600">
          <Flame size={20} />
        </span>
        <div className="flex-1">
          <p className="font-bold text-navy-900">Emergency pipeline is live</p>
          <p className="text-sm text-slate-500">
            Fire, medical and safety complaints bypass the standard queue and trigger instant dispatch to Fire (101),
            Ambulance (108) and Police (100).
          </p>
        </div>
        <Button variant="outline" size="sm" to="/admin/emergency">Emergency Desk</Button>
      </div>
    </div>
  )
}
