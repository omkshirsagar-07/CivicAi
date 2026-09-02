import { useMemo } from 'react'
import { BarChart3, Clock, CheckCircle2, TrendingUp, Gauge } from 'lucide-react'
import { DepartmentBarChart, PriorityDonut, TrendChart } from '../../components/dashboard/Charts'
import KpiCard from '../../components/dashboard/KpiCard'
import { DEPARTMENTS, CATEGORY_COLORS } from '../../constants'
import { useApp } from '../../context/AppContext'

const MONTHLY = [
  { label: 'W1', value: 420 },
  { label: 'W2', value: 510 },
  { label: 'W3', value: 468 },
  { label: 'W4', value: 592 },
  { label: 'W5', value: 540 },
  { label: 'W6', value: 635 },
  { label: 'W7', value: 701 },
  { label: 'W8', value: 758 },
]

export default function Analytics() {
  const { complaints } = useApp()

  const byDept = useMemo(
    () =>
      DEPARTMENTS.map((d) => ({
        label: d.category,
        value: complaints.filter((c) => c.category === d.category).length + 40 + (d.category.length % 7) * 22,
        color: CATEGORY_COLORS[d.category] ?? '#2563eb',
      })).sort((a, b) => b.value - a.value),
    [complaints],
  )

  const donut = useMemo(() => [
    { label: 'Emergency', value: 18, color: '#dc2626' },
    { label: 'High', value: 126, color: '#ea580c' },
    { label: 'Medium', value: 184, color: '#d97706' },
    { label: 'Low', value: 116, color: '#2563eb' },
    { label: 'Resolved', value: 840, color: '#059669' },
  ], [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-navy-950">
          <BarChart3 size={22} className="text-blue-600" /> Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-500">Department workload, priority mix and complaint trends across the city.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={TrendingUp} label="Avg. Reports / Day" value="214" delta="9.2%" deltaUp tone="blue" />
        <KpiCard icon={Clock} label="Avg. Response Time" value="3.4 h" delta="18%" deltaUp tone="navy" hint="faster than last month" />
        <KpiCard icon={CheckCircle2} label="Resolution Rate" value="94%" delta="2.1%" deltaUp tone="emerald" />
        <KpiCard icon={Gauge} label="AI Accuracy" value="96.8%" delta="0.4%" deltaUp tone="amber" hint="classification confidence" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="section-title">Complaints by Department</h2>
          <p className="mb-6 text-xs text-slate-400">Volume routed in the last 30 days</p>
          <DepartmentBarChart data={byDept} />
        </div>
        <div className="card p-6">
          <h2 className="section-title">Priority Distribution</h2>
          <p className="mb-6 text-xs text-slate-400">Share of reports by AI priority band</p>
          <PriorityDonut data={donut} />
        </div>
      </div>

      <div className="card p-6">
        <h2 className="section-title">Monthly Complaint Trends</h2>
        <p className="mb-4 text-xs text-slate-400">New complaints per week across the city</p>
        <TrendChart data={MONTHLY} />
      </div>
    </div>
  )
}
