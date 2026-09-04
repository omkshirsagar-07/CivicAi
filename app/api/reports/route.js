import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { validateComplaintAnalysis, validateVerification, validateLocation } from '@/lib/validation';
import { computePriority } from '@/utils/priority';
import { getImageInfo } from '@/lib/gridfs';
import { nextReportId } from '@/lib/report-id';
import Report from '@/models/Report';
import { jsonError, readJson, isSameOrigin } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function sanitizeOptionalVerification(v) {
  if (!v || typeof v !== 'object') return null;
  try {
    return validateVerification(v);
  } catch {
    return null;
  }
}

export async function POST(request) {
  if (!isSameOrigin(request)) return jsonError('Cross-origin request rejected.', 'FORBIDDEN', 403);

  const { user } = await authenticateRequest(request);
  if (!user) {
    return jsonError('You must be logged in to submit a civic report.', 'UNAUTHORIZED', 401);
  }

  const conn = await connectToDatabase();
  if (!conn) return jsonError('Database is not configured on the server.', 'DB_UNAVAILABLE', 503);

  const { ok, data, errorMessage } = await readJson(request);
  if (!ok) return jsonError(errorMessage, 'INVALID_BODY', 400);

  const complaint = typeof data?.complaint === 'string' ? data.complaint.trim() : '';
  if (complaint.length < 10) {
    return jsonError('Please describe the issue in more detail (at least 10 characters).', 'SHORT_COMPLAINT', 422);
  }
  if (complaint.length > 4000) {
    return jsonError('Your description is too long (max 4000 characters).', 'LONG_COMPLAINT', 422);
  }

  // 1. Re-validate the AI analysis server-side (never trust client payloads).
  let analysis;
  try {
    analysis = validateComplaintAnalysis(data?.analysis);
  } catch {
    return jsonError('The AI analysis on this report is invalid. Please re-run AI analysis.', 'INVALID_ANALYSIS', 422);
  }
  if (!analysis.isCivicIssue) {
    return jsonError('Only civic issues can be submitted through CivicAI.', 'NOT_CIVIC', 422);
  }

  // 2. Deterministic priority recomputed from validated inputs.
  const priority = computePriority(analysis);
  analysis.priority = priority.priority;
  analysis.priorityScore = priority.priorityScore;

  // 3. Location (mandatory for routing & duplicate checks).
  const location = validateLocation(data?.location);
  if (!location) {
    return jsonError('A confirmed location is required to submit a report.', 'NO_LOCATION', 422);
  }

  // 4. Evidence reference.
  const imageFileId = typeof data?.imageFileId === 'string' ? data.imageFileId : null;
  let imageMimeType = null;
  if (imageFileId) {
    if (!/^[a-f0-9]{24}$/i.test(imageFileId)) {
      return jsonError('Invalid image reference.', 'INVALID_IMAGE', 422);
    }
    try {
      const info = await getImageInfo(imageFileId);
      if (!info) return jsonError('The uploaded evidence could not be found.', 'IMAGE_NOT_FOUND', 422);
      imageMimeType = info.mimeType;
    } catch {
      return jsonError('Could not verify the uploaded evidence.', 'IMAGE_CHECK_FAILED', 500);
    }
  }

  // 5. Verification (required once evidence has been cross-checked).
  const verification = sanitizeOptionalVerification(data?.verification);
  if (!verification) {
    return jsonError('Evidence verification is incomplete. Please complete verification.', 'NO_VERIFICATION', 422);
  }

  // 6. Emergency + duplicate metadata (best-effort sanitization).
  const emergency = analysis.isEmergency
    ? {
        isEmergency: true,
        type: analysis.emergencyType,
        severity: analysis.severity,
        recommendedResponses: analysis.recommendedResponses || [],
      }
    : { isEmergency: false };

  const dup = data?.duplicateDetection && typeof data.duplicateDetection === 'object'
    ? { count: Math.max(0, Number(data.duplicateDetection.count) || 0), radiusM: data.duplicateDetection.radiusM || null }
    : null;

  const doc = {
    userId: user.id,
    complaint,
    issue: analysis.issue,
    category: analysis.category,
    department: analysis.department,
    summary: analysis.summary || '',
    priority: analysis.priority,
    priorityScore: analysis.priorityScore,
    severity: analysis.severity,
    complaintConfidence: analysis.confidence,
    reason: analysis.reason || '',
    imageFileId,
    imageMimeType,
    imageAnalysis: data?.imageAnalysis && typeof data.imageAnalysis === 'object' ? data.imageAnalysis : null,
    verification,
    emergency,
    duplicateDetection: dup,
    location,
    geo: {
      type: 'Point',
      coordinates: [location.longitude, location.latitude],
    },
  };

  try {
    const reportId = await nextReportId();
    doc.reportId = reportId;
    const saved = await Report.create(doc);

    return NextResponse.json(
      {
        ok: true,
        report: {
          reportId: saved.reportId,
          issue: saved.issue,
          category: saved.category,
          department: saved.department,
          priority: saved.priority,
          priorityScore: saved.priorityScore,
          severity: saved.severity,
          verificationStatus: saved.verification?.verificationStatus || 'UNVERIFIABLE',
          createdAt: saved.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[reports]', err?.message);
    if (err?.code === 11000) {
      // Extremely unlikely: counter/document collision. Let the client retry.
      return jsonError('Please try submitting again.', 'CONFLICT', 409);
    }
    return jsonError('Your report could not be saved. Please try again.', 'SAVE_FAILED', 500);
  }
}
