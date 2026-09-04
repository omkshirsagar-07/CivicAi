# CivicAI — AI-Powered Smart Grievance & Emergency Response System

**CivicAI** turns a citizen's raw description of a civic problem — typed **or spoken in English,
Hindi or Marathi** — into a **structured, verified, prioritized** civic report, backed by
**photographic evidence** and a **confirmed location**.

> **Voice/Text → AI Understanding → Image Evidence → AI Verification → Emergency Detection →
> Priority → Location → Authentication → MongoDB Submission**

The frontend and backend live in **one Next.js project** (App Router + Route Handlers). No
Express, no OpenAI, no separate backend, no external image CDN.

---

## ✨ Feature overview

| Area | What you get |
|---|---|
| **Homepage** | Hero with a live product preview, "How it works", 6 feature cards, an emergency section, a live-map preview and final CTA. Demo statistics are explicitly labelled. |
| **Auth** | Login / Signup / Forgot-password. Passwords hashed with bcrypt (12 rounds). Sessions via signed HttpOnly cookies (JWT/HMAC, 7-day). Signup auto-logs you in. |
| **Describe** | Large editable textarea with example prompts + **voice input** via the browser Web Speech API (`en-IN`, `hi-IN`, `mr-IN`) converted to editable text. |
| **AI analysis** | Google Gemini (server-side) classifies the issue, category, department, severity, confidence, summary and reason — and **rejects non-civic input**. |
| **Emergency detection** | Fires/life-safety language is flagged with recommended units (Fire/Police/Ambulance) + an honest "call 112" note. CivicAI never claims to auto-dial services. |
| **Priority** | The model's output is **re-scored by a deterministic engine** (severity × category weight + emergency/impact/population factors) into a transparent 0–100 score. |
| **Evidence** | Photo upload (JPG/PNG/WebP/GIF ≤ 10 MB) validated by magic bytes and stored in **MongoDB GridFS**. Gemini vision analyzes it server-side. |
| **Verification** | AI cross-checks the text analysis against the photo analysis → `VALID / SUSPICIOUS / UNVERIFIABLE / INVALID` with a match score and human-review disclaimer. |
| **Duplicates** | After the location is set, similar reports within ~2 km are found by geo proximity + category + text similarity. New reports are never auto-rejected. |
| **Location** | Interactive Google Map picker: use current location (GPS), click the map, drag the marker, or enter coordinates manually — with reverse-geocoded address. |
| **Final review** | Review + per-section "Edit" jumps; **Confirm & Submit** requires login (draft preserved across login via sessionStorage). |
| **Reports** | Stored in MongoDB with sequential unique IDs `CIV-YYYY-XXXXXX` (atomic counter). Success screen shows the reference ID. |
| **Public map** | `/map` shows privacy-safe markers by priority from MongoDB; sample markers appear until the first real report exists. |
| **Admin console** | Role-protected `/admin` dashboard with report management, scoped department queues, live map and proof-required resolution. |

---

## 🧱 Architecture

```
Citizen (browser)
      │  text / voice / image / GPS
      ▼
Next.js App Router ────────────────┐
│  pages + client components        │  Route Handlers (API)
│  (React, Tailwind, lucide icons)  │    POST /api/analyze-complaint
│                                   │    POST /api/images        (GridFS upload)
│  Google Maps JS API (optional)    │    POST /api/analyze-image (Gemini vision)
│  Web Speech API (voice)           │    POST /api/verify-report
└──────────┬────────────────────────┘    POST /api/duplicates
           │ httpOnly session cookie     POST /api/reports   (auth-checked, submit)
           ▼                             GET  /api/map        (public feed)
      Google Gemini (server only)
           │
           ▼
      MongoDB Atlas  ── reports/users ── GridFS bucket "civic" (photos)
```

### Key server modules
- `lib/mongodb.js` — cached Mongoose connection
- `lib/auth.js` — jose-signed sessions, cookie helpers, bcrypt hashing, CSRF/origin checks
- `lib/gemini.js` — all Gemini text & vision calls (`generateContent`, v1beta, JSON extraction)
- `lib/gridfs.js` — store / stream / delete evidence images (bucket `civic`)
- `lib/validation.js` — **strict schema validation of every AI output** (never trust the model)
- `lib/duplicates.js` — nearby similar-report search
- `lib/report-id.js` — atomic `reportCounters` collection → `CIV-2026-000001`
- `utils/priority.js` — deterministic priority engine
- `models/User.js`, `models/Report.js` — Mongoose schemas (with 2dsphere geo index)

### API surface
```
POST /api/auth/register           POST /api/analyze-complaint
POST /api/auth/login              POST /api/images            (multipart → GridFS)
POST /api/auth/logout             GET  /api/images/[fileId]   (binary stream)
GET  /api/auth/session            POST /api/analyze-image     (Gemini vision)
POST /api/auth/forgot-password    POST /api/verify-report
                                  POST /api/duplicates
POST /api/reports  (auth required)  GET /api/map
GET  /api/admin/reports             GET /api/admin/reports/[id]
POST /api/admin/reports/[id]        (admin auth; multipart resolution proof)
POST /api/admin/users               (main admin only; creates department admin)
```

---

## 🗄 MongoDB Atlas + GridFS setup

1. Create a free cluster at <https://www.mongodb.com/atlas>.
2. Add a database user with read/write rights, and allow your IP (or `0.0.0.0/0` for demos).
3. Copy the connection string — it looks like `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net`.
4. That's it: collections (`users`, `reports`, `reportcounters`, `civic.files`, `civic.chunks`) and indexes are created automatically on first use.
5. **GridFS** needs no extra setup — the app stores uploaded photos in a bucket named `civic` and stores only the GridFS **file id** in each report document (no giant Base64 blobs in reports).

## 🤖 Google Gemini setup

1. Get a free API key at <https://aistudio.google.com/apikey>.
2. Set `GEMINI_API_KEY`. The default model is `gemini-2.5-flash` (override with `GEMINI_MODEL`).
3. The key is only read in server code (`lib/gemini.js`) and never shipped to the browser.

## 🗺 Google Maps setup (optional but recommended)

1. Enable the **Maps JavaScript API** (and **Geocoding API** if you want reverse-geocoded addresses) at <https://console.cloud.google.com/google/maps-apis>.
2. Create a browser key **restricted to your domain(s)** and the APIs above.
3. Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. This is the *only* key exposed to the browser.
4. Without a key, the app still works: location picker falls back to GPS + manual entry, and the public map shows a stylized preview.

## 🔐 Environment variables

Create `.env.local` (see `.env.local.example`):

```env
MONGODB_URI=
MONGODB_DB=civicai
GEMINI_API_KEY=
AUTH_SECRET=          # openssl rand -base64 48
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

**Security rules enforced by the app:**
- `MONGODB_URI`, `GEMINI_API_KEY`, `AUTH_SECRET` never appear in client bundles.
- Passwords are hashed; sessions are HttpOnly, SameSite=Lax cookies; CSRF origin checks on every mutating route; in-memory rate limiting on auth/upload routes.
- All AI JSON is re-validated against strict schemas and the priority is recomputed deterministically before storage.
- The public map query selects only public fields — names/emails are never exposed.
- Admin report queries enforce `MAIN_ADMIN` or `DEPARTMENT_ADMIN` server-side. Department admins are restricted to their stored department.

## Admin setup

Admin accounts use the same `/api/auth/login` session cookie as citizen accounts. New users default to `CITIZEN`; promote an existing user in the current `users` collection using server-side database tooling:

```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "MAIN_ADMIN", department: null } })
db.users.updateOne({ email: "roads@example.com" }, { $set: { role: "DEPARTMENT_ADMIN", department: "Roads & Infrastructure Department" } })
```

Open `http://localhost:3000/admin/login`. No admin credentials are seeded by the application.

---

## 🚀 Getting started

```bash
npm install
# fill in .env.local from .env.local.example
npm run dev
```

Open http://localhost:3000.

Production:
```bash
npm run build
npm start
```

---

## 🎬 Suggested 2-minute demo

1. Open `/` — homepage hero shows what CivicAI does.
2. Click **Report an Issue**.
3. Type *"There is a major water pipeline leakage near the bus stand."* — or press the mic and speak it in English/Hindi/Marathi, then edit the transcript.
4. Click **Analyze Complaint** → AI shows *Water Pipeline Leakage / Water Supply / Water Supply Department / HIGH / severity 8 / 94%*.
5. Upload a photo → GridFS stores it → Gemini vision analyzes it.
6. Verification shows a **match score** and **VALID**.
7. **Use current location** (or pick on the map) → confirm.
8. **Review** → **Confirm & Submit** → login/signup modal → submit → `CIV-2026-XXXXXX` success screen.
9. Repeat with *"There is a fire in a building near the market"* to show **🚨 Emergency detected → Fire Department / Ambulance / Police**.

---

## 📁 Project structure

```
civicai/
├─ app/
│  ├─ page.js                      # Homepage
│  ├─ login/ signup/ forgot-password/ report/ map/ about/
│  ├─ admin/ login/ dashboard/ reports/[id]/ map/
│  └─ api/ auth/{register,login,logout,session,forgot-password},
│      analyze-complaint, images/[fileId], analyze-image,
│      verify-report, duplicates, reports, map
├─ components/
│  ├─ layout/  Navbar, Footer
│  ├─ common/  Brand, SectionHeading
│  ├─ auth/    AuthShell, LoginForm, SignupForm, ForgotPasswordForm
│  ├─ report/  ReportWizard + 8 step panels
│  ├─ map/     useGoogleMaps, LocationPicker, PublicCivicMap
│  ├─ home/    Hero, HowItWorks, Features, EmergencySection, MapPreview…
│  └─ ui/      Button, Card, Badge, Modal, Input/Textarea, Alert, Spinner
├─ context/AuthContext.js · hooks/{useAuth,useSpeechRecognition}.js
├─ lib/  mongodb, auth, admin, gemini, gridfs, validation, duplicates, report-id, http, civic-data
├─ models/ User.js, Report.js
├─ utils/ priority.js, geo.js, client.js
├─ .env.local.example · README.md
```

**Made for civic-technology hackathons.** Homepage statistics are labelled “Demo statistics”,
and demo map markers are explicitly marked as samples — nothing fake is presented as production
data.
URL: http://localhost:3000/admin/login
Email: mainadmin@example.com
Password: mainadmin123
Role: MAIN_ADMIN

lights@gmail.com - 12345678