import { NextResponse } from 'next/server';
import { Readable } from 'stream';
import { getImageReadStream } from '@/lib/gridfs';
import { jsonError } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/images/[fileId]
 * Streams a stored GridFS image back with correct content type and cache
 * headers. Never exposes Mongo internals.
 */
export async function GET(request, { params }) {
  const { fileId } = await params;
  if (!fileId || !/^[a-f0-9]{24}$/i.test(fileId)) {
    return jsonError('Invalid image id.', 'INVALID_ID', 400);
  }

  try {
    const { stream, file } = await getImageReadStream(fileId);
    const mime = file.contentType || file.metadata?.contentType || 'application/octet-stream';
    const length = file.length || 0;

    const web = Readable.toWeb(stream);
    return new NextResponse(web, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Content-Length': String(length),
        'Cache-Control': 'public, max-age=3600, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    if (err?.code === 'NOT_FOUND') {
      return jsonError('Image not found.', 'NOT_FOUND', 404);
    }
    return jsonError('Could not retrieve the image.', 'FETCH_FAILED', 500);
  }
}
