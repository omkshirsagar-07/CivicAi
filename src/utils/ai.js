// ---------------------------------------------------------------------------
// Mock AI pipeline — front-end simulation of the future backend AI service.
// Mirrors the real pipeline stages: understand → classify → severity →
// department → priority score → duplicate check → emergency detection.
// Swap `analyzeComplaint` for an API call without touching any UI.
// ---------------------------------------------------------------------------

const RULES = [
  {
    category: 'Fire Emergency',
    department: 'Fire & Emergency Services',
    emergency: true,
    keywords: ['fire', 'flames', 'burning', 'blaze', 'smoke', 'gas leak', 'gas leakage', 'explosion', 'trapped', 'collapsed building'],
  },
  {
    category: 'Medical Emergency',
    department: 'Health & Emergency Services',
    emergency: true,
    keywords: ['ambulance', 'accident', 'injured', 'medical', 'heart attack', 'collapsed', 'bleeding', 'unconscious', 'breathless', 'dog bite'],
  },
  {
    category: 'Water Supply',
    department: 'Water Supply Department',
    emergency: false,
    keywords: ['water pipeline', 'pipeline leak', 'leakage', 'water leak', 'burst pipe', 'no water', 'water supply', 'water tank', 'tap'],
  },
  {
    category: 'Drainage & Sewerage',
    department: 'Drainage & Sewerage Division',
    emergency: false,
    keywords: ['drain', 'sewage', 'sewer', 'manhole', 'sewage overflow', 'water logging', 'flooded road', 'stagnant water'],
  },
  {
    category: 'Road Damage',
    department: 'Roads & Infrastructure Department',
    emergency: false,
    keywords: ['pothole', 'road damage', 'broken road', 'cracked road', 'broken footpath', 'damaged footpath', 'pit on road', 'damaged road', 'road repair'],
  },
  {
    category: 'Streetlight & Electricity',
    department: 'Electricity Distribution (MSEDCL)',
    emergency: false,
    keywords: ['streetlight', 'street light', 'no light', 'dark street', 'transformer', 'sparking', 'wire', 'power cut', 'electricity', 'pole'],
  },
  {
    category: 'Waste Management',
    department: 'Municipal Corporation — Sanitation',
    emergency: false,
    keywords: ['garbage', 'waste', 'trash', 'dustbin', 'dump', 'garbage collection', 'not been collected', 'not collected', 'overflowing bin', 'garbage overflowing', 'waste is', 'burning waste', 'sweeping', 'litter'],
  },
  {
    category: 'Public Safety',
    department: 'Traffic & Police Department',
    emergency: false,
    keywords: ['traffic signal', 'signal', 'cattle', 'theft', 'crime', 'suspicious', 'harassment', 'accident-prone', 'encroachment'],
  },
]

const SEVERITY_WORDS = {
  Critical: ['major', 'severe', 'dangerous', 'trapped', 'spreading fast', 'explosion', 'fire', 'burst', 'collapse', 'bleeding', 'unconscious', 'gas'],
  High: ['major', 'large', 'deep', 'flooding', 'burst', 'serious', 'sparking', 'unsafe', 'risk', 'affecting', 'blocking', 'nearly fell', 'pothole', 'leakage', 'leak'],
  Medium: ['regularly', 'week', 'days', 'not working', 'low pressure', 'jam', 'smell', 'stuck', 'overflowing', 'collected'],
}

const hash = (str) => {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

export function analyzeComplaint(text, { hasImage = false, hasLocation = true } = {}) {
  const t = ` ${text.toLowerCase()} `

  // 1–2. Understand + classify (weighted: distinctive multi-word signals win)
  let match = null
  let bestScore = 0
  for (const rule of RULES) {
    let score = 0
    for (const k of rule.keywords) {
      if (t.includes(k)) score += Math.min(k.length, 12)
    }
    if (score > bestScore) {
      bestScore = score
      match = rule
    }
  }
  bestScore = Math.round(bestScore / 12)

  // 3. Severity
  let severity = 'Medium'
  if (match?.emergency) {
    severity = 'Critical'
  } else if (SEVERITY_WORDS.High.some((w) => t.includes(w))) {
    severity = 'High'
  } else if (SEVERITY_WORDS.Medium.some((w) => t.includes(w))) {
    severity = 'Medium'
  } else if (bestScore > 0) {
    severity = 'Low'
  }

  // 4. Department (from matched rule; default to Municipal Corporation)
  const department = match?.department ?? 'Municipal Corporation — Grievance Cell'
  const category = match?.category ?? 'General Civic Issue'

  // 5. Priority score — composite of severity, detected signals, evidence and urgency
  const base = { Critical: 95, High: 83, Medium: 57, Low: 33 }[severity]
  const signalBonus = Math.min(bestScore * 2, 8) // stronger signal matches rank higher
  const jitter = hash(text) % 6
  const evidenceBonus = (hasImage ? 3 : 0) + (hasLocation ? 2 : 0)
  const urgencyBonus = /immediately|urgent|asap|now|danger|trapped|major|burst|flooding/.test(t) ? 4 : 0
  const maxScore = severity === 'Critical' ? 99 : severity === 'High' ? 92 : severity === 'Medium' ? 74 : 47
  const priority = clamp(base + signalBonus + jitter + evidenceBonus + urgencyBonus - 7, severity === 'Critical' ? 95 : 18, maxScore)

  // 7. Emergency detection
  const emergency = Boolean(match?.emergency)

  const confidence = clamp(0.86 + (bestScore > 2 ? 0.09 : 0.03) + (hasImage ? 0.02 : 0), 0, 0.99)

  return {
    category,
    department,
    severity,
    priority,
    emergency,
    confidence: Math.round(confidence * 100),
    detectedSignals: match
      ? match.keywords.filter((k) => t.includes(k)).slice(0, 4).map((k) => k.replace(/\b\w/g, (c) => c.toUpperCase()))
      : ['General civic issue'],
    analyzedAt: new Date().toISOString(),
  }
}

// 6. Duplicate / cluster detection (mock)
export function findSimilar(analysis, complaints) {
  if (analysis.emergency) return null
  const candidates = complaints.filter(
    (c) => c.category === analysis.category && c.status !== 'Resolved',
  )
  if (candidates.length === 0) return null
  const top = candidates.sort((a, b) => b.reports - a.reports)[0]
  return {
    complaintId: top.id,
    location: top.location.area,
    reports: Math.max(top.reports, 18),
    distanceKm: 0.4 + (hash(analysis.category) % 12) / 10,
  }
}

export const AI_STEPS = [
  'Understanding complaint…',
  'Detecting category…',
  'Analyzing severity…',
  'Identifying responsible department…',
  'Calculating priority score…',
  'Checking duplicate reports…',
]
