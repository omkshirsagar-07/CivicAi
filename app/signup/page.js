import { Suspense } from 'react';
import AuthShell from '@/components/auth/AuthShell';
import SignupForm from '@/components/auth/SignupForm';

export const metadata = { title: 'Create Account' };

export default function SignupPage() {
  return (
    <AuthShell
      heading="Create your account"
      subheading="It takes under a minute. Your details stay private and are never shown on the public map."
    >
      <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}
