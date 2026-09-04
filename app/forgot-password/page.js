import { Suspense } from 'react';
import AuthShell from '@/components/auth/AuthShell';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata = { title: 'Forgot Password' };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      heading="Reset your password"
      subheading="Enter the email linked to your CivicAI account and we'll issue a secure reset link."
    >
      <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
