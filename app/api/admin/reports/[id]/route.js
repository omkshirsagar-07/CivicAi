import { NextResponse } from 'next/server';
import { authenticateAdmin, adminError, scopedReportQuery } from '@/lib/admin';
import { storeImage, getImageInfo } from '@/lib/gridfs';
import Report from '@/models/Report';
import { jsonError, isSameOrigin } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let ALLOWED_TYPES = { 'image/jpeg': [0xff, 0xd8, 0xff], 'image/png': [0x89, 0x50, 0x4e, 0x47], 'image/gif': [0x47, 0x49, 0x46, 0x38] };
function validImage(buffer, mime) {
  if (mime === 'image/webp') return buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  let signature = ALLOWED_TYPES[mime];
  return Boolean(signature && signature.every((byte, index) => buffer[index] === byte));
}

export async function GET(request, { params }) {
  let auth = await authenticateAdmin(request);
  if (!auth.user) { let e = adminError(auth.error); return jsonError(e.message, e.code, e.status); }
  let routeParams = await params;
  let report = await Report.findOne({ reportId: routeParams.id, ...scopedReportQuery(auth.user) }).populate('resolvedBy', 'name email').lean();
  if (!report) return jsonError('Report not found.', 'NOT_FOUND', 404);
  return NextResponse.json({ ok: true, report });
}

export async function POST(request, { params }) {
  if (!isSameOrigin(request)) return jsonError('Cross-origin request rejected.', 'FORBIDDEN', 403);
  let auth = await authenticateAdmin(request);
  if (!auth.user) { let e = adminError(auth.error); return jsonError(e.message, e.code, e.status); }
  let routeParams = await params;
  let report = await Report.findOne({ reportId: routeParams.id, ...scopedReportQuery(auth.user) });
  if (!report) return jsonError('Report not found.', 'NOT_FOUND', 404);
  if (report.status === 'RESOLVED') return jsonError('This report is already resolved.', 'ALREADY_RESOLVED', 409);
  let form = await request.formData();
  let note = String(form.get('resolutionNote') || '').trim();
  let file = form.get('proofImage');
  if (!note) return jsonError('A resolution note is required.', 'NO_RESOLUTION_NOTE', 422);
  if (!file || typeof file.arrayBuffer !== 'function' || !ALLOWED_TYPES[file.type] && file.type !== 'image/webp') return jsonError('A proof image is required.', 'NO_PROOF_IMAGE', 422);
  if (file.size > 10 * 1024 * 1024) return jsonError('Proof image must be 10 MB or smaller.', 'IMAGE_TOO_LARGE', 422);
  try {
    let buffer = Buffer.from(await file.arrayBuffer());
    if (!validImage(buffer, file.type)) return jsonError('The file content does not match its image type.', 'CONTENT_MISMATCH', 422);
    let storedId = await storeImage({ buffer, mimeType: file.type, originalName: file.name });
    let info = await getImageInfo(storedId);
    report.status = 'RESOLVED';
    report.resolutionNote = note;
    report.resolutionProofFileId = storedId;
    report.resolutionProofMimeType = info?.mimeType || file.type;
    report.resolvedBy = auth.user.id;
    report.resolvedAt = new Date();
    await report.save();
    return NextResponse.json({ ok: true, report: report.toObject() });
  } catch (err) {
    console.error('[admin/resolve]', err?.message);
    return jsonError('Resolution proof could not be stored.', 'RESOLUTION_FAILED', 500);
  }
}