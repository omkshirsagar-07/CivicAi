import { useState } from 'react'
import { ShieldCheck, LogIn, UserPlus, ArrowRight } from 'lucide-react'
import Logo from '../components/common/Logo'
import Button from '../components/common/Button'
import { Input, PasswordInput, Field } from '../components/common/Input'
import { useApp } from '../context/AppContext'

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-navy-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" aria-hidden />
        <Logo light />
        <div className="relative">
          <h2 className="text-3xl font-extrabold leading-tight text-white">
            A faster, more transparent way to fix your city.
          </h2>
          <p className="mt-4 max-w-md text-navy-100/80">
            CivicAI routes every report to the right department with an AI priority score — and keeps you
            informed from submission to resolution.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-navy-100/90">
            {['Voice, text, photo or location reporting', 'Instant emergency detection & dispatch alerts', 'Live tracking with a clear resolution timeline'].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <ShieldCheck size={17} className="text-blue-400" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-navy-100/50">© 2026 CivicAI · Municipal Grievance Platform</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-8">
        <div className="w-full max-w-md animate-fade-up">
          <div className="lg:hidden mb-8 flex justify-center"><Logo /></div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-950">{title}</h1>
          <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
          <div className="card mt-6 p-6 sm:p-7">{children}</div>
          {footer}
        </div>
      </div>
    </div>
  )
}

export function Login() {
  const { navigate, pushToast } = useApp()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const next = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (form.password.length < 6) next.password = 'Password must be at least 6 characters.'
    setErrors(next)
    if (Object.keys(next).length) return
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      pushToast({ tone: 'success', title: 'Welcome back, Administrator', message: 'Signed in to the CivicAI control room.' })
      navigate('/admin')
    }, 1100)
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your CivicAI account"
      footer={<p className="mt-6 text-center text-sm text-slate-500">New to CivicAI? <a href="#/register" className="font-semibold text-blue-700 hover:underline">Create an account</a></p>}
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Email" htmlFor="login-email" required error={errors.email}>
          <Input id="login-email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" />
        </Field>
        <Field label="Password" htmlFor="login-password" required error={errors.password}>
          <PasswordInput id="login-password" placeholder="••••••••" value={form.password} onChange={set('password')} error={errors.password} autoComplete="current-password" />
        </Field>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /> Remember me
          </label>
          <a href="#/login" className="font-semibold text-blue-700 hover:underline">Forgot password?</a>
        </div>
        <Button type="submit" size="lg" className="w-full" icon={LogIn} loading={loading}>
          {loading ? 'Signing in…' : 'Login'}
        </Button>
      </form>
    </AuthShell>
  )
}

export function Register() {
  const { navigate, pushToast } = useApp()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Enter your full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (form.password.length < 6) next.password = 'Password must be at least 6 characters.'
    if (form.confirm !== form.password) next.confirm = 'Passwords do not match.'
    setErrors(next)
    if (Object.keys(next).length) return
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      pushToast({ tone: 'success', title: 'Account created', message: 'Welcome to CivicAI — you can now report issues.' })
      navigate('/report')
    }, 1100)
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join CivicAI and start reporting issues in under a minute"
      footer={<p className="mt-6 text-center text-sm text-slate-500">Already have an account? <a href="#/login" className="font-semibold text-blue-700 hover:underline">Sign in</a></p>}
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Full Name" htmlFor="reg-name" required error={errors.name}>
          <Input id="reg-name" placeholder="Rohan Deshpande" value={form.name} onChange={set('name')} error={errors.name} autoComplete="name" />
        </Field>
        <Field label="Email" htmlFor="reg-email" required error={errors.email}>
          <Input id="reg-email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" />
        </Field>
        <Field label="Password" htmlFor="reg-password" required error={errors.password} hint="At least 6 characters.">
          <PasswordInput id="reg-password" placeholder="••••••••" value={form.password} onChange={set('password')} error={errors.password} autoComplete="new-password" />
        </Field>
        <Field label="Confirm Password" htmlFor="reg-confirm" required error={errors.confirm}>
          <PasswordInput id="reg-confirm" placeholder="••••••••" value={form.confirm} onChange={set('confirm')} error={errors.confirm} autoComplete="new-password" />
        </Field>
        <Button type="submit" size="lg" className="w-full" iconRight={UserPlus} loading={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </Button>
        <p className="flex items-start gap-1.5 text-xs text-slate-400">
          <ArrowRight size={12} className="mt-0.5 shrink-0" />
          Demo build — credentials are not stored or sent anywhere.
        </p>
      </form>
    </AuthShell>
  )
}
