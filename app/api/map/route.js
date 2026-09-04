import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { jsonError } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Public map feed — exposes ONLY non-private summary fields.
 * Citizen name, email and internal metadata are never selected.
 */
export async function GET(request) {
  const url = new URL(request.url);
  const maxAgeDays = Math.min(365, Math.max(1, Number(url.searchParams.get('days')) || 90));
  const limit = Math.min(800, Math.max(1, Number(url.searchParams.get('limit')) || 500));

  const conn = await connectToDatabase();
  if (!conn) {
    return NextResponse.json({ ok: true, available: false, markers: [], message: 'database unavailable' });
  }

  try {
    const { Report } = await import('@/models/Report');
    const since = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
    const docs = await Report.find({
      createdAt: { $gte: since },
      'location.latitude': { $exists: true, $ne: null },
      'location.longitude': { $exists: true, $ne: null },
    })
      .select(
        'reportId issue category priority severity createdAt location.latitude location.longitude location.city'
      )
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const markers = docs
      .filter((d) => Number.isFinite(d.location?.latitude) && Number.isFinite(d.location?.longitude))
      .map((d) => ({
        id: d.reportId,
        issue: d.issue,
        category: d.category,
        priority: d.priority,
        severity: d.severity,
        createdAt: d.createdAt,
        location: {
          latitude: d.location.latitude,
          longitude: d.location.longitude,
          city: d.location.city || '',
        },
      }));

    return NextResponse.json({ ok: true, available: true, markers, count: markers.length });
  } catch (err) {
    console.error('[map]', err?.message);
    return NextResponse.json({ ok: true, available: false, markers: [], message: 'map feed unavailable' });
  }
}

export async function OPTIONS() {
  return jsonError('Method not allowed.', 'METHOD', 405);
}
