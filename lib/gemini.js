import 'server-only';

/**
 * Server-side Google Gemini service.
 *
 * The API key is read only inside this module and is NEVER exposed to the
 * browser. All AI calls are made from Next.js Route Handlers.
 *
 * NOTE: responseMimeType / responseSchema constraints are deliberately not
 * used so the same code path works across Gemini 1.5/2.x flash models that
 * power the demo. Output is forced to JSON via strict prompting and then
 * parsed + schema-validated in lib/validation.js before it is ever stored.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_ENDPOINT =
  process.env.GEMINI_ENDPOINT ||
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export const GEMINI_READY = Boolean(GEMINI_API_KEY);

/** Marker used to embed inline image bytes into a generation request. */
export function makeImagePart(mimeType, base64Data) {
  return { inlineData: { mimeType, data: base64Data } };
}

/** Extract the first plausible JSON object from a model response. */
export function extractJson(text) {
  if (!text) throw new Error('AI returned an empty response.');
  let cleaned = text.trim();
  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) cleaned = fence[1].trim();

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('AI response did not contain valid JSON.');
  }
  const candidate = cleaned.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    throw new Error('AI returned malformed JSON.');
  }
}

/**
 * Core generation helper. `parts` = array of text/inlineData parts.
 * Returns the trimmed text of the first candidate.
 */
async function generateContent(parts, { temperature = 0.2, maxTokens = 1200 } = {}) {
  if (!GEMINI_READY) {
    const err = new Error('Gemini API key is not configured on the server.');
    err.code = 'GEMINI_NOT_CONFIGURED';
    throw err;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const res = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          topP: 0.95,
        },
      }),
    });

    if (!res.ok) {
      let detail = '';
      try {
        const body = await res.json();
        detail = body?.error?.message || body?.error?.status || '';
      } catch {
        /* ignore body parse failures */
      }
      const err = new Error(
        `Gemini API error (${res.status})${detail ? `: ${detail}` : ''}`
      );
      if (res.status === 429) {
        err.code = 'GEMINI_RATE_LIMIT';
        const retryAfter = Number.parseInt(res.headers.get('retry-after') || '', 10);
        const retryFromMessage = detail.match(/retry in ([\d.]+)s/i)?.[1];
        const retryAfterSec = retryAfter || (retryFromMessage ? Math.ceil(Number(retryFromMessage)) : 60);
        err.retryAfterSec = Number.isFinite(retryAfterSec) ? retryAfterSec : 60;
      }
      else if (res.status === 400) err.code = 'GEMINI_BAD_REQUEST';
      else if (res.status === 401 || res.status === 403) err.code = 'GEMINI_AUTH';
      else if (res.status === 404) err.code = 'GEMINI_MODEL';
      else if (res.status >= 500 && res.status <= 599) err.code = 'GEMINI_UNAVAILABLE';
      else err.code = 'GEMINI_API_ERROR';
      throw err;
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || '')
      .join('');
    if (!text) {
      const blockReason = data?.promptFeedback?.blockReason;
      throw new Error(
        blockReason ? `AI response blocked (${blockReason}).` : 'AI produced no text output.'
      );
    }
    return text;
  } catch (err) {
    if (err?.name === 'AbortError') {
      const e = new Error('Gemini request timed out. Please try again.');
      e.code = 'GEMINI_TIMEOUT';
      throw e;
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/** Ask Gemini to return a single JSON object. */
async function generateJson(systemPrompt, userText, imageData) {
  const parts = [{ text: `${systemPrompt}\n\nUSER INPUT:\n${userText}` }];
  if (imageData?.mimeType && imageData?.base64) {
    parts.push(makeImagePart(imageData.mimeType, imageData.base64));
  }
  const raw = await generateContent(parts, { temperature: 0.15, maxTokens: 1600 });
  return extractJson(raw);
}

/* ------------------------------------------------------------------ */
/* Analysis system prompts                                            */
/* ------------------------------------------------------------------ */

const COMPLAINT_SYSTEM = `
You are the AI understanding engine of CivicAI, an Indian civic-tech platform. You analyze a citizen's complaint and return ONE JSON object.

RULES:
- Complaints describe civic/public issues in India (waste, water, roads, drainage, street lights, sanitation, traffic, pollution, infrastructure, illegal dumping, fire, medical emergencies, public safety, etc).
- If the text is NOT a civic issue (marketing, ads, spam, jokes, personal disputes, exam/homework text, greetings, unrelated questions), set "isCivicIssue" to false and stop.
- Category must be one of exactly: Waste Management, Roads, Water Supply, Drainage, Street Lights, Public Sanitation, Traffic, Pollution, Public Infrastructure, Illegal Dumping, Fire, Medical Emergency, Public Safety, Other.
- If a category seems missing, pick the closest.
- department: the municipal department that should handle it (plain English label, e.g. "Water Supply Department"). For fire/medical/public-safety pick the appropriate service name.
- severity: integer 1-10 reflecting potential harm, urgency and number of people affected.
- priority: "Emergency", "High", "Medium" or "Low".
- confidence: 0 to 1.
- isEmergency: true only for immediate danger to life or property (active fire, gas leak, building collapse, major road accident, medical emergency, flooding, electrical hazard, tree about to fall, etc.). Not for routine civic issues.
- emergencyType: short noun if isEmergency (e.g. "Fire", "Gas Leak", "Medical Emergency").
- recommendedResponses: array of response units ONLY when isEmergency is true, chosen from: Fire Department, Police, Ambulance, Electricity Department, Disaster Management, Gas/Emergency Services.
- impact flags (publicSafetyImpact, infrastructureImpact, healthImpact): true when the issue plausibly threatens those.
- peopleAffectedEstimate: coarse estimate of people affected: "Very few (under 10)", "Some (10-100)", "Many (100-1000)", "Very many (1000+)".

TONE: neutral, factual, never speculative accusations.

Respond with ONLY the JSON object, no markdown fences, no commentary.`;

const COMPLAINT_JSON_SCHEMA = `
Output JSON must match exactly this shape:
{
  "isCivicIssue": true,
  "issue": "short issue label e.g. Water Pipeline Leakage",
  "category": "Water Supply",
  "department": "Water Supply Department",
  "priority": "High",
  "severity": 8,
  "confidence": 0.94,
  "summary": "one sentence summary",
  "reason": "short explanation",
  "keywords": ["water", "leakage", "pipeline", "bus stand"],
  "peopleAffectedEstimate": "Some (10-100)",
  "publicSafetyImpact": false,
  "infrastructureImpact": true,
  "healthImpact": true,
  "isEmergency": false,
  "emergencyType": null,
  "recommendedResponses": []
}
When isCivicIssue is false return: {"isCivicIssue": false, "confidence": 0.96, "reason": "explanation", "summary": "one line"}
`;

const IMAGE_SYSTEM = `
You are the visual evidence analyzer of CivicAI. A citizen uploaded a photograph as evidence of a civic problem in India. Analyze the image and return ONE JSON object.

RULES:
- Identify visible civic issues (garbage, waterlogging, damaged road, broken street light, encroachment, sewer overflow, fire, flooding, etc.).
- If the image shows no identifiable civic problem (portrait, food, animal, random object, screenshot, meme, text-only image, etc.), set "isCivicIssue" to false and set "notCivicReason".
- category must be one of exactly: Waste Management, Roads, Water Supply, Drainage, Street Lights, Public Sanitation, Traffic, Pollution, Public Infrastructure, Illegal Dumping, Fire, Medical Emergency, Public Safety, Other.
- severity: integer 1-10 estimated from what is VISIBLE.
- imageRelevant: true when the photograph plausibly depicts a civic issue in a real setting.
- suspicious: true ONLY for clear manipulation signs (obvious screenshots of other screens, doctored overlays, stock-photo watermarks suggesting the photo was reused). Be conservative.
- visibleEvidence: 2-4 short factual observations.
- confidence: 0 to 1.

HONESTY: You cannot prove authenticity. Never claim proof; describe what appears visible.

Respond with ONLY the JSON object, no markdown fences, no commentary.`;

const IMAGE_JSON_SCHEMA = `
Output JSON must match exactly this shape:
{
  "isCivicIssue": true,
  "detectedIssue": "Garbage Accumulation",
  "category": "Waste Management",
  "severity": 8,
  "confidence": 0.91,
  "visibleEvidence": ["Multiple garbage bags", "Waste accumulated beside road"],
  "impact": "Potential sanitation concern",
  "imageRelevant": true,
  "suspicious": false,
  "reason": "short explanation"
}
When no civic issue is visible return: {"isCivicIssue": false, "confidence": 0.9, "reason": "explanation", "visibleEvidence": [], "imageRelevant": false, "suspicious": false, "notCivicReason": "what the image actually shows"}`;

const VERIFY_SYSTEM = `
You are the cross-validation engine of CivicAI. Compare a citizen's TEXT complaint analysis with the IMAGE analysis of their uploaded evidence, plus approximate location. Return ONE JSON object describing how consistent the evidence is.

Input is provided as JSON: { "textAnalysis": {...}, "imageAnalysis": {...}, "location": {...} }.

RULES:
- matchScore: integer 0-100 measuring how strongly the image supports the same civic issue as the text.
- verificationStatus: "VALID" when the image clearly shows the same issue/category; "SUSPICIOUS" when there is partial or weak consistency; "INVALID" when the image shows an unrelated/different issue or contradicts the text; "UNVERIFIABLE" when no usable image evidence exists.
- If the image analysis says isCivicIssue=false (no civic issue visible) while the text is a clear civic complaint, use "INVALID" with a respectful reason.
- Never accuse citizens of fraud. Neutral, factual phrasing ("appears consistent", "does not appear to match", "cannot be fully verified").
- concerns: short array of concrete gaps (e.g. blurred image, category mismatch, duplicate risk) — empty when none.
- recommendedAction: one of "proceed", "review", "re-submit evidence".

Respond with ONLY the JSON object, no markdown fences, no commentary.`;

const VERIFY_JSON_SCHEMA = `
Output JSON must match exactly this shape:
{
  "verificationStatus": "VALID",
  "matchScore": 94,
  "textImageMatch": true,
  "reason": "The image shows accumulated garbage consistent with the submitted complaint.",
  "concerns": [],
  "recommendedAction": "proceed"
}`;

/* ------------------------------------------------------------------ */
/* Public service functions                                           */
/* ------------------------------------------------------------------ */

/** Full complaint understanding: classification, severity, emergency. */
export async function analyzeComplaint({ complaint, imageData }) {
  const userPayload = { complaint };
  const json = await generateJson(
    `${COMPLAINT_SYSTEM}\n${COMPLAINT_JSON_SCHEMA}`,
    JSON.stringify(userPayload),
    imageData || null
  );
  return json;
}

/** Visual evidence analysis. */
export async function analyzeImageEvidence({ imageData }) {
  const json = await generateJson(
    `${IMAGE_SYSTEM}\n${IMAGE_JSON_SCHEMA}`,
    'Analyze this uploaded photograph as civic evidence.',
    imageData || null
  );
  return json;
}

/** Text vs image cross-validation. */
export async function verifyTextAndImage({ textAnalysis, imageAnalysis, location }) {
  const userPayload = { textAnalysis, imageAnalysis, location: location || null };
  const json = await generateJson(
    `${VERIFY_SYSTEM}\n${VERIFY_JSON_SCHEMA}`,
    JSON.stringify(userPayload)
  );
  return json;
}

export { generateJson };
