import 'server-only';
import { CIVIC_CATEGORIES, CATEGORY_DEPARTMENTS, EMERGENCY_CATEGORIES, VALID_PRIORITIES } from './civic-data.js';

/**
 * Strict server-side validation of every AI-produced JSON payload.
 * Raw model output is never trusted and never stored directly — it must pass
 * through these sanitizers, which clamp types, enforce enums and fill safe
 * defaults. Anything malformed throws a controlled error the UI can show.
 */

const DEPT_LOOKUP = CATEGORY_DEPARTMENTS;

function asString(v, max = 300, fallback = '') {
  if (typeof v !== 'string') return fallback;
  const s = v.trim().replace(/\s+/g, ' ');
  return s ? s.slice(0, max) : fallback;
}

function asBool(v) {
  return v === true || v === 'true' || v === 1 || v === '1';
}

function asNumber(v, min, max, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n * 10) / 10));
}

function normalizeCategory(v) {
  const raw = asString(v, 80);
  const found = CIVIC_CATEGORIES.find((c) => c.toLowerCase() === raw.toLowerCase());
  return found || (raw ? 'Other' : 'Other');
}

function pickDepartment(category, aiValue) {
  const canonical = DEPT_LOOKUP[category];
  if (canonical) return canonical;
  return asString(aiValue, 160) || 'Citizen Services Department';
}

function normalizePriority(v, severity, isEmergency) {
  if (isEmergency) return 'Emergency';
  const p = asString(v, 20).toLowerCase();
  if (VALID_PRIORITIES.map((x) => x.toLowerCase()).includes(p)) {
    return VALID_PRIORITIES.find((x) => x.toLowerCase() === p);
  }
  if (severity >= 8) return 'High';
  if (severity >= 5) return 'Medium';
  return 'Low';
}

function normalizeRecommendedResponses(raw, isEmergency, category) {
  const allowed = ['Fire Department', 'Police', 'Ambulance', 'Electricity Department', 'Disaster Management', 'Gas/Emergency Services'];
  if (!isEmergency) return [];
  if (Array.isArray(raw)) {
    const uniq = [];
    for (const item of raw) {
      const s = asString(item, 60);
      if (!s || uniq.includes(s)) continue;
      if (s.length < 60) uniq.push(s);
    }
    return uniq.length ? uniq.slice(0, 6) : defaultResponses(category);
  }
  return defaultResponses(category);
}

function defaultResponses(category) {
  switch (category) {
    case 'Fire':
      return ['Fire Department', 'Police', 'Ambulance'];
    case 'Medical Emergency':
      return ['Ambulance', 'Police'];
    case 'Public Safety':
      return ['Police', 'Ambulance'];
    case 'Public Infrastructure':
      return ['Disaster Management', 'Police'];
    default:
      return ['Fire Department', 'Police', 'Ambulance'];
  }
}

/**
 * Validate text (and optional image) complaint analysis from Gemini.
 * Returns a fully normalized analysis object.
 */
export function validateComplaintAnalysis(raw) {
  if (!raw || typeof raw !== 'object') {
    const err = new Error('The AI returned an unreadable analysis. Please try again.');
    err.code = 'AI_VALIDATION_FAILED';
    throw err;
  }

  const isCivicIssue = asBool(raw.isCivicIssue);

  if (!isCivicIssue) {
    return {
      isCivicIssue: false,
      confidence: asNumber(raw.confidence, 0, 1, 0.8),
      reason: asString(raw.reason, 400, 'The submitted text does not describe a civic or public infrastructure issue.'),
      summary: asString(raw.summary, 400, 'This input does not appear to describe a civic issue.'),
    };
  }

  const severity = Math.round(asNumber(raw.severity, 1, 10, 5));
  const aiPriority = asString(raw.priority, 20);
  const isEmergencyRaw = asBool(raw.isEmergency) || EMERGENCY_CATEGORIES.includes(normalizeCategory(raw.category));
  const category = normalizeCategory(raw.category);
  const issue = asString(raw.issue, 160, 'Civic Issue');
  const confidence = asNumber(raw.confidence, 0, 1, 0.8);

  const isEmergency = isEmergencyRaw && severity >= 6;
  const priority = normalizePriority(aiPriority, severity, isEmergency);
  const department = pickDepartment(category, raw.department);
  const emergencyType = isEmergency
    ? asString(raw.emergencyType, 60, category === 'Fire' ? 'Fire' : category)
    : null;

  return {
    isCivicIssue: true,
    issue,
    category,
    department,
    priority,
    severity,
    confidence,
    summary: asString(raw.summary, 500, `${issue} reported.`),
    reason: asString(raw.reason, 700, ''),
    keywords: Array.isArray(raw.keywords) ? raw.keywords.map((k) => asString(k, 40)).filter(Boolean).slice(0, 10) : [],
    peopleAffectedEstimate: asString(raw.peopleAffectedEstimate, 60, ''),
    publicSafetyImpact: asBool(raw.publicSafetyImpact),
    infrastructureImpact: asBool(raw.infrastructureImpact),
    healthImpact: asBool(raw.healthImpact),
    isEmergency,
    emergencyType,
    recommendedResponses: normalizeRecommendedResponses(raw.recommendedResponses, isEmergency, category),
  };
}

/** Validate the image-analysis output from Gemini. */
export function validateImageAnalysis(raw) {
  if (!raw || typeof raw !== 'object') {
    const err = new Error('The AI could not interpret this image. Please try again.');
    err.code = 'AI_VALIDATION_FAILED';
    throw err;
  }

  const isCivicIssue = asBool(raw.isCivicIssue);
  const base = {
    isCivicIssue,
    confidence: asNumber(raw.confidence, 0, 1, 0.7),
    visibleEvidence: Array.isArray(raw.visibleEvidence)
      ? raw.visibleEvidence.map((v) => asString(v, 200)).filter(Boolean).slice(0, 6)
      : [],
    suspicious: asBool(raw.suspicious),
    reason: asString(raw.reason, 500, ''),
    notCivicReason: asString(raw.notCivicReason, 300, ''),
  };

  if (!isCivicIssue) {
    return {
      ...base,
      detectedIssue: '',
      category: 'Other',
      severity: 1,
      impact: asString(raw.impact, 300, 'No clear civic issue is visible in this image.'),
      imageRelevant: false,
    };
  }

  const category = normalizeCategory(raw.category);
  return {
    ...base,
    detectedIssue: asString(raw.detectedIssue, 160, 'Civic Issue'),
    category,
    severity: Math.round(asNumber(raw.severity, 1, 10, 5)),
    impact: asString(raw.impact, 300, ''),
    imageRelevant: asBool(raw.imageRelevant),
  };
}

/** Validate the text↔image verification output. */
export function validateVerification(raw) {
  if (!raw || typeof raw !== 'object') {
    const err = new Error('Verification could not be completed. Please try again.');
    err.code = 'AI_VALIDATION_FAILED';
    throw err;
  }
  const status = asString(raw.verificationStatus, 20).toUpperCase();
  const allowed = ['VALID', 'SUSPICIOUS', 'UNVERIFIABLE', 'INVALID'];
  const finalStatus = allowed.includes(status) ? status : 'UNVERIFIABLE';
  const matchScore = Math.round(asNumber(raw.matchScore, 0, 100, 0));
  return {
    verificationStatus: finalStatus,
    matchScore,
    textImageMatch: asBool(raw.textImageMatch) || matchScore >= 70,
    reason: asString(raw.reason, 600, 'Evidence could not be fully cross-checked.'),
    concerns: Array.isArray(raw.concerns) ? raw.concerns.map((c) => asString(c, 200)).filter(Boolean).slice(0, 5) : [],
    recommendedAction: ['proceed', 'review', 're-submit evidence'].includes(asString(raw.recommendedAction, 30))
      ? asString(raw.recommendedAction, 30)
      : 'proceed',
  };
}

/** Validate a geo location object. */
export function validateLocation(location) {
  if (!location) return null;
  const lat = Number(location.latitude);
  const lng = Number(location.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return {
    latitude: Math.round(lat * 1e6) / 1e6,
    longitude: Math.round(lng * 1e6) / 1e6,
    address: asString(location.address, 500, ''),
    city: asString(location.city, 120, ''),
    accuracy: location.accuracy ? asNumber(location.accuracy, 0, 100000, null) : null,
  };
}
