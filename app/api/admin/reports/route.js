import { NextResponse } from 'next/server';
import { authenticateAdmin, adminError, scopedReportQuery } from '@/lib/admin';
import Report from '@/models/Report';
import { jsonError } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  let auth = await authenticateAdmin(request);
  if (!auth.user) { let e = adminError(auth.error); return jsonError(e.message, e.code, e.status); }
  let params = new URL(request.url).searchParams;
  let limit = Math.min(200, Math.max(1, Number(params.get('limit')) || 50));
  let query = scopedReportQuery(auth.user);
  let search = params.get('search')?.trim();
  if (search) { let escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); query.$or = [{ reportId: new RegExp(escaped, 'i') }, { complaint: new RegExp(escaped, 'i') }, { issue: new RegExp(escaped, 'i') }]; }
  for (let field of ['status', 'priority', 'category', 'department']) if (params.get(field)) query[field] = params.get(field);
  try {
    let [reports, total, stats, priorityStats] = await Promise.all([
      Report.find(query).sort({ createdAt: -1 }).limit(limit).lean(),
      Report.countDocuments(query),
      Report.aggregate([{ $match: query }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Report.aggregate([{ $match: query }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
    ]);
    let counts = { PENDING: 0, IN_PROGRESS: 0, RESOLVED: 0 };
    for (let item of stats) counts[item._id || 'PENDING'] = item.count;
    let priorities = {};
    for (let item of priorityStats) priorities[item._id] = item.count;
    return NextResponse.json({ ok: true, reports, total, stats: counts, priorityStats: priorities, user: { name: auth.user.name, role: auth.user.role, department: auth.user.department } });
  } catch (err) {
    console.error('[admin/reports]', err?.message);
    return jsonError('Reports could not be loaded.', 'REPORTS_FAILED', 500);
  }
}