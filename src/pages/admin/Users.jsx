import { Users as UsersIcon, Search } from 'lucide-react'
import Badge from '../../components/common/Badge'
import { mockUsers } from '../../data/mockData'

const ROLE_TONE = {
  Citizen: 'sky',
  'Department Officer': 'blue',
  'Emergency Dispatcher': 'red',
}

export default function Users() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-navy-950">
          <UsersIcon size={22} className="text-blue-600" /> Users
        </h1>
        <p className="mt-1 text-sm text-slate-500">Citizens, department officers and emergency dispatchers on the platform.</p>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 p-4">
          <label className="relative block max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search users by name or area…" aria-label="Search users" />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="th">User</th>
                <th className="th">Role</th>
                <th className="th">Area / Department</th>
                <th className="th">Reports</th>
                <th className="th">Joined</th>
                <th className="th">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockUsers.map((u) => (
                <tr key={u.name} className="hover:bg-blue-50/30">
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-navy-900 text-xs font-bold text-white">
                        {u.name.split(' ').map((n) => n[0]).join('')}
                      </span>
                      <span className="font-semibold text-navy-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="td"><Badge tone={ROLE_TONE[u.role] ?? 'slate'}>{u.role}</Badge></td>
                  <td className="td text-slate-500">{u.area}</td>
                  <td className="td font-semibold tabular-nums">{u.reports}</td>
                  <td className="td text-slate-500">{new Date(u.joined).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="td"><Badge tone="emerald" dot>{u.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
