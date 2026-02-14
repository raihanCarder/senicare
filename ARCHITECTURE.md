# Architecture.md — Guardian Check-In (Hackathon MVP)

A senior-friendly daily health check-in web app that captures a short camera session + voice Q&A, extracts lightweight “digital biomarkers,” compares them to a personal baseline, then triages outcomes:

- **Green**: log only
- **Yellow**: add to weekly clinician summary (and optionally notify caregiver)
- **Red**: trigger urgent alert (Twilio SMS/voice) to emergency contact (NOT real EMS in demo)

This doc covers **features** and **general architecture** for MVP (Core 1–6) plus **MongoDB Atlas** (DB + Auth) and **ElevenLabs** (voice AI).

---

## 1) Core Features (MVP)

### 1. Daily Check-In UX (Senior-Friendly)

- Large high-contrast UI with a single “Start Check-In” button
- Simple progress steps:
  1. **Camera capture** (≈ 20–30 seconds)
  2. **Voice Q&A** (2–3 questions)
  3. **Results** (Green/Yellow/Red + short explanation)
- Basic environment checks:
  - “Lighting too low” warning
  - “Face not centered / too much motion” prompt
- “Demo Mode” toggle (to avoid real emergency calls)

### 2. Visual Signals (Camera)

Choose 1–2 signals that are feasible and demoable:

- **Face landmarks** (MediaPipe Face Mesh):
  - Compute a **facial symmetry score** (difference L/R for key landmarks)
  - Detect **sudden deviation vs baseline** (Red candidate)
- **Heart rate estimate (rPPG)**:
  - Simple HR estimate from face region color changes (forehead/cheeks ROI)
  - Store HR + quality score; use baseline deviation for Yellow/Red support
- (Optional) **Respiratory proxy**:
  - Rough breath rate via upper chest/shoulder motion (Yellow signal only)

### 3. Talking Part (Voice AI + Well-being Q&A)

- Microphone capture during Q&A
- **ElevenLabs Voice AI** for:
  - **Text-to-Speech (TTS)** to speak questions back to the user
  - (Optional) **Conversational agent** behavior (prompted question flow)
- Speech-to-text transcription (e.g., Whisper / Google STT) for analysis + logging
- Extract simple metrics:
  - words/min
  - longest pause
- Q&A examples (keep short):
  - “How are you feeling today?”
  - “Any dizziness, chest pain, or trouble breathing?” (yes/no)
  - “Did you take your morning meds?” (yes/no)
- LLM summarization of responses into a clinician-friendly note (Gemini/OpenAI)

> Note: ElevenLabs provides the **voice experience** (speaking). STT still needs a transcription provider unless you use ElevenLabs’ own STT (if available in your chosen plan).

### 4. Baseline & Anomaly Detection (No custom model training)

- “Learning phase” for first **N sessions** (e.g., 3–5):
  - Build personal baseline for metrics (HR, symmetry, speech rate/pause)
- After baseline exists:
  - Detect deviations using simple statistics:
    - rolling mean / std dev
    - threshold rules (e.g., >2.5σ or % deviation)
- Output:
  - Status: Green/Yellow/Red
  - Reasons: short, human-readable, auditable

### 5. Clinician-Ready Logging + Weekly Summary

- Each check-in persists:
  - raw metrics + derived metrics + transcripts + triage result
- Weekly summary generator:
  - trends (e.g., “HR elevated 4/7 days”)
  - notable events (all Yellow/Red)
  - short narrative summary for clinician
- Export/share options (MVP):
  - View in-app
  - Email (optional) or copyable text

### 6. Alerting / Escalation

- Red triggers:
  - Twilio SMS and/or automated voice call to **Emergency Contact**
  - In demo mode, route only to team phones
- Yellow triggers:
  - included in weekly clinician summary (optionally notify caregiver)
- Logging for compliance:
  - record when alerts were sent and delivery status

---

## 2) Additional App Features (MongoDB Atlas: DB + Auth)

### Authentication & Accounts (MongoDB Atlas App Services)

- **MongoDB Atlas App Services Authentication** (Email/Password; optionally OAuth)
- Session management using App Services SDK or JWTs issued by App Services
- Roles:
  - **Senior/User**
  - **Caregiver/Family**
  - **Clinician/Provider**
  - **Admin** (hackathon/dev only)
- Relationship mapping:
  - A senior can have multiple caregivers
  - Clinician can be linked to many seniors (optional in MVP)

### Profiles & Settings

- Senior profile:
  - name, DOB (optional), timezone
  - emergency contact phone(s)
  - clinician email (optional)
  - consent flags
- Check-in settings:
  - preferred time window
  - which questions enabled
  - alert sensitivity (standard vs conservative)
- Privacy controls:
  - retention settings (store frames? store audio? store transcript only?)

### Audit & Safety

- “This is not a medical device” disclaimer + consent capture
- Audit trail for:
  - check-ins created
  - baseline updated
  - alerts sent
  - weekly summary generated/viewed/exported

---

## 3) System Architecture (High Level)

### Components

1. **Client (Web App)**
   - UI for seniors (check-in flow)
   - UI for caregivers (status + alerts)
   - UI for clinicians (weekly summary + trends)
   - Captures camera + mic
   - Plays back spoken prompts via **ElevenLabs TTS**
   - Uploads captured artifacts/answers to backend

2. **Backend API (Application Server)**
   - Handles check-in orchestration and analysis pipeline
   - Verifies user identity via **MongoDB Atlas App Services Auth**
   - Stores data in **MongoDB Atlas**
   - Generates triage results + summaries
   - Triggers Twilio alerts
   - Coordinates voice prompts (text) that are rendered by ElevenLabs on the client

3. **Analysis Pipeline**
   - Vision:
     - MediaPipe face mesh for landmarks/symmetry
     - rPPG HR estimate (optional)
   - Audio:
     - speech-to-text transcription
     - pause and rate metrics
   - LLM:
     - produces clinician-friendly summaries
     - optionally produces a “risk reasoning” explanation (kept short)

4. **Database & Auth**
   - **MongoDB Atlas** for data storage
   - **MongoDB Atlas App Services** for authentication and rules

5. **External Services**
   - **ElevenLabs** (TTS / Voice AI prompts)
   - Twilio (SMS/voice)
   - Speech-to-text provider (Whisper / Google STT)
   - LLM provider (Gemini/OpenAI)

### Recommended MVP Deployment (Hackathon-Friendly)

- Frontend: Streamlit (fast) **OR** Next.js (polished)
- Backend: FastAPI (Python) or Node/Express (if your team prefers JS)
- DB + Auth: **MongoDB Atlas + Atlas App Services**
- Storage: S3-compatible (optional) for audio/video artifacts
- ElevenLabs for voice prompts, Twilio for alerts

---

## 4) Data Flow (MVP)

### A) Daily Check-In Flow

1. User logs in (MongoDB Atlas App Services Auth) → taps **Start Check-In**
2. Client captures:
   - short video (or sampled frames) + basic metadata (lighting, motion)
   - audio for Q&A (or continuous)
3. Voice interaction:
   - Backend (or client) decides next question text
   - Client calls ElevenLabs TTS to play: “How are you feeling today?”
4. Client uploads to backend:
   - `POST /checkins/start`
   - `POST /checkins/{id}/upload` (video/frames + audio)
   - `POST /checkins/{id}/complete` (answers + transcript if client-side STT)
5. Backend runs analysis:
   - compute visual metrics (symmetry, HR estimate)
   - compute audio metrics (rate/pause)
   - fetch/update baseline from MongoDB
   - triage classification
   - write check-in document(s)
6. Backend returns:
   - status (Green/Yellow/Red)
   - short explanation
   - “what happens next” message
7. If Yellow/Red:
   - log alert intent/result
   - trigger Twilio (Red immediately; Yellow optional)
8. Client displays result + confirmation

### B) Weekly Summary Flow

- scheduled job (cron) or on-demand button:
  - `POST /summaries/weekly?senior_id=...`
- backend:
  - fetch last 7 days check-ins from MongoDB
  - compute trends + notable events
  - produce clinician summary text (LLM)
  - store summary document
- clinician/caregiver views it in dashboard

---

## 5) Triage Logic (Simple, Auditable)

### Inputs (per check-in)

- `symmetry_score` (0..1 or a normalized diff)
- `hr_bpm_estimate` + `hr_signal_quality`
- `speech_wpm`
- `max_pause_seconds`
- self-report flags:
  - dizziness (yes/no)
  - chest pain (yes/no)
  - trouble breathing (yes/no)
- baseline stats for each metric:
  - rolling mean + std dev
  - last value

### Output

- `triage_status`: GREEN | YELLOW | RED
- `triage_reasons`: list of short strings
- `confidence`: low/medium/high (optional)

### Example Rules (MVP)

- **RED** if any of:
  - symmetry deviates sharply from baseline (e.g., > X threshold) AND user reports dizziness/confusion
  - chest pain == yes OR trouble breathing == yes (self-report hard trigger for demo)
- **YELLOW** if:
  - HR is elevated vs baseline by >Y% with good signal quality
  - speech pause metrics worsen vs baseline beyond threshold
  - user reports dizziness == yes (without RED corroboration)
- **GREEN** otherwise

> NOTE: In hackathon/demo, keep it conservative and avoid claiming diagnosis. Phrase it as “unusual change detected.”

---

## 6) Database Schema (MongoDB Collections)

### users

- `_id` (ObjectId)
- `email` (unique)
- `role` (senior/caregiver/clinician/admin)
- `name`
- `createdAt`

> Auth credentials are managed by Atlas App Services; store profile fields here.

### seniors

- `_id` (ObjectId)
- `userId` (ref to users.\_id)
- `dob` (optional)
- `timezone`
- `consentAcceptedAt`
- `emergencyContact`:
  - `name`
  - `phone`
- `clinicianEmail` (optional)

### relationships

- `_id`
- `seniorId`
- `caregiverUserId`
- `clinicianUserId` (optional)
- `status` (active/invited)
- `createdAt`

### checkins

- `_id`
- `seniorId`
- `startedAt`
- `completedAt`
- `status` (in_progress/completed/failed)
- `triageStatus` (green/yellow/red)
- `triageReasons` (array)
- `notesForUser`
- `notesForClinician`
- `rawTranscript` (optional)
- `createdAt`

### metrics

- `_id`
- `checkinId`
- `type` (symmetry/hr_bpm/hr_quality/speech_wpm/max_pause/resp_rate/etc.)
- `value`
- `unit`
- `createdAt`

### baselines

- `_id`
- `seniorId`
- `metricType`
- `sampleCount`
- `mean`
- `stdDev`
- `lastValue`
- `updatedAt`

### alerts

- `_id`
- `checkinId`
- `seniorId`
- `level` (yellow/red)
- `channel` (sms/voice/email)
- `target` (phone/email)
- `providerMessageId` (nullable)
- `status` (queued/sent/delivered/failed)
- `createdAt`

### weekly_summaries

- `_id`
- `seniorId`
- `weekStartDate`
- `weekEndDate`
- `summaryText`
- `keyTrends` (array)
- `createdAt`

---

## 7) API Endpoints (Sketch)

### Auth (Atlas App Services)

- Client uses Atlas App Services SDK:
  - signup/login/logout
  - session handling
- Backend verifies identity (JWT/session token) on requests

### Backend

- `POST /checkins/start`
- `POST /checkins/{checkin_id}/upload` (multipart: video/audio OR frames+audio)
- `POST /checkins/{checkin_id}/complete` (answers, transcript if needed)
- `GET /checkins/{checkin_id}`
- `GET /seniors/{senior_id}/checkins?from=&to=`
- `GET /seniors/{senior_id}/baseline`
- `POST /seniors/{senior_id}/summaries/weekly`
- `GET /seniors/{senior_id}/summaries/weekly?week_start=`
- `POST /alerts/test` (demo mode only)
- `GET /seniors/{senior_id}/alerts`

---

## 8) Security, Privacy, and “Hackathon Safe” Defaults

- Do **not** call real emergency numbers. Use:
  - emergency contact phone(s) for SMS/voice
  - demo mode routing to team devices
- Store minimal sensitive data:
  - prefer transcripts/metrics over raw audio/video
  - if storing media, encrypt at rest and set short retention
- Access control:
  - caregivers see only linked seniors
  - clinicians see only assigned seniors
- Add “signal quality” gating:
  - if low confidence (bad lighting/motion), show “Try again” rather than raising risk

---

## 9) Minimal Team Task Breakdown (24–48h)

### Teammate A — Frontend UX

- Check-in flow screens
- ElevenLabs TTS playback integration
- Results screen + status card
- Clinician weekly summary page

### Teammate B — Vision

- MediaPipe face mesh + symmetry score
- optional rPPG HR estimate + quality score

### Teammate C — Audio + LLM

- STT pipeline
- pause + speech rate metrics
- LLM prompt for clinician summary

### Teammate D — Backend + MongoDB + Twilio

- Atlas App Services Auth integration + roles
- MongoDB collections + CRUD
- triage rules + Twilio alert triggers

---

## 10) Prompts (LLM) — MVP Templates

### Clinician Summary Prompt (Weekly)

System: You are a clinical assistant. Write concise, factual summaries. Do not diagnose. Report trends and notable events.

User: Here are 7 days of check-in data for a senior. Provide:

1. top trends (bullets)
2. notable events (bullets)
3. brief summary paragraph for clinician review

Data: {json}

### Check-in Note Prompt (Daily)

System: You are a geriatric triage assistant. Do not diagnose. Explain abnormalities as “signals” and recommend follow-up actions.

User: Summarize this check-in for caregiver and clinician. Provide:

- user-facing: 1–2 reassuring sentences
- clinician-facing: brief structured note

Data: {json}

---

## 11) Definition of Done (MVP)

- Auth works via MongoDB Atlas App Services (senior login + caregiver/clinician view)
- One complete check-in works end-to-end:
  - capture → analysis → baseline compare → triage → MongoDB write → result UI
- Weekly summary generates from stored check-ins
- Twilio alert triggers on Red (demo phone receives SMS/call)
- ElevenLabs voice prompts play during Q&A
- Clear disclaimers + demo mode
