'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { KeyRound, MailCheck, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/FormFields';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { fetchJson, ApiError, EMAIL_RE } from '@/utils/client';

export default function ForgotPasswordForm() {
  const params = useSearchParams();
  const token = params.get('token');

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(null); // { message, devResetUrl, note }

  if (token) {
    return (
      <div className="space-y-5">
        <Alert tone="info">
          <p className="text-sm leading-relaxed">
            <span className="font-semibold">Reset link accepted.</span> For this demo build, the
            password-reset endpoint ends here — no email provider is connected, so no password is
            changed. A production deployment would let you set a new password using this
            single-use link (it expires in 30 minutes).
          </p>
        </Alert>
        <Link href="/login" className="btn btn-primary w-full">
          Back to Login
        </Link>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const data = await fetchJson('/api/auth/forgot-password', {
        method: 'POST',
        body: { email },
      });
      setSent(data);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-5 animate-fade-in-up">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <MailCheck size={24} aria-hidden />
        </span>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Reset link issued</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{sent.message}</p>
        </div>

        {sent.devResetUrl && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
            <p className="text-[12.5px] font-semibold uppercase tracking-wide text-blue-700">
              Demo mode — reset link
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-blue-900">
              No email service is configured in this demo. The securely signed link below would
              normally be emailed to you:
            </p>
            <a
              href={sent.devResetUrl}
              className="mt-3 inline-flex max-w-full items-center gap-1.5 break-all rounded-lg bg-white px-3 py-2 text-[12.5px] font-medium text-blue-700 shadow-sm hover:underline"
            >
              <ExternalLink size={13} aria-hidden />
              Open reset link (expires in 30 min)
            </a>
          </div>
        )}

        <p className="text-[12.5px] text-slate-400">{sent.note}</p>
        <Link href="/login" className="btn btn-outline w-full">
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {error && <Alert tone="danger">{error}</Alert>}
      <Input
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
        required
      />
      <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
        <KeyRound size={17} aria-hidden />
        Send reset link
      </Button>
      <p className="text-center text-sm text-slate-500">
        Remembered it?{' '}
        <Link href="/login" className="font-semibold text-civic-blue hover:underline">
          Back to Login
        </Link>
      </p>
    </form>
  );
}
