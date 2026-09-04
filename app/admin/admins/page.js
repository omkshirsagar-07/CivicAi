'use client';

import { useState } from 'react';
import { ShieldPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/utils/client';

const DEPARTMENTS = [
  'Municipal Waste Management Department',
  'Roads & Infrastructure Department',
  'Water Supply Department',
  'Drainage & Sewage Department',
  'Electrical & Street Lighting Department',
  'Public Health & Sanitation Department',
  'Traffic Management Department',
  'Environment & Pollution Control Department',
  'Public Works Department',
  'Municipal Enforcement Department',
  'Fire & Emergency Services',
  'Emergency Health Services',
  'Police & Public Safety Department',
  'Citizen Services Department',
];

export default function AdminsPage() {
  let { user } = useAuth();
  let [name, setName] = useState(''); let [email, setEmail] = useState(''); let [department, setDepartment] = useState(''); let [password, setPassword] = useState('');
  let [loading, setLoading] = useState(false); let [message, setMessage] = useState(''); let [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault(); setLoading(true); setMessage(''); setError('');
    try {
      let response = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, department, password }) });
      let data = await response.json();
      if (!response.ok) throw new ApiError(data?.error?.message || 'Could not create administrator.');
      setMessage(`${data.user.email} can now sign in as a department administrator.`); setName(''); setEmail(''); setDepartment(''); setPassword('');
    } catch (err) { setError(err.message || 'Could not create administrator.'); } finally { setLoading(false); }
  }
  if (user?.role !== 'MAIN_ADMIN') return <div><h1 className="text-3xl font-bold text-navy-950">Access denied</h1><p className="mt-2 text-sm text-slate-500">Only a main administrator can create department administrators.</p></div>;
  return <div className="max-w-2xl"><p className="text-sm font-semibold text-civic-blue">Access management</p><h1 className="mt-1 text-3xl font-bold text-navy-950">Create department admin</h1><p className="mt-2 text-sm text-slate-500">The new account will only see reports assigned to its department.</p><form onSubmit={submit} className="mt-8 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-card"><label className="block"><span className="label-base">Full name</span><input className="input-base" required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} /></label><label className="block"><span className="label-base">Email</span><input className="input-base" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><label className="block"><span className="label-base">Department</span><select className="input-base" required value={department} onChange={(event) => setDepartment(event.target.value)}><option value="">Select a department</option>{DEPARTMENTS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="block"><span className="label-base">Temporary password</span><input className="input-base" type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} /><span className="mt-1 block text-xs text-slate-500">At least 8 characters. Share it securely and ask the administrator to change it later.</span></label>{error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}{message && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}<button className="btn btn-primary px-4 py-3" disabled={loading}><ShieldPlus size={17} />{loading ? 'Creating...' : 'Create department admin'}</button></form></div>;
}
