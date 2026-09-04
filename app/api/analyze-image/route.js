import { NextResponse } from 'next/server';
import { analyzeImageEvidence } from '@/lib/gemini';
import { validateImageAnalysis } from '@/lib/validation';
import { imageSeverityScore } from '@/utils/priority';
import { getImageInfo, readImageBuffer } from '@/lib/gridfs';
import { jsonError, readJson, isSameOrigin } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!isSameOrigin(request)) return jsonError('Cross-origin request rejected.', 'FORBIDDEN', 403);
  const { ok, data, errorMessage } = await readJson(request);
  if (!ok) return jsonError(errorMessage, 'INVALID_BODY', 400);

  const fileId = typeof data?.fileId === 'string' ? data.fileId.trim() : '';
  if (!/^[a-f0-9]{24}$/i.test(fileId)) {
    return jsonError('Invalid image id.', 'INVALID_ID', 422);
  }

  try {
    const info = await getImageInfo(fileId);
    if (!info) return jsonError('The uploaded image could not be found.', 'NOT_FOUND', 404);

    const buffer = await readImageBuffer(fileId);
    const base64 = buffer.toString('base64');

    const raw = await analyzeImageEvidence({
      imageData: { mimeType: info.mimeType, base64 },
    });
    const imageAnalysis = validateImageAnalysis(raw);
    const severity = imageSeverityScore(imageAnalysis);

    return NextResponse.json({
      ok: true,
      imageAnalysis: severity !== null ? { ...imageAnalysis, severity } : imageAnalysis,
      image: { fileId, mimeType: info.mimeType, size: info.length },
    });
  } catch (err) {
    console.error('[analyze-image]', err?.message);
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
    if (err?.code === 'AI_VALIDATION_FAILED' || /JSON/i.test(err?.message || '')) {
      return jsonError('The AI returned an unreadable result. Please try again.', 'AI_UNREADABLE', 502);
    }
    return jsonError('AI image analysis is temporarily unavailable.', 'AI_ERROR', 502);
  }
}
