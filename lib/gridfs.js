import 'server-only';
import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { connectToDatabase } from './mongodb.js';

/**
 * MongoDB GridFS image storage.
 *
 * Citizen photographs are stored as binary files in a GridFS bucket named
 * "civic" (fs.files + fs.chunks collections) instead of embedding large
 * Base64 blobs inside report documents. Reports reference the image by its
 * GridFS file id.
 */

const BUCKET_NAME = 'civic';

async function getDb() {
  const conn = await connectToDatabase();
  if (!conn) throw new Error('Database is not configured.');
  const db = mongoose.connection.db;
  if (!db) throw new Error('MongoDB native driver is unavailable.');
  return db;
}

async function getBucket() {
  const db = await getDb();
  return new GridFSBucket(db, { bucketName: BUCKET_NAME });
}

function toObjectId(id) {
  if (!ObjectId.isValid(id)) {
    const err = new Error('Invalid file identifier.');
    err.code = 'INVALID_ID';
    throw err;
  }
  return new ObjectId(id);
}

/** Store a validated image buffer in GridFS. Returns the file id (string). */
export async function storeImage({ buffer, mimeType, originalName }) {
  const bucket = await getBucket();
  const safeName =
    originalName && originalName.trim()
      ? originalName.trim().replace(/[^\w.\- ]/g, '_').slice(0, 90)
      : 'evidence.jpg';

  const effectiveMime = mimeType || 'image/jpeg';
  const upload = bucket.openUploadStream(safeName, {
    // Some mongodb driver versions only persist contentType when it is also
    // mirrored inside metadata — keep both in sync.
    contentType: effectiveMime,
    metadata: {
      uploadedAt: new Date(),
      source: 'civicai-report',
      contentType: effectiveMime,
    },
  });
  upload.end(buffer);

  const file = await new Promise((resolve, reject) => {
    upload.on('finish', () => resolve(upload));
    upload.on('error', (err) => reject(err));
  });
  return file.id.toString();
}

/** Metadata (mimeType, length, name) for a GridFS file, or null. */
export async function getImageInfo(fileId) {
  const bucket = await getBucket();
  try {
    const docs = await bucket.find({ _id: toObjectId(fileId) }).limit(1).toArray();
    if (!docs.length) return null;
    const file = docs[0];
    return {
      id: file._id.toString(),
      mimeType:
        file.contentType ||
        file.metadata?.contentType ||
        'application/octet-stream',
      length: file.length,
      filename: file.filename,
      uploadDate: file.uploadDate,
    };
  } catch {
    return null;
  }
}

/** Open a readable stream for a stored file. Throws if missing/invalid. */
export async function getImageReadStream(fileId) {
  const bucket = await getBucket();
  const id = toObjectId(fileId);
  const docs = await bucket.find({ _id: id }).limit(1).toArray();
  if (!docs.length) {
    const err = new Error('Image not found.');
    err.code = 'NOT_FOUND';
    throw err;
  }
  return { stream: bucket.openDownloadStream(id), file: docs[0] };
}

/** Read the full buffer of a stored file (for server-side AI analysis). */
export async function readImageBuffer(fileId) {
  const { stream } = await getImageReadStream(fileId);
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

/** Delete a stored file. Best-effort; resolves silently when absent. */
export async function deleteImage(fileId) {
  const bucket = await getBucket();
  try {
    await bucket.delete(toObjectId(fileId));
  } catch {
    /* ignore */
  }
}

export { BUCKET_NAME };
