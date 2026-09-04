import { CATEGORY_SEVERITY_BASE } from '../lib/civic-data.js';

/**
 * Deterministic priority engine.
 *
 * The Gemini model suggests a severity and impact flags, but CivicAI does NOT
 * blindly trust that score. This module recomputes a transparent 0–100
 * priority score from validated inputs using fixed application logic, so the
 * result is explainable, consistent and auditable by the responsible
 * department.
 */

const SCORE = {
  severityWeight: 4.2,
  categoryWeight: 1.6,
  emergencyBonus: 14,
  publicSafetyImpact: 9,
  healthImpact: 7,
  infrastructureImpact: 5,
  peopleMany: 6,
  peopleSome: 4,
  peopleVeryFew: 1,
};

export function peopleAffectedScore(estimate = '') {
  const e = String(estimate).toLowerCase();
  if (e.includes('very many')) return SCORE.peopleMany;
  if (e.includes('many')) return SCORE.peopleMany;
  if (e.includes('some') || e.includes('hundred')) return SCORE.peopleSome;
  return SCORE.peopleVeryFew;
}

/**
 * Compute the deterministic priority for a validated complaint analysis.
 * @returns {{priorityScore:number, priority:string, factors:object, notes:string[]}}
 */
export function computePriority(analysis) {
  if (!analysis || analysis.isCivicIssue === false) {
    return { priorityScore: 0, priority: 'Low', factors: {}, notes: [] };
  }

  const severity = Math.min(10, Math.max(1, analysis.severity || 1));
  const category = analysis.category || 'Other';
  const categoryBase = CATEGORY_SEVERITY_BASE[category] ?? 4;

  const emergency = Boolean(analysis.isEmergency);
  const publicSafety = Boolean(analysis.publicSafetyImpact);
  const health = Boolean(analysis.healthImpact);
  const infrastructure = Boolean(analysis.infrastructureImpact);
  const people = peopleAffectedScore(analysis.peopleAffectedEstimate);

  let total = 0;
  const factors = {};
  const notes = [];

  const sev = severity * SCORE.severityWeight;
  total += sev;
  factors.severity = Math.round(sev);
  notes.push(`Severity ${severity}/10`);

  const cat = categoryBase * SCORE.categoryWeight;
  total += cat;
  factors.category = Math.round(cat);
  notes.push(`${category} is a ${categoryBase >= 8 ? 'high' : categoryBase >= 6 ? 'elevated' : 'standard'} priority category`);

  if (emergency) {
    total += SCORE.emergencyBonus;
    factors.emergency = SCORE.emergencyBonus;
    notes.push('Emergency indicators present');
  }
  if (publicSafety) {
    total += SCORE.publicSafetyImpact;
    factors.publicSafety = SCORE.publicSafetyImpact;
    notes.push('Public safety may be affected');
  }
  if (health) {
    total += SCORE.healthImpact;
    factors.health = SCORE.healthImpact;
    notes.push('Public health may be affected');
  }
  if (infrastructure) {
    total += SCORE.infrastructureImpact;
    factors.infrastructure = SCORE.infrastructureImpact;
    notes.push('Public infrastructure may be affected');
  }
  if (people) {
    total += people;
    factors.people = people;
    notes.push(analysis.peopleAffectedEstimate ? `Potentially ${analysis.peopleAffectedEstimate.toLowerCase()} affected` : 'Limited number of people affected');
  }

  const priorityScore = Math.min(100, Math.max(1, Math.round(total)));
  let priority;
  if (emergency && priorityScore >= 80) priority = 'Emergency';
  else if (priorityScore >= 62) priority = 'High';
  else if (priorityScore >= 42) priority = 'Medium';
  else priority = 'Low';

  return { priorityScore, priority, factors, notes };
}

/** Deterministic severity estimate from a validated image analysis. */
export function imageSeverityScore(imageAnalysis) {
  if (!imageAnalysis || !imageAnalysis.isCivicIssue) return null;
  return Math.min(10, Math.max(1, Math.round(imageAnalysis.severity || 1)));
}
