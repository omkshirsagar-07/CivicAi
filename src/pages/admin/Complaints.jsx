import { FileText } from 'lucide-react'
import ComplaintsTable from '../../components/dashboard/ComplaintsTable'
import { useApp } from '../../context/AppContext'

export default function Complaints() {
  const { complaints, navigate } = useApp()

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-navy-950">
            <FileText size={22} className="text-blue-600" /> Complaint Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">{complaints.length} complaints in the system — search, filter and sort the full register.</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <ComplaintsTable complaints={complaints} onSelect={(id) => navigate(`/admin/complaints/${id}`)} />
      </div>
    </div>
  )
}
