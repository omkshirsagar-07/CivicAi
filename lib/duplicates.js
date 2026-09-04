import 'server-only';
import { connectToDatabase } from './mongodb.js';
import { haversineMeters, boundingBox } from '../utils/geo.js';

/**
 * Smart duplicate detection.
 *
 * Finds reports near the submitted location that plausibly describe the same
 * civic issue, using a blend of: geographic proximity, same category/issue,
 * and lightweight text similarity. New reports are never auto-rejected —
 * duplicates only inform the citizen (and the authority).
 */

const STOP = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'has', 'have', 'had',
  'there', 'near', 'by', 'at', 'in', 'on', 'of', 'to', 'for', 'with', 'and', 'or',
  'but', 'it', 'its', 'this', 'that', 'these', 'those', 'from', 'since', 'very',
  'about', 'around', 'my', 'me', 'i', 'we', 'our', 'you', 'your', 'so', 'as',
  'over', 'under', 'again', 'more', 'most', 'some', 'any', 'not', 'no', 'yes',
]);

function tokens(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function dice(a, b) {
  if (!a.length || !b.length) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let inter = 0;
  setA.forEach((t) => { if (setB.has(t)) inter += 1; });
  return (2 * inter) / (setA.size + setB.size);
}

export async function findSimilarReports({
  complaint = '',
  category = '',
  issue = '',
  keywords = [],
  location,
  radiusM = 2000,
  limit = 5,
  maxAgeDays = 150,
}) {
  if (!location || !Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) {
    return null;
  }
  const conn = await connectToDatabase();
  if (!conn) return null;

  const { Report } = await import('../models/Report.js');
  const { latitude: lat, longitude: lng } = location;
  const box = boundingBox(lat, lng, radiusM);

  const since = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
  let docs;
  try {
    docs = await Report.find({
      'location.latitude': { $gte: box.minLat, $lte: box.maxLat },
      'location.longitude': { $gte: box.minLng, $lte: box.maxLng },
      createdAt: { $gte: since },
    })
      .select('reportId complaint issue category priority severity createdAt location')
      .lean()
      .limit(60);
  } catch {
    return null;
  }

  if (!docs.length) return { count: 0, similar: [], radiusM, checked: 0 };

  const queryTokens = tokens(complaint);
  const kwTokens = (keywords || []).map((k) => String(k).toLowerCase().trim()).filter(Boolean);

  const scored = [];
  let similarCount = 0;

  for (const doc of docs) {
    const dLat = doc.location?.latitude;
    const dLng = doc.location?.longitude;
    if (!Number.isFinite(dLat) || !Number.isFinite(dLng)) continue;
    const dist = haversineMeters(lat, lng, dLat, dLng);
    if (dist > radiusM) continue;

    const docTokens = tokens(doc.complaint || doc.issue || '');
    let textSim = dice(queryTokens, docTokens);
    if (kwTokens.length) {
      const kwSim = dice(kwTokens, docTokens);
      const issueTokens = tokens(doc.issue || '');
      const kwIssueSim = dice(kwTokens, issueTokens);
      textSim = Math.max(textSim, kwSim, kwIssueSim);
    }
    const sameCategory = category && doc.category === category;
    const sameIssue = issue && doc.issue && doc.issue.toLowerCase() === issue.toLowerCase();
    const isSimilar = textSim >= 0.16 || sameCategory || sameIssue;
    if (!isSimilar) continue;

    similarCount += 1;
    const confidence = Math.round(
      Math.min(
        100,
        100 *
          (0.45 * Math.max(0, textSim) +
            (sameIssue ? 0.3 : sameCategory ? 0.22 : 0.1) +
            (dist < 500 ? 0.15 : dist < 1200 ? 0.1 : 0.04))
      )
    );

    scored.push({
      reportId: doc.reportId,
      issue: doc.issue || 'Civic issue',
      category: doc.category,
      priority: doc.priority,
      severity: doc.severity,
      createdAt: doc.createdAt,
      distanceMeters: Math.round(dist),
      matchType: sameIssue ? 'same issue' : sameCategory ? 'same category' : 'similar description',
      similarity: confidence,
      location: {
        latitude: dLat,
        longitude: dLng,
        city: doc.location?.city || '',
        address: doc.location?.address || '',
      },
    });
  }

  scored.sort((a, b) => b.similarity - a.similarity || a.distanceMeters - b.distanceMeters);
  return {
    count: similarCount,
    similar: scored.slice(0, limit),
    radiusM,
    checked: docs.length,
  };
}
