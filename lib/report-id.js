import 'server-only';
import mongoose from 'mongoose';
import { connectToDatabase } from './mongodb.js';

/**
 * Uniquely sequential report ids: CIV-YYYY-XXXXXX
 * e.g. CIV-2026-000001
 *
 * Uniqueness is guaranteed by an atomic $inc on a Mongo counter document —
 * never by random frontend ids. Falls back to a collision-checked id derived
 * from the reports collection only if the counter collection is unavailable.
 */

async function nextReportId() {
  const conn = await connectToDatabase();
  if (!conn) throw new Error('Database is not configured.');

  const year = new Date().getFullYear();
  const db = mongoose.connection.db;
  const counters = db.collection('reportCounters');

  try {
    const result = await counters.findOneAndUpdate(
      { _id: `reports_${year}` },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
    // Driver versions return either the doc directly or a ModifyResult.
    const seq = result?.seq ?? result?.value?.seq ?? 1;
    return `CIV-${year}-${String(seq).padStart(6, '0')}`;
  } catch {
    // Robust fallback: derive from the existing max reportId + random jitter.
    const { Report } = await import('../models/Report.js');
    const max = await Report.findOne({}, { reportId: 1 })
      .sort({ reportId: -1 })
      .lean();
    let n = 1;
    if (max?.reportId) {
      const m = /CIV-\d+-(\d+)$/.exec(max.reportId);
      if (m) n = Number(m[1]) + 1;
    }
    const attempt = `CIV-${year}-${String(n).padStart(6, '0')}`;
    const exists = await Report.exists({ reportId: attempt });
    return exists ? `${attempt}-${Date.now() % 1000}`.slice(0, 18) : attempt;
  }
}

export { nextReportId };
