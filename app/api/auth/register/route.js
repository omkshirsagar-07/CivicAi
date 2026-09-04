import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import {
  SESSION_COOKIE,
  signSessionToken,
  sessionCookieOptions,
  hashPassword,
} from '@/lib/auth';
import { jsonError, readJson, isSameOrigin, rateLimit, EMAIL_RE } from '@/lib/http';
import User from '@/models/User';

export const runtime = 'nodejs';

const NAME_RE = /^[\p{L}][\p{L}\s.'-]{1,78}$/u;
const PASSWORD_MIN = 8;
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/;

export async function POST(request) {
  if (!isSameOrigin(request)) {
    return jsonError('Cross-origin request rejected.', 'FORBIDDEN', 403);
  }
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = rateLimit(`register:${ip}`, 8, 15 * 60 * 1000);
  if (!rl.allowed) {
    return jsonError('Too many sign-up attempts. Please try again later.', 'RATE_LIMITED', 429);
  }

  const { ok, data, errorMessage } = await readJson(request);
  if (!ok) return jsonError(errorMessage, 'INVALID_BODY', 400);

  const name = typeof data?.name === 'string' ? data.name.trim() : '';
  const email = typeof data?.email === 'string' ? data.email.trim().toLowerCase() : '';
  const password = typeof data?.password === 'string' ? data.password : '';
  const errors = {};

  if (!name) errors.name = 'Full name is required.';
  else if (!NAME_RE.test(name)) errors.name = 'Please enter a valid full name (letters and spaces only).';

  if (!email) errors.email = 'Email is required.';
  else if (!EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.';

  if (!password) errors.password = 'Password is required.';
  else if (password.length < PASSWORD_MIN) errors.password = 'Password must be at least 8 characters.';
  else if (!PASSWORD_RE.test(password)) errors.password = 'Password needs upper & lowercase letters and a number.';
  else if (password.length > 72) errors.password = 'Password is too long (max 72 characters).';

  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const conn = await connectToDatabase();
  if (!conn) {
    return jsonError('Database is not configured on the server.', 'DB_UNAVAILABLE', 503);
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { ok: false, errors: { email: 'An account with this email already exists.' } },
        { status: 409 }
      );
    }
    const passwordHash = await hashPassword(password);
    const user = await User.create({ name, email, passwordHash, lastLoginAt: new Date() });

    const token = await signSessionToken(user._id.toString());
    const res = NextResponse.json(
      { ok: true, user: { id: user._id.toString(), name: user.name, email: user.email } },
      { status: 201 }
    );
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return res;
  } catch (err) {
    console.error('[auth/register]', err.message);
    return jsonError('Registration failed. Please try again.', 'SERVER_ERROR', 500);
  }
}
