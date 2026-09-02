import { useMemo, useState } from 'react'
import { Search, ChevronUp, ChevronDown, SlidersHorizontal, Inbox, Eye } from 'lucide-react'
import { StatusBadge, SeverityBadge } from '../common/meta'
import { EmptyState } from '../common/States'
import { timeAgo } from '../../utils/format'
import { DEPARTMENTS } from '../../constants'

const SORTABLE = {
  priority: 'priority',
  reports: 'reports',
  date: 'createdAt',
}

export default function ComplaintsTable({ complaints, onSelect }) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [deptFilter, setDeptFilter] = useState('all')
  const [sortKey, setSortKey] = useState('date')
  const [sortDir, setSortDir] = useState('desc')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = complaints.filter((c) => {
      const matchesQ =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.location.area.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter
      const matchesPriority =
        priorityFilter === 'all' ||
        (priorityFilter === 'emergency' && c.emergency && c.status !== 'Resolved') ||
        (priorityFilter !== 'emergency' && c.severity.toLowerCase() === priorityFilter && !c.emergency)
      const matchesDept = deptFilter === 'all' || c.department === deptFilter
      return matchesQ && matchesStatus && matchesPriority && matchesDept
    })
    const key = SORTABLE[sortKey] ?? 'createdAt'
    list = [...list].sort((a, b) => {
      const av = a[key]
      const bv = b[key]
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [complaints, query, statusFilter, priorityFilter, deptFilter, sortKey, sortDir])

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const SortIcon = ({ col }) =>
    sortKey !== col ? (
      <ChevronDown size={13} className="text-slate-300" />
    ) : sortDir === 'asc' ? (
      <ChevronUp size={13} className="text-blue-600" />
    ) : (
      <ChevronDown size={13} className="text-blue-600" />
    )

  const selectCls =
    'rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ID, issue, area…"
            className="input pl-9"
            aria-label="Search complaints"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal size={15} className="text-slate-400" aria-hidden />
          <select className={selectCls} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
            <option value="all">All Statuses</option>
            <option>Submitted</option>
            <option>Department Assigned</option>
            <option>Under Review</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
          <select className={selectCls} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} aria-label="Filter by priority">
            <option value="all">All Priorities</option>
            <option value="emergency">Emergency</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select className={selectCls} value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} aria-label="Filter by department">
            <option value="all">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d.name} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Inbox} title="No complaints found" message="Try adjusting your search or filters to see more results." />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full border-t border-slate-100">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="th">Complaint ID</th>
                  <th className="th">Issue</th>
                  <th className="th">Category</th>
                  <th className="th">Department</th>
                  <th className="th">
                    <button className="inline-flex items-center gap-1 uppercase tracking-wider" onClick={() => toggleSort('priority')}>
                      Priority <SortIcon col="priority" />
                    </button>
                  </th>
                  <th className="th">Location</th>
                  <th className="th">Status</th>
                  <th className="th">
                    <button className="inline-flex items-center gap-1 uppercase tracking-wider" onClick={() => toggleSort('reports')}>
                      Reports <SortIcon col="reports" />
                    </button>
                  </th>
                  <th className="th">
                    <button className="inline-flex items-center gap-1 uppercase tracking-wider" onClick={() => toggleSort('date')}>
                      Date <SortIcon col="date" />
                    </button>
                  </th>
                  <th className="th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-blue-50/30">
                    <td className="td font-mono text-xs font-semibold text-blue-700">{c.id}</td>
                    <td className="td max-w-[240px]">
                      <p className="truncate font-semibold text-navy-900">{c.title}</p>
                    </td>
                    <td className="td whitespace-nowrap text-slate-500">{c.category}</td>
                    <td className="td max-w-[180px]">
                      <p className="truncate text-slate-500">{c.department.replace(/ \(.*\)/, '')}</p>
                    </td>
                    <td className="td"><SeverityBadge severity={c.severity} emergency={c.emergency} /></td>
                    <td className="td whitespace-nowrap text-slate-500">{c.location.area}</td>
                    <td className="td"><StatusBadge status={c.status} /></td>
                    <td className="td font-semibold tabular-nums text-slate-700">{c.reports}</td>
                    <td className="td whitespace-nowrap text-slate-500">{timeAgo(c.createdAt)}</td>
                    <td className="td text-right">
                      <button
                        onClick={() => onSelect?.(c.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
                        aria-label={`View details for ${c.id}`}
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 p-4 pt-0 lg:hidden">
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => onSelect?.(c.id)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:shadow-card"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-blue-700">{c.id}</span>
                    <span className="text-xs text-slate-400">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-navy-900">{c.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{c.location.area} · {c.category}</p>
                  <div className="mt-2.5 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <StatusBadge status={c.status} />
                      <SeverityBadge severity={c.severity} emergency={c.emergency} />
                    </div>
                    <span className="text-xs font-semibold text-slate-500">{c.reports} reports</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
