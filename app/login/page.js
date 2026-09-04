import { Suspense } from 'react';
import AuthShell from '@/components/auth/AuthShell';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = { title: 'Login' };

export default function LoginPage() {
  return (
    <AuthShell
      heading="Welcome back"
      subheading="Sign in to submit and manage your verified civic reports."
    >
      <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
