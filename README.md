# CivicAI — AI-Powered Smart Grievance & Emergency Response System

A production-quality **frontend** for a civic-tech platform. Citizens report local problems via
**text, voice, image or live location**; a simulated AI pipeline classifies the issue, scores its
priority, detects emergencies/duplicates and routes it to the correct municipal department.
Admins get a control-room dashboard, complaints register, live map and emergency desk.

> **Frontend only.** React + Vite + Tailwind CSS. All AI logic, geolocation results and data are
> realistic front-end simulations (`src/utils/ai.js`, `src/data/mockData.js`) structured so they can
> be swapped for real REST/WebSocket/AI APIs without changing the UI.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
```

## Demo flow (hash routing)

1. **`#/`** — Landing page: hero app preview (live map + AI priority card + emergency chip),
   pipeline walkthrough, features.
2. **`#/report`** — Report an issue:
   - Click **🎙️ Start Recording** → voice simulation transcribes *"There is a major water pipeline
     leakage near the bus stand…"* (or click a demo chip).
   - AI analysis appears live: **Water Supply · High · Water Supply Department · 91/100**.
   - Duplicate panel: *42 citizens reported a similar issue nearby (CIV-2026-0917)*.
   - Location card auto-detects GPS. **Submit** → 6-step AI processing overlay → confirmation with
     complaint ID → **Track Complaint** / **View in Admin Dashboard**.
   - Try the **"Fire near market"** chip (or `#/report?emergency=1`) → red **EMERGENCY DETECTED**
     panel with Fire / Ambulance / Police dispatch cards.
3. **`#/track?id=CIV-2026-0917`** — Complaint timeline (Submitted → AI Analysis → Assigned →
   Under Review → In Progress → Resolved) with priority gauge and map.
4. **`#/map`** — Citizen live map with priority filters + incident list.
5. **`#/admin`** — Admin shell (dark sidebar, greetings, notifications):
   - KPI cards, trend chart, priority donut, department bars, latest reports.
   - **Complaints** — searchable / sortable / filterable enterprise table (cards on mobile);
     click a row for the **Complaint Detail** page (AI analysis, assignment, status progression,
     "Advance status" action).
   - **Emergency Cases** — live incident cards with response teams, ETAs, resolve action.
   - **Live Map · Departments · Analytics · Users · Settings**.
6. **`#/login` / `#/register`** — polished auth screens with validation, password toggle and
   simulated loading.

## Architecture

```
src/
├── components/
│   ├── common/      # Button, Badge, Input/Textarea, Modal, PriorityScore, states, meta…
│   ├── layout/      # PublicNavbar, Footer, AdminLayout (sidebar + topbar)
│   ├── civic/       # VoiceRecorder, ImageUpload, LocationCard, AIAnalysisCard,
│   │                # EmergencyPanel, DuplicatePanel, AIProcessing, ComplaintTimeline,
│   │                # MapPanel (stylised SVG city map), ComplaintCard
│   └── dashboard/   # KpiCard, Charts (CSS/SVG), ComplaintsTable
├── pages/           # Landing, ReportIssue, TrackComplaint, LiveMap, Auth, About
│   └── admin/       # Dashboard, Complaints, ComplaintDetail, Emergency, AdminMap, …
├── context/         # AppContext (hash router, complaint store, toasts)
├── data/            # Realistic mock complaints/notifications/users
├── utils/           # ai.js (mock classification/priority/duplicate pipeline), format.js
└── constants/       # Departments, statuses, severity, navigation
```

## Design system

- **Colours:** white surfaces, near-black type, deep navy headings/nav, blue primary actions,
  sky-blue highlights, cool-grey chrome; red reserved for emergencies, orange/amber for priority,
  green for resolved.
- **Type:** Inter with a strict heading/body scale.
- **Tokens:** 8px spacing, consistent radii (`rounded-lg/xl`), two shadow levels (`shadow-card`,
  `shadow-pop`), `PriorityScore` animated SVG gauge used across pages.
- **Accessible:** semantic landmarks, labelled controls, focus rings, ARIA live regions for
  recording/AI status, keyboard-operable modal and timeline.
