'use client';

import { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/utils/client';

export default function AdminLoginPage() {
  let router = useRouter();
  let { login } = useAuth();
  let [email, setEmail] = useState('');
  let [password, setPassword] = useState('');
  let [showPassword, setShowPassword] = useState(false);
  let [loading, setLoading] = useState(false);
  let [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      let account = await login(email, password);
      if (!['MAIN_ADMIN', 'DEPARTMENT_ADMIN'].includes(account.role)) { setError('This account does not have administrator access.'); return; }
      let nextPath = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('next') : null;
      router.replace(nextPath || '/admin/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to sign in. Please try again.');
    } finally { setLoading(false); }
  }

  return <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50 px-5 py-12"><section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-card sm:p-9"><div className="mb-8 flex items-center gap-3"><div className="rounded-xl bg-navy-950 p-3 text-civic-sky"><ShieldCheck size={24} /></div><div><p className="text-lg font-bold text-navy-950">CivicAI Admin</p><p className="text-sm text-slate-500">Sign in to manage reports</p></div></div><form onSubmit={submit} className="space-y-5"><label className="block"><span className="label-base">Email</span><input className="input-base" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" /></label><label className="block"><span className="label-base">Password</span><div className="relative"><input className="input-base pr-11" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>{error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}<button className="btn btn-primary w-full py-3" disabled={loading}>{loading ? 'Signing in...' : <><LockKeyhole size={16} />Sign in</>}</button></form></section></main>;
}
