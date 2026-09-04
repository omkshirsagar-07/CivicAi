import { NextResponse } from 'next/server';
import { verifyTextAndImage } from '@/lib/gemini';
import { validateVerification } from '@/lib/validation';
import { jsonError, readJson, isSameOrigin } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!isSameOrigin(request)) return jsonError('Cross-origin request rejected.', 'FORBIDDEN', 403);
  const { ok, data, errorMessage } = await readJson(request);
  if (!ok) return jsonError(errorMessage, 'INVALID_BODY', 400);

  const textAnalysis = data?.textAnalysis;
  const imageAnalysis = data?.imageAnalysis;
  const location = data?.location || null;

  if (!textAnalysis || typeof textAnalysis !== 'object') {
    return jsonError('Text analysis is missing. Run AI analysis first.', 'MISSING_TEXT_ANALYSIS', 422);
  }
  if (!imageAnalysis || typeof imageAnalysis !== 'object') {
    return jsonError('Image analysis is missing. Analyze your evidence first.', 'MISSING_IMAGE_ANALYSIS', 422);
  }

  const statusError = (msg) => {
    // Basic structural checks handled locally for a friendlier message.
    return NextResponse.json(
      { ok: false, error: { code: 'VERIFY_UNAVAILABLE', message: msg } },
      { status: 503 }
    );
  };

  try {
    const raw = await verifyTextAndImage({ textAnalysis, imageAnalysis, location });
    const verification = validateVerification(raw);

    // Deterministic override rules (never accuse — stay factual).
    const imageSaysCivic = Boolean(imageAnalysis.isCivicIssue);
    const textSaysCivic = textAnalysis.isCivicIssue !== false;

    if (textSaysCivic && !imageSaysCivic) {
      verification.verificationStatus = 'INVALID';
      verification.textImageMatch = false;
      verification.matchScore = Math.min(verification.matchScore, 25);
      verification.reason =
        'The uploaded photograph does not appear to show the reported civic issue. Please attach a clearer photo of the problem.';
      if (!verification.concerns.includes('photograph does not match the description')) {
        verification.concerns.push('photograph does not appear to show the reported issue');
      }
    } else if (
      textSaysCivic &&
      imageSaysCivic &&
      textAnalysis.category &&
      imageAnalysis.category &&
      textAnalysis.category !== imageAnalysis.category
    ) {
      verification.verificationStatus = verification.verificationStatus === 'VALID' ? 'SUSPICIOUS' : verification.verificationStatus;
      verification.matchScore = Math.min(verification.matchScore, 74);
      if (!verification.concerns.includes('category mismatch')) {
        verification.concerns.push(
          `description (${textAnalysis.category}) and image (${imageAnalysis.category}) point to different categories`
        );
      }
    }

    // Cap the score if the image itself was flagged as suspicious.
    if (imageAnalysis.suspicious) {
      verification.verificationStatus = verification.verificationStatus === 'VALID' ? 'SUSPICIOUS' : verification.verificationStatus;
      verification.matchScore = Math.min(verification.matchScore, 60);
      verification.concerns.push('image shows possible signs of reuse or manipulation and cannot be fully verified');
    }

    return NextResponse.json({ ok: true, verification });
  } catch (err) {
    console.error('[verify-report]', err?.message);
    if (err?.code === 'GEMINI_NOT_CONFIGURED') {
      return jsonError('AI service is not configured (GEMINI_API_KEY missing).', 'AI_NOT_CONFIGURED', 503);
    }
    if (err?.code === 'GEMINI_AUTH' || err?.code === 'GEMINI_BAD_REQUEST') {
      return jsonError('The Gemini API rejected this request — the GEMINI_API_KEY is likely invalid. Verify it in .env.local and restart the server.', 'AI_AUTH', 502);
    }
    if (err?.code === 'GEMINI_MODEL') {
      return jsonError('The AI model configured in GEMINI_MODEL could not be found. Update GEMINI_MODEL (e.g. gemini-2.5-flash) in .env.local.', 'AI_MODEL', 502);
    }
    if (err?.code === 'GEMINI_RATE_LIMIT') {
      return jsonError('The AI service is busy right now. Please try again.', 'AI_BUSY', 429);
    }
    return statusError('Cross-validation is temporarily unavailable. Please try again.');
  }
}
