import { NextResponse } from 'next/server';

/** Standard JSON helpers used by Route Handlers. */

export function jsonOk(data, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

export function jsonError(message, code = 'ERROR', status = 400, extra = {}) {
  return NextResponse.json(
    { ok: false, error: { code, message, ...extra } },
    { status }
  );
}

/** Light CSRF guard: reject cross-origin requests from browsers. */
export function isSameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true; // non-browser client (curl, server)
  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}

/** Parse a JSON body safely. Returns {ok, data|errorMessage}. */
export async function readJson(request) {
  try {
    const data = await request.json();
    return { ok: true, data };
  } catch {
    return { ok: false, errorMessage: 'Invalid JSON body.' };
  }
}

/* Tiny in-memory rate limiter (per process). Good enough for hackathon
 * deployments behind a single Node instance; swap for Redis in production. */
const buckets = new Map();

export function rateLimit(key, limit = 12, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  if (entry.count >= limit) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { allowed: true };
}

const EMAIL_RE = /^\S+@\S+\.\S+$/;
export { EMAIL_RE };
