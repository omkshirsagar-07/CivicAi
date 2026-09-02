import { useApp } from './context/AppContext'
import PublicNavbar from './components/layout/PublicNavbar'
import Footer from './components/layout/Footer'
import AdminLayout from './components/layout/AdminLayout'

import Landing from './pages/Landing'
import ReportIssue from './pages/ReportIssue'
import TrackComplaint from './pages/TrackComplaint'
import LiveMap from './pages/LiveMap'
import About from './pages/About'
import { Login, Register } from './pages/Auth'

import Dashboard from './pages/admin/Dashboard'
import Complaints from './pages/admin/Complaints'
import ComplaintDetail from './pages/admin/ComplaintDetail'
import Emergency from './pages/admin/Emergency'
import AdminMap from './pages/admin/AdminMap'
import Departments from './pages/admin/Departments'
import Analytics from './pages/admin/Analytics'
import Users from './pages/admin/Users'
import Settings from './pages/admin/Settings'

function NotFound() {
  return (
    <div className="mx-auto max-w-content px-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-blue-600">404</p>
      <h1 className="mt-4 text-2xl font-extrabold text-navy-950">Page not found</h1>
      <p className="mt-2 text-slate-500">The page you are looking for doesn’t exist or has moved.</p>
      <a href="#/" className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
        Back to Home
      </a>
    </div>
  )
}

function AdminSection({ path }) {
  let content
  if (path === '/admin' || path === '/admin/') content = <Dashboard />
  else if (path === '/admin/complaints') content = <Complaints />
  else if (path.startsWith('/admin/complaints/')) content = <ComplaintDetail complaintId={decodeURIComponent(path.split('/')[3])} />
  else if (path === '/admin/emergency') content = <Emergency />
  else if (path === '/admin/map') content = <AdminMap />
  else if (path === '/admin/departments') content = <Departments />
  else if (path === '/admin/analytics') content = <Analytics />
  else if (path === '/admin/users') content = <Users />
  else if (path === '/admin/settings') content = <Settings />
  else content = <NotFound />

  return <AdminLayout>{content}</AdminLayout>
}

export default function App() {
  const { path } = useApp()

  // Admin area uses its own shell (dark sidebar, no public nav/footer)
  if (path.startsWith('/admin')) {
    return <AdminSection path={path} />
  }

  let page
  switch (path) {
    case '/':
      page = <Landing />
      break
    case '/report':
      page = <ReportIssue />
      break
    case '/track':
      page = <TrackComplaint />
      break
    case '/map':
      page = <LiveMap />
      break
    case '/about':
      page = <About />
      break
    case '/login':
      page = <Login />
      break
    case '/register':
      page = <Register />
      break
    default:
      page = <NotFound />
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">{page}</main>
      <Footer />
  </div>
  )
}
