/** Client-side helpers (safe for browser bundles). */

export function cn(...parts) {
  return parts.filter(Boolean).join(' ');
}

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'ERROR', fieldErrors = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

/** fetch wrapper that normalizes CivicAI API responses to JSON / typed errors. */
export async function fetchJson(url, { method = 'GET', body, headers } = {}) {
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Network error. Please check your connection and try again.', {
      status: 0,
      code: 'NETWORK',
    });
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg = data?.error?.message || 'Something went wrong. Please try again.';
    throw new ApiError(msg, {
      status: res.status,
      code: data?.error?.code || 'ERROR',
      fieldErrors: data?.errors || null,
    });
  }
  return data;
}

export const EMAIL_RE = /^\S+@\S+\.\S+$/;

export function validatePasswordStrength(password) {
  const issues = [];
  if (password.length < 8) issues.push('at least 8 characters');
  if (!/[a-z]/.test(password)) issues.push('a lowercase letter');
  if (!/[A-Z]/.test(password)) issues.push('an uppercase letter');
  if (!/\d/.test(password)) issues.push('a number');
  return { ok: issues.length === 0, issues };
}

/** Speech recognition locales supported by the Web Speech API via browser. */
export const SPEECH_LANGUAGES = [
  { code: 'en-IN', label: 'English', flag: '🇬🇧', note: 'English (India)' },
  { code: 'hi-IN', label: 'Hindi', flag: 'हिं', note: 'हिन्दी' },
  { code: 'mr-IN', label: 'Marathi', flag: 'मरा', note: 'मराठी' },
];

export const PRIORITY_STYLE = {
  Emergency: { label: 'Emergency', badge: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', tone: 'red' },
  High: { label: 'High', badge: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500', tone: 'orange' },
  Medium: { label: 'Medium', badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', tone: 'amber' },
  Low: { label: 'Low', badge: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500', tone: 'sky' },
};

export const VERIFICATION_META = {
  VALID: {
    label: 'Report Appears Valid',
    badge: 'bg-green-50 text-green-700 border-green-200',
    tone: 'green',
    icon: '✓',
  },
  SUSPICIOUS: {
    label: 'Needs Review',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    tone: 'orange',
    icon: '!',
  },
  UNVERIFIABLE: {
    label: 'Unverifiable',
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    tone: 'slate',
    icon: '?',
  },
  INVALID: {
    label: 'Evidence Mismatch',
    badge: 'bg-red-50 text-red-700 border-red-200',
    tone: 'red',
    icon: '✕',
  },
};

/** Only accept simple internal paths for redirects (never open redirects). */
export function safeNextPath(p, fallback = '/') {
  if (typeof p === 'string' && /^\/[a-z0-9/_-]*$/i.test(p) && p.length < 100) return p;
  return fallback;
}

export function formatReportTime(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export function displayCoordinates(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return 'Location pending';
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}
