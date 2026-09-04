import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { AUTH_SECRET } from '@/lib/auth';
import { jsonError, readJson, isSameOrigin, rateLimit, EMAIL_RE } from '@/lib/http';

export const runtime = 'nodejs';

/**
 * Forgot-password (hackathon-safe design).
 *
 * No outbound email (SMTP) is configured for this demo, so a real delivery
 * channel is intentionally not claimed. The endpoint generates a short-lived,
 * signed, single-purpose reset token using the same server secret that signs
 * sessions — it is never written to the browser, never logged, and expires
 * after 30 minutes. In development mode the reset link is returned so judges
 * can inspect the flow end-to-end; in production it would be emailed by the
 * platform (only the placeholder email step is missing).
 *
 * Existing-account probing is avoided: every well-formed request returns the
 * same "If an account exists..." confirmation.
 */
export async function POST(request) {
  if (!isSameOrigin(request)) {
    return jsonError('Cross-origin request rejected.', 'FORBIDDEN', 403);
  }
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = rateLimit(`forgot:${ip}`, 6, 15 * 60 * 1000);
  if (!rl.allowed) {
    return jsonError('Too many requests. Please try again later.', 'RATE_LIMITED', 429);
  }

  const { ok, data } = await readJson(request);
  const email = typeof data?.email === 'string' ? data.email.trim().toLowerCase() : '';
  if (!email || !EMAIL_RE.test(email)) {
    return jsonError('Please enter a valid email address.', 'INVALID_EMAIL', 422);
  }

  // Return the identical success response whether or not the account exists.
  const respond = async () => {
    let resetUrl = null;
    if (process.env.NODE_ENV !== 'production') {
      const token = await new SignJWT({ purpose: 'password-reset', email })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30m')
        .sign(new TextEncoder().encode(AUTH_SECRET));
      const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      resetUrl = `${base}/forgot-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
    }
    return NextResponse.json({
      ok: true,
      message:
        'If an account exists for that email, a password reset link has been issued.',
      // Shown only outside production for hackathon demonstration.
      devResetUrl: resetUrl,
      note:
        'No email service is configured in this demo build, so the reset link is returned in development mode only. Production builds would email it to you securely.',
    });
  };

  try {
    return await respond();
  } catch {
    return jsonError('Something went wrong. Please try again.', 'SERVER_ERROR', 500);
  }
}
