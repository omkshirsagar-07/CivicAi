import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import {
  SESSION_COOKIE,
  signSessionToken,
  sessionCookieOptions,
  verifyPassword,
} from '@/lib/auth';
import { jsonError, readJson, isSameOrigin, rateLimit, EMAIL_RE } from '@/lib/http';
import User from '@/models/User';

export const runtime = 'nodejs';

export async function POST(request) {
  if (!isSameOrigin(request)) {
    return jsonError('Cross-origin request rejected.', 'FORBIDDEN', 403);
  }
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = rateLimit(`login:${ip}`, 12, 15 * 60 * 1000);
  if (!rl.allowed) {
    return jsonError('Too many login attempts. Please try again later.', 'RATE_LIMITED', 429, {
      retryAfterSec: rl.retryAfterSec,
    });
  }

  const { ok, data, errorMessage } = await readJson(request);
  if (!ok) return jsonError(errorMessage, 'INVALID_BODY', 400);

  const email = typeof data?.email === 'string' ? data.email.trim().toLowerCase() : '';
  const password = typeof data?.password === 'string' ? data.password : '';

  if (!email || !EMAIL_RE.test(email) || !password) {
    return jsonError('Invalid email or password.', 'AUTH_FAILED', 401);
  }

  const conn = await connectToDatabase();
  if (!conn) {
    return jsonError('Database is not configured on the server.', 'DB_UNAVAILABLE', 503);
  }

  try {
    const user = await User.findOne({ email }).select('+passwordHash');
    const valid = user ? await verifyPassword(password, user.passwordHash) : false;
    if (!user || !valid) {
      return jsonError('Incorrect email or password.', 'AUTH_FAILED', 401);
    }

    user.lastLoginAt = new Date();
    await user.save().catch(() => {});

    const token = await signSessionToken(user._id.toString());
    const res = NextResponse.json({
      ok: true,
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role, department: user.department },
    });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return res;
  } catch (err) {
    console.error('[auth/login]', err.message);
    return jsonError('Login failed. Please try again.', 'SERVER_ERROR', 500);
  }
}
