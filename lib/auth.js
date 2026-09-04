import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

/**
 * Server-side authentication helpers.
 *
 * Sessions are signed JSON Web Tokens (HMAC-SHA256 with AUTH_SECRET)
 * stored in a HttpOnly, SameSite=Lax cookie. Nothing secret ever reaches
 * the browser; every protected action re-verifies the session server-side.
 */

const AUTH_SECRET = process.env.AUTH_SECRET || 'dev-insecure-secret-change-me';
const SESSION_COOKIE = 'civicai_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (seconds)

function getSecretKey() {
  return new TextEncoder().encode(AUTH_SECRET);
}

/** Create a signed session token for a user. */
async function signSessionToken(userId) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_MAX_AGE)
    .sign(getSecretKey());
}

/** Verify a session token; returns payload or throws. */
async function verifySessionToken(token) {
  const { payload } = await jwtVerify(token, getSecretKey(), {
    algorithms: ['HS256'],
  });
  return payload;
}

/** Read + verify the session from a request (Route Handlers). */
async function authenticateRequest(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return { user: null, error: 'unauthorized' };
  try {
    const payload = await verifySessionToken(token);
    return { user: { id: payload.userId }, error: null };
  } catch {
    return { user: null, error: 'unauthorized' };
  }
}

/** Read + verify the session for a Server Component. */
async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const payload = await verifySessionToken(token);
    return { id: payload.userId };
  } catch {
    return null;
  }
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  };
}

function clearSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  };
}

async function hashPassword(plain) {
  return bcrypt.hash(plain, 12);
}

async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

/** Emit a Set-Cookie header for the newly created session. */
async function createSessionSetCookie(userId) {
  const token = await signSessionToken(userId);
  return `${SESSION_COOKIE}=${token}`;
}

const SESSION_COOKIE_NAME = SESSION_COOKIE;

export {
  AUTH_SECRET,
  SESSION_COOKIE,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
  signSessionToken,
  verifySessionToken,
  authenticateRequest,
  getCurrentUser,
  sessionCookieOptions,
  clearSessionCookieOptions,
  hashPassword,
  verifyPassword,
  createSessionSetCookie,
};
