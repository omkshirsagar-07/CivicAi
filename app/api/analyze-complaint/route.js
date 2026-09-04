import { NextResponse } from 'next/server';
import { analyzeComplaint } from '@/lib/gemini';
import { validateComplaintAnalysis } from '@/lib/validation';
import { computePriority } from '@/utils/priority';
import { jsonError, readJson, isSameOrigin } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!isSameOrigin(request)) {
    return jsonError('Cross-origin request rejected.', 'FORBIDDEN', 403);
  }
  const { ok, data, errorMessage } = await readJson(request);
  if (!ok) return jsonError(errorMessage, 'INVALID_BODY', 400);

  const complaint = typeof data?.complaint === 'string' ? data.complaint.trim() : '';
  if (complaint.length < 5) {
    return jsonError('Please describe the civic issue you want to report.', 'SHORT_COMPLAINT', 422);
  }
  if (complaint.length > 2000) {
    return jsonError('Your description is too long (max 2000 characters).', 'LONG_COMPLAINT', 422);
  }

  try {
    const raw = await analyzeComplaint({ complaint, imageData: null });
    const analysis = validateComplaintAnalysis(raw);

    if (!analysis.isCivicIssue) {
      return NextResponse.json({ ok: true, analysis });
    }

    // Deterministic priority — never blindly trust the model's own label.
    const priority = computePriority(analysis);
    const enriched = {
      ...analysis,
      priority: priority.priority,
      priorityScore: priority.priorityScore,
      priorityNotes: priority.notes,
    };

    const emergency = analysis.isEmergency
      ? {
          isEmergency: true,
          type: analysis.emergencyType,
          severity: analysis.severity,
          recommendedResponses: analysis.recommendedResponses,
          headline: `${analysis.emergencyType || 'Emergency'} reported — immediate attention recommended`,
        }
      : { isEmergency: false };

    return NextResponse.json({
      ok: true,
      analysis: enriched,
      emergency,
      priority: { score: priority.priorityScore, label: priority.priority, notes: priority.notes },
    });
  } catch (err) {
    console.error('[analyze-complaint]', err?.message);
    if (err?.code === 'GEMINI_NOT_CONFIGURED') {
      return jsonError('AI service is not configured on the server (GEMINI_API_KEY missing).', 'AI_NOT_CONFIGURED', 503);
    }
    if (err?.code === 'GEMINI_AUTH' || err?.code === 'GEMINI_BAD_REQUEST') {
      return jsonError('The Gemini API rejected this request — the GEMINI_API_KEY is likely invalid or lacks access. Verify the key in your .env.local and restart the server.', 'AI_AUTH', 502);
    }
    if (err?.code === 'GEMINI_MODEL') {
      return jsonError('The AI model configured in GEMINI_MODEL could not be found. Update GEMINI_MODEL (e.g. gemini-3.7-flash) in .env.local.', 'AI_MODEL', 502);
    }
    if (err?.code === 'GEMINI_RATE_LIMIT') {
      const retryAfterSec = Math.max(1, Math.ceil(err.retryAfterSec || 60));
      return jsonError(
        `The AI service quota is temporarily exhausted. Please try again in about ${retryAfterSec} seconds.`,
        'AI_BUSY',
        429,
        { retryAfterSec }
      );
    }
    if (err?.code === 'GEMINI_UNAVAILABLE' || err?.code === 'GEMINI_TIMEOUT') {
      return new NextResponse(
        JSON.stringify({
          ok: false,
          error: {
            code: 'AI_UNAVAILABLE',
            message: 'The AI service is temporarily busy. Please try again shortly.',
          },
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json', 'Retry-After': '10' },
        }
      );
    }
    if (err?.code === 'AI_VALIDATION_FAILED' || /JSON/i.test(err?.message || '')) {
      return jsonError('The AI returned an unreadable result. Please try again.', 'AI_UNREADABLE', 502);
    }
    return jsonError('AI analysis is temporarily unavailable. Please try again.', 'AI_ERROR', 502);
  }
}
