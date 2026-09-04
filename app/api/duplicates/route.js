import { NextResponse } from 'next/server';
import { findSimilarReports } from '@/lib/duplicates';
import { jsonError, readJson, isSameOrigin } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!isSameOrigin(request)) return jsonError('Cross-origin request rejected.', 'FORBIDDEN', 403);
  const { ok, data, errorMessage } = await readJson(request);
  if (!ok) return jsonError(errorMessage, 'INVALID_BODY', 400);

  const complaint = typeof data?.complaint === 'string' ? data.complaint.slice(0, 2000) : '';
  const category = typeof data?.category === 'string' ? data.category : '';
  const issue = typeof data?.issue === 'string' ? data.issue : '';
  const keywords = Array.isArray(data?.keywords) ? data.keywords.map((k) => String(k)).slice(0, 10) : [];
  const location = data?.location || null;

  try {
    const result = await findSimilarReports({ complaint, category, issue, keywords, location });
    if (!result) {
      return NextResponse.json({
        ok: true,
        available: false,
        message: 'Duplicate detection needs a confirmed location.',
        count: 0,
        similar: [],
      });
    }
    return NextResponse.json({
      ok: true,
      available: true,
      count: result.count,
      similar: result.similar,
      radiusM: result.radiusM,
      checked: result.checked,
    });
  } catch (err) {
    console.error('[duplicates]', err?.message);
    return NextResponse.json({
      ok: true,
      available: false,
      count: 0,
      similar: [],
      message: 'Duplicate detection is temporarily unavailable.',
    });
  }
}
