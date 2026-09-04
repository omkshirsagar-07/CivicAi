'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Input, PasswordInput } from '@/components/ui/FormFields';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { ApiError, EMAIL_RE, safeNextPath } from '@/utils/client';

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNextPath(params.get('next'), '/');

  const { user, status, login, logout } = useAuth();
  const adminRoles = ['MAIN_ADMIN', 'DEPARTMENT_ADMIN'];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already signed in → bounce to the destination.
  useEffect(() => {
    if (status === 'ready' && user) {
      router.replace(adminRoles.includes(user.role) ? '/admin/dashboard' : next);
    }
  }, [status, user, next, router]);

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    const errs = {};
    if (!email) errs.email = 'Email is required.';
    else if (!EMAIL_RE.test(email)) errs.email = 'Enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const account = await login(email.trim(), password);
      router.push(adminRoles.includes(account.role) ? '/admin/dashboard' : next);
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
          You are signed in as <span className="font-semibold text-slate-900">{user.email}</span>.
          Redirecting…
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
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          visible={showPassword}
          onToggleVisible={() => setShowPassword((v) => !v)}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
        />
        <div className="mt-2 text-right">
          <Link href="/forgot-password" className="text-[13px] font-medium text-civic-blue hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
        <LogIn size={17} aria-hidden />
        Login
      </Button>

      <p className="text-center text-sm text-slate-500">
        New to CivicAI?{' '}
        <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-semibold text-civic-blue hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
