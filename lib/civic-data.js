/**
 * Civic domain reference data used by AI validation and the deterministic
 * priority engine. Kept server-side (never imported by client code that runs
 * in the browser bundle).
 */

export const CIVIC_CATEGORIES = [
  'Waste Management',
  'Roads',
  'Water Supply',
  'Drainage',
  'Street Lights',
  'Public Sanitation',
  'Traffic',
  'Pollution',
  'Public Infrastructure',
  'Illegal Dumping',
  'Fire',
  'Medical Emergency',
  'Public Safety',
  'Other',
];

/** Canonical categories the model may treat as emergencies (with response units). */
export const EMERGENCY_CATEGORIES = ['Fire', 'Medical Emergency', 'Public Safety'];

/** Human-safe display name for each recognized department. */
export const CATEGORY_DEPARTMENTS = {
  'Waste Management': 'Municipal Waste Management Department',
  Roads: 'Roads & Infrastructure Department',
  'Water Supply': 'Water Supply Department',
  Drainage: 'Drainage & Sewage Department',
  'Street Lights': 'Electrical & Street Lighting Department',
  'Public Sanitation': 'Public Health & Sanitation Department',
  Traffic: 'Traffic Management Department',
  Pollution: 'Environment & Pollution Control Department',
  'Public Infrastructure': 'Public Works Department',
  'Illegal Dumping': 'Municipal Enforcement Department',
  Fire: 'Fire & Emergency Services',
  'Medical Emergency': 'Emergency Health Services',
  'Public Safety': 'Police & Public Safety Department',
  Other: 'Citizen Services Department',
};

/** Priority colour/label tiers shared with the map legend. */
export const PRIORITY_LEVELS = {
  EMERGENCY: { label: 'Emergency', color: 'red' },
  HIGH: { label: 'High', color: 'orange' },
  MEDIUM: { label: 'Medium', color: 'amber' },
  LOW: { label: 'Low', color: 'sky' },
};

/** Deterministic category weight (1–10) for priority scoring. */
export const CATEGORY_SEVERITY_BASE = {
  'Medical Emergency': 10,
  Fire: 10,
  'Public Safety': 9,
  'Water Supply': 7,
  Drainage: 7,
  Pollution: 7,
  'Illegal Dumping': 6,
  'Waste Management': 6,
  'Public Sanitation': 6,
  Roads: 5,
  'Street Lights': 4,
  Traffic: 6,
  'Public Infrastructure': 5,
  Other: 4,
};

export const VALID_PRIORITIES = ['Emergency', 'High', 'Medium', 'Low'];
