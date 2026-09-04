import { storeImage } from '@/lib/gridfs';
import { connectToDatabase } from '@/lib/mongodb';
import { jsonError, isSameOrigin, rateLimit } from '@/lib/http';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
  'image/gif': ['gif'],
};

const MAGIC = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/gif': [0x47, 0x49, 0x46, 0x38],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF....WEBP
};

function sniffMime(buf) {
  if (buf.length < 12) return null;
  // WebP signature check (RIFF + WEBP)
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return 'image/webp';
  for (const [mime, sig] of Object.entries(MAGIC)) {
    if (sig.every((b, i) => buf[i] === b)) return mime;
  }
  return null;
}

export async function POST(request) {
  if (!isSameOrigin(request)) return jsonError('Cross-origin request rejected.', 'FORBIDDEN', 403);

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = rateLimit(`upload:${ip}`, 30, 60 * 60 * 1000);
  if (!rl.allowed) return jsonError('Too many uploads. Try again later.', 'RATE_LIMITED', 429);

  const conn = await connectToDatabase();
  if (!conn) return jsonError('Image storage is not available (database not configured).', 'DB_UNAVAILABLE', 503);

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError('Could not read the upload. Please try again.', 'INVALID_UPLOAD', 400);
  }

  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return jsonError('No image file was provided.', 'NO_FILE', 400);
  }
  if (!(file instanceof File) && !file.arrayBuffer) {
    return jsonError('Invalid upload payload.', 'INVALID_FILE', 400);
  }

  const declaredType = String(file.type || '').toLowerCase();
  if (!ALLOWED[declaredType]) {
    return jsonError('Unsupported file type. Allowed: JPG, PNG, WebP or GIF.', 'BAD_TYPE', 415);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length === 0) return jsonError('The uploaded file is empty.', 'EMPTY_FILE', 400);
  if (buffer.length > MAX_IMAGE_BYTES) {
    return jsonError('Image is larger than 10 MB. Please choose a smaller photo.', 'TOO_LARGE', 413);
  }

  const sniffed = sniffMime(buffer);
  if (!sniffed || sniffed !== declaredType) {
    return jsonError('The file content does not match its declared image type.', 'CONTENT_MISMATCH', 415);
  }

  try {
    const fileId = await storeImage({
      buffer,
      mimeType: declaredType,
      originalName: file.name || `evidence.${ALLOWED[declaredType][0]}`,
    });
    return NextResponse.json({
      ok: true,
      fileId,
      mimeType: declaredType,
      size: buffer.length,
      filename: file.name || '',
    });
  } catch (err) {
    console.error('[images]', err?.message);
    return jsonError('Could not store the image. Please try again.', 'STORE_FAILED', 500);
  }
}
