'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Input, PasswordInput } from '@/components/ui/FormFields';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { cn, ApiError, EMAIL_RE, safeNextPath } from '@/utils/client';

function strengthOf(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  return score; // 0–4
}

const METER = [
  { label: 'Too weak', cls: 'bg-red-400', text: 'text-red-600' },
  { label: 'Weak', cls: 'bg-orange-400', text: 'text-orange-600' },
  { label: 'Fair', cls: 'bg-amber-400', text: 'text-amber-600' },
  { label: 'Good', cls: 'bg-lime-500', text: 'text-lime-600' },
  { label: 'Strong', cls: 'bg-emerald-500', text: 'text-emerald-600' },
];

export default function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNextPath(params.get('next'), '/report');

  const { user, status, register, logout } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const score = useMemo(() => strengthOf(password), [password]);
  const meter = METER[score];

  useEffect(() => {
    if (status === 'ready' && user) router.replace(next);
  }, [status, user, next, router]);

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    const errs = {};

    if (!name.trim()) errs.name = 'Full name is required.';
    else if (name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';

    if (!email) errs.email = 'Email is required.';
    else if (!EMAIL_RE.test(email)) errs.email = 'Enter a valid email address.';

    if (!password) errs.password = 'Password is required.';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters.';
    else if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      errs.password = 'Use uppercase, lowercase and a number.';
    }

    if (confirm !== password) errs.confirm = 'Passwords do not match.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      router.push(next);
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setErrors(err.fieldErrors);
      } else {
        setFormError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === 'ready' && user) {
    return (
      <div className="space-y-5 text-center">
        <p className="text-sm text-slate-500">
          You are signed in as <span className="font-semibold text-slate-900">{user.email}</span>. Redirecting…
        </p>
        <button type="button" onClick={logout} className="btn btn-outline w-full">
          Sign out of this account
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {formError && <Alert tone="danger">{formError}</Alert>}
      <Input
        label="Full name"
        autoComplete="name"
        placeholder="e.g. Anjali Patil"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        required
      />
      <Input
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
      />

      <div>
        <PasswordInput
          label="Password"
          autoComplete="new-password"
          placeholder="8+ characters with upper, lower & a number"
          value={password}
          visible={showPassword}
          onToggleVisible={() => setShowPassword((v) => !v)}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
        />
        {password && (
          <div className="mt-2.5" aria-live="polite">
            <div className="flex gap-1.5" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn('h-1.5 flex-1 rounded-full transition-colors', i < score ? meter.cls : 'bg-slate-200')}
                />
              ))}
            </div>
            <p className={cn('mt-1 text-[12px] font-medium', meter.text)}>
              Password strength: {meter.label}
            </p>
          </div>
        )}
      </div>

      <PasswordInput
        label="Confirm password"
        autoComplete="new-password"
        placeholder="Re-enter your password"
        value={confirm}
        visible={showPassword}
        onToggleVisible={() => setShowPassword((v) => !v)}
        onChange={(e) => setConfirm(e.target.value)}
        error={errors.confirm}
        required
      />

      <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
        <UserPlus size={17} aria-hidden />
        Create account
      </Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-civic-blue hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
}
