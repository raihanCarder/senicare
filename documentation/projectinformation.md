# SeniCare - Complete Project Information

## Executive Summary

**SeniCare** is a comprehensive senior-friendly daily health check-in application that won **Best Use of Gemini API @ CtrlHackDel 2026**. The platform combines computer vision analysis, real-time voice assessment, and AI-powered triage to provide rapid health status monitoring for elderly individuals with intelligent escalation to healthcare providers.

The application uses advanced multimodal analysis (facial symmetry detection, video-based heart rate estimation, speech-to-text analysis) combined with baseline deviation detection to classify patient health status into three triage levels (Green/Yellow/Red), with automatic escalation protocols for critical findings.

---

## Project Overview

### Core Vision & Problem Statement

SeniCare addresses the critical need for continuous, unobtrusive health monitoring of seniors in community or home-care settings. By combining biometric sensing (without specialized hardware) with AI-powered symptom screening, the application enables:

- **Early detection** of health changes through facial asymmetry and HR deviation
- **Remote assessment** without clinical visits
- **Automated triaging** for appropriate clinical escalation
- **Senior-friendly UX** with minimal barriers to daily use
- **Clinician efficiency** with AI-generated summaries and trend analysis

### Key Innovation

The application uniquely combines:
1. **Facial symmetry deviation analysis** to detect facial drooping (potential stroke indicators)
2. **Remote photoplethysmography (rPPG)** for contactless heart-rate monitoring
3. **Real-time voice screening** with Gemini Live for natural conversation and symptom extraction
4. **Baseline-aware anomaly detection** using statistical deviation thresholds
5. **Doctor dashboard** with actionable summaries for clinical review

---

## Technology Stack

### Frontend Architecture

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | React | 18.2.0 | UI component library |
| Build Tool | Vite | 5.2.0+ | Lightning-fast dev server & bundling |
| Styling | Tailwind CSS | 3.4.10 | Utility-first CSS framework |
| Icons | Lucide React | 0.564.0 | Clean, consistent iconography |
| Voice AI | ElevenLabs Client | 0.2.2+ | Text-to-speech and voice interaction |
| Voice Processing | Web Speech API | Native | Browser-based speech recognition |
| Testing | React Testing Library | 16.3.2+ | Component & integration testing |
| Dev Server | Vite Dev Server | Auto | Hot module replacement during development |

**Key Frontend Capabilities:**
- Real-time camera capture & video recording (`MediaRecorder` API)
- Microphone audio streaming with `getUserMedia`
- Facial recognition for ambient environment assessment
- ElevenLabs voice AI integration for conversational agent behavior
- JWT-based authentication with secure token storage
- Responsive UI for seniors and clinicians

### Backend Architecture

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| API Framework | FastAPI | 0.115.6 | Async Python web framework |
| Server | Uvicorn | 0.30.6 | ASGI application server with async support |
| Database | MongoDB | 4.4+ | Document store for flexible health records |
| DB Driver | PyMongo | 4.10.1 | Python MongoDB client |
| Authentication | python-jose + passlib | 3.3.0, 1.7.4 | JWT token creation & password hashing |
| Data Validation | Pydantic | 2.9.2 | Type-safe request/response schemas |
| File Handling | python-multipart | 0.0.9 | Multipart form data parsing for uploads |
| Async HTTP | httpx | Implicit | Async HTTP client for external service calls |
| Env Management | python-dotenv | 1.0.1 | Secure configuration management |
| SSL/Certs | certifi | 2025.1.31 | Certificate bundle for HTTPS |
| DNS | dnspyth | 2.6.1 | DNS support for MongoDB Atlas |

**Core Backend Modules:**

- `app/main.py` - FastAPI app initialization, CORS, route registration
- `app/auth.py` - JWT token generation, password hashing, user index creation
- `app/db.py` - MongoDB connection pooling, connection helpers
- `app/dependencies.py` - Dependency injection (current user, auth checks)
- `app/routes/` - API endpoint implementations:
  - `auth.py` - Register, login, ephemeral token generation
  - `checkins.py` - Health check-in workflow orchestration
  - `screenings.py` - Voice screening session management
  - `seniors.py` - Senior profiles, check-in history, baselines
  - `dashboard.py` - Doctor analytics and summaries
  - `alerts.py` - Alert creation and escalation
  - `reports.py` - AI-powered summary generation
  - `elevenlabs.py` - Voice AI integration
  - `health.py` - Service health monitoring

### Computer Vision & Analysis Services

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Facial Landmarks | MediaPipe | 0.10.32+ | Real-time face mesh detection (468 landmarks) |
| Image Processing | OpenCV | 4.12.0+ | Video frame analysis and preprocessing |
| Heart Rate Analysis | open-rppg | Custom | Remote photoplethysmography for HR estimation |
| Video Processing | ffmpeg/ffprobe | System | Video codec handling and analysis |
| Numerical Compute | NumPy | 2.0+ | Array operations for metric calculations |

**Analysis Pipeline Features:**
- Facial symmetry computation (mouth, eye, nasolabial fold asymmetry)
- Frame-by-frame quality assessment
- Outlier detection and filtering
- Statistical aggregation (median, p90, mean, std dev)
- HR waveform extraction from color channel fluctuations
- Signal quality index (SQI) calculation

### External AI Services

| Service | Purpose | Feature | Integration |
|---------|---------|---------|-------------|
| **Google Gemini** | Large Language Model | Live voice conversations, response parsing, summary generation | `google-genai` SDK (server-side ephemeral tokens) |
| **ElevenLabs** | Voice AI Platform | Text-to-speech for question delivery, voice identity, conversational agent | Browser SDK + signed URLs API |
| **Twilio** | Communications | SMS/voice call alerts to emergency contacts | REST API (not fully implemented in MVP) |
| **Speech-to-Text Provider** | Audio Transcription | Convert voice responses to text for analysis | Browser Web Speech API or external provider |

**Integration Patterns:**
- Ephemeral token generation for secure Gemini Live access from frontend
- Server-side token caching and refresh logic
- Streaming voice responses with real-time transcript capture
- ElevenLabs signed URL generation for authenticated voice agent access

---

## Application Features & Workflows

### 1. Senior Check-In Workflow

The complete daily health assessment flow:

**Step 1: Authentication & Initiation**
- Senior logs in with email/password
- JWT token issued for session
- Check-in UI presents large, high-contrast "Start Check-In" button
- System validates login status and role

**Step 2: Video Capture (Camera Biometrics)**
- ≈20-30 seconds of webcam video recording
- Real-time lighting assessment (warns if too dark)
- Motion detection (alerts if excessive movement)
- Frame preprocessing and quality filtering
- Upload to backend via multipart form data

**Step 3: Facial Analysis**
Backend processes video frame-by-frame:
- MediaPipe Face Mesh detection (468 landmarks per frame)
- Asymmetry calculation for:
  - Mouth corners (oral commissure deviation)
  - Eye position (lateral canthus asymmetry)
  - Nasolabial fold (nasolabial symmetry index)
- Quality metrics:
  - Frame validity ratio
  - Vision landmark confidence
  - Temporal consistency
- Output: Symmetry score (0-1), confidence level, change from baseline

**Step 4: Heart Rate Estimation (Optional)**
- open-rppg video analysis of facial ROI
- Color channel (G-channel) pulsation tracking
- HR waveform extraction via frequency analysis
- BPM calculation with signal quality assessment
- Output: HR ± confidence interval, quality grade (low/medium/high)

**Step 5: Voice Screening (Live Conversation)**
- Gemini Live session initiated with ephemeral token
- ElevenLabs voice agent reads adaptive questions:
  - "How are you feeling today?"
  - "Are you experiencing dizziness, chest pain, or trouble breathing?"
  - "Did you take your morning medications?"
- Real-time transcription of responses
- Conversational context maintained within session
- Audio uploaded to backend for logging

**Step 6: AI Response Parsing**
- Gemini processes responses to extract:
  - Symptom presence (yes/no/uncertain)
  - Sentiment and confidence indicators
  - Emergency keywords (pain, numbness, etc.)
  - Medication compliance
- Triage recommendations from voice analysis alone

**Step 7: Multimodal Triage Classification**
System combines signals:
- **Visual signals**: Facial asymmetry + baseline deviation
  - Normal: <2σ deviation or first 5 check-ins
  - Warning: 2-2.5σ or medication non-compliance mention
  - Critical: >2.5σ or emergency keywords present
- **Voice signals**: Speech patterns + transcript content
  - Rate of speech, pause duration (proxy for mental status)
  - Explicit symptom statements
  - Medication adherence
- **Historical context**: Personal baseline and trends
  - Is this patient's "normal"?
  - Are metrics improving or deteriorating?

**Output Triage Status:**
- **GREEN**: All metrics normal
  - User message: "Great check-in! All metrics are normal."
  - Clinician message: "Routine check-in, no acute concerns."
  - Action: Log only; include in weekly summary
  
- **YELLOW**: Borderline or single abnormal metric
  - User message: "Slight change detected. Please monitor and report any worsening."
  - Clinician message: "Facial asymmetry elevated 0.2% above baseline. Monitor."
  - Action: Flag for clinician review; optional caregiver notification
  
- **RED**: Multiple abnormal signals or emergency keywords
  - User message: "Alert sent to emergency contact. Help is on the way."
  - Clinician message: "URGENT: Possible acute change. Facial asymmetry +0.8% baseline. Chest pain reported."
  - Action: Twilio SMS/voice call to emergency contact (in production)

**Step 8: Results & Closure**
- Senior sees color-coded result screen
- Simple explanation of status
- "Next check-in: Tomorrow, 8:00 AM"
- Option to restart or exit

---

### 2. Doctor Dashboard

**Senior Management View**
- List of all assigned seniors with current status
- Color-coded status indicators (Green/Yellow/Red)
- Last check-in timestamp and trend
- Quick-filter by status or date range
- Drill-down to individual senior profile

**Individual Senior Profile**
- Personal info: Name, DOB, emergency contact, clinician notes
- Check-in history with full metrics:
  - Date/time, triage result, all visual + voice metrics
  - Facial symmetry scores with visualization
  - HR estimates (if available)
  - Transcript of voice responses
- Baseline metrics (computed over first 5 check-ins)
- Weekly summary with AI narrative

**Analytics & Reporting**
- 7-day trend line: Facial symmetry, HR, triage status
- Metric distribution: Which seniors trending up/down?
- Alert history: Red/Yellow events in past 30 days
- Compliance: Medication adherence from voice analysis

**AI Summary Generation**
- Backend processes senior's check-in data (past 7 days)
- Gemini LLM generates clinician-friendly narrative:
  - "John has maintained normal facial symmetry and HR. Medication compliance confirmed 5/7 days. No acute concerns. Recommend routine follow-up."
- Includes trends, anomalies, recommended actions
- Exportable as PDF or email-ready text

---

### 3. Baseline & Anomaly Detection

**Baseline Learning Phase (First 5 Check-Ins)**
- Each metric captured independently
- No triage classification (all GREEN)
- Metrics stored for statistical analysis
- After 5th check-in:
  - Compute mean and standard deviation for each metric
  - Establish personal normal range
  - Switch to anomaly detection mode

**Ongoing Anomaly Detection**
For each new check-in:
- Calculate z-score: `(current_metric - baseline_mean) / baseline_std`
- Classification logic:
  - `|z| < 2.0` → Normal
  - `2.0 <= |z| < 2.5` → Warning signal (contribute to Yellow)
  - `|z| >= 2.5` → Alert signal (contribute to Red)
- Combine visual + voice signals for final triage

**Example Scenario:**
```
Baseline (John, 5 check-ins):
  Facial Symmetry Index: μ = 0.28, σ = 0.04
  HR: μ = 75 bpm, σ = 5 bpm

Day 20 Check-In:
  Facial Symmetry: 0.34 (z = 1.5, normal)
  HR: 92 bpm (z = 3.4, ALERT)
  Voice: No chest pain, normal speech rate
  → Status: YELLOW (HR elevation warrants caution)

Alert: "Heart rate elevated above usual. Check in with physician if symptoms develop."
```

---

### 4. Alert & Escalation System

**Alert Triggers**

| Trigger | Condition | Escalation | Action |
|---------|-----------|------------|--------|
| RED (Visual) | Facial asymmetry >2.5σ | Immediate | Twilio SMS + phone call to emergency contact |
| RED (Voice) | Explicit emergency keywords (chest pain, can't breathe) | Immediate | Twilio SMS + phone call + senior notified |
| YELLOW | Single metric 2-2.5σ OR medication non-compliance | Deferred | Include in weekly clinician summary |
| GREEN | All normal | None | Log only, include in routine dashboard |

**Alert Content**
- **SMS to Emergency Contact**: "John Doe has a RED alert from health check-in (time). Please check on him. Alert URL: [link]"
- **Voice Call**: Automated message with checking logic
- **In-App**: Senior sees alert status immediately with guidance
- **Doctor Dashboard**: Flag appears immediately with full context

**Audit Trail**
- Record of all alerts: when sent, to whom, delivery status
- Try-again logic if SMS fails
- Logging for compliance/accountability

---

### 5. Weekly Clinician Summary

**What Gets Included**
1. **Metric Trends** (7-day):
   - Facial symmetry min/max/mean with sparkline
   - HR trend (if recorded)
   - Triage status distribution (e.g., 5 Green, 1 Yellow, 1 Red)

2. **Notable Events**:
   - All RED and YELLOW check-ins with context
   - Medication compliance pattern (% days taken)
   - Any emergency contact alerts sent

3. **AI-Generated Narrative** (Gemini):
   - Professional clinical summary
   - Trend interpretation (improving/stable/declining)
   - Recommended actions or follow-up
   - Safety flags for review

**Example Summary:**
```
WEEKLY SUMMARY: John Doe (Feb 15-21, 2026)

Check-Ins: 7/7 completed
Status Distribution: 5 Green | 1 Yellow | 1 Red

TRENDS:
- Facial Symmetry: Stable (0.28 ± 0.03), within baseline
- Heart Rate: Elevated on 2/20 (92 bpm, +2.3σ) -  RESOLVED next day
- Medication Compliance: 6/7 days confirmed

NOTABLE EVENTS:
- 2/20 (RED): HR 92, reported fatigue. Follow-up call made. 
  Resolution: Subsequent check-in normal. No intervention needed.

CLINICAL ASSESSMENT (AI-Generated):
"John maintains normal facial symmetry and demonstrates stable health metrics  
overall. One transient HR elevation on 2/20 did not persist. Medication  
compliance remains high. No acute concerns identified. Recommend routine  
follow-up per care plan."

RECOMMENDED ACTIONS:
- Continue daily check-ins
- Consider physician call if HR elevation recurs
```

---

## Data Models & Database Schema

### MongoDB Collections

#### 1. Users Collection

```json
{
  "_id": "ObjectId(...)",
  "email": "john.doe@example.com",
  "password_hash": "$pbkdf2-sha256$...",
  "name": "John Doe",
  "role": "senior",  // or "doctor"
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+1-555-0101",
  "is_admin": false,
  "created_at": "2026-02-14T10:00:00Z",
  "is_active": true
}
```

**Indexes:**
- `{ email: 1 }` (unique)
- `{ role: 1 }`

#### 2. Checkin History Collection

```json
{
  "_id": "ObjectId(...)",
  "user_id": "ObjectId(...)",  // Links to users collection
  "checkin_id": "5c1c3483-5486-47f5-b96a-693b74c0f954",
  "screening_session_id": "screening_1771116551516",
  
  "started_at": "2026-02-15T00:49:11Z",
  "completed_at": "2026-02-15T00:50:21Z",
  
  "status": "completed",  // or "in_progress", "failed"
  "triage_status": "green",  // or "yellow", "red"
  "triage_reasons": [
    "Facial asymmetry metrics are within normal range",
    "No symptoms reported (no dizziness, chest pain, or trouble breathing)",
    "Medication compliance confirmed"
  ],
  
  "answers": {
    "dizziness": false,
    "chest_pain": false,
    "trouble_breathing": false,
    "medication_taken": true
  },
  
  "metrics": {
    "facial_symmetry": {
      "mouth": {
        "median_percent": 3.52,
        "p90_percent": 4.16,
        "level": "normal"
      },
      "eye": {
        "median_percent": 1.06,
        "p90_percent": 2.63,
        "level": "normal"
      },
      "nasolabial": {
        "median_percent": 5.59,
        "p90_percent": 6.64,
        "level": "normal"
      },
      "combined_index": 0.29,
      "baseline_deviation_sigma": 1.2,
      "quality": {
        "valid_frames": 289,
        "total_frames": 289,
        "quality_ratio": 1.0,
        "duration_seconds": 10.9,
        "index_mean": 0.34,
        "index_std": 1.61
      }
    },
    "vhr": {
      "avg_hr_bpm": 72,
      "hr_quality": "medium",
      "usable_seconds": 10.4,
      "bpm_series": [72],
      "engine": "open-rppg",
      "sqi": 0.65
    }
  },
  
  "screening_responses": [
    {
      "question_index": 0,
      "question": "How are you feeling today?",
      "answer": true,
      "transcript": "how are you feeling today I'm feeling good"
    },
    {
      "question_index": 1,
      "question": "Are you experiencing dizziness, chest pain, or trouble breathing?",
      "answer": false,
      "transcript": "no I am not"
    },
    {
      "question_index": 2,
      "question": "Did you take your morning medications?",
      "answer": true,
      "transcript": "yes I did"
    }
  ],
  
  "transcript": "AI: How are you feeling today? USER: how are you feeling today I'm feeling good...",
  "user_message": "Great check-in! All metrics are normal and you're reporting feeling well.",
  "clinician_notes": "Day 42: All facial symmetry metrics within normal range. Medication compliance confirmed. No acute concerns.",
  
  "alert_level": null,  // or "yellow", "red"
  "alert_sent": false,
  "alert_target": null,
  "alert_message": null,
  "alert_timestamp": null
}
```

**Additional Fields (if VHR enabled):**
- `vhr_status`: processing status for video heart rate
- `vhr_upload_path`: reference to uploaded video file

#### 3. Baselines Collection (Derived)

```json
{
  "_id": "ObjectId(...)",
  "user_id": "ObjectId(...)",
  "baseline_created_at": "2026-02-20T00:00:00Z",
  "baseline_checkin_count": 5,
  
  "metrics": {
    "facial_symmetry_index": {
      "mean": 0.28,
      "std": 0.04,
      "min": 0.24,
      "max": 0.32,
      "samples": 5
    },
    "hr_bpm": {
      "mean": 75,
      "std": 5,
      "min": 68,
      "max": 82,
      "samples": 3  // Some check-ins may not have VHR
    }
  }
}
```

#### 4. Weekly Summaries Collection

```json
{
  "_id": "ObjectId(...)",
  "user_id": "ObjectId(...)",
  "week_start_date": "2026-02-15",
  "week_end_date": "2026-02-21",
  
  "checkin_count": 7,
  "status_distribution": {
    "green": 5,
    "yellow": 1,
    "red": 1
  },
  
  "metrics_summary": {
    "facial_symmetry_mean": 0.28,
    "facial_symmetry_max": 0.35,
    "hr_mean": 74,
    "hr_max": 92
  },
  
  "notable_events": [
    {
      "date": "2026-02-20",
      "type": "red_alert",
      "reason": "Elevated heart rate (92 bpm, +2.3σ)"
    }
  ],
  
  "ai_narrative": "John maintains stable health metrics with one transient HR elevation on 2/20 that did not recur. Medication compliance excellent.",
  "generated_at": "2026-02-21T22:00:00Z",
  "viewed_by_doctor": false,
  "viewed_at": null
}
```

**Indexes:**
- `{ user_id: 1, week_start_date: -1 }`
- `{ viewed_by_doctor: 1, generated_at: -1 }`

#### 5. Alerts Collection

```json
{
  "_id": "ObjectId(...)",
  "user_id": "ObjectId(...)",
  "checkin_id": "5c1c3483-5486-47f5-b96a-693b74c0f954",
  "alert_type": "red",  // or "yellow"
  "reason": "Facial asymmetry elevated above baseline",
  
  "escalation_target": "+1-555-0101",
  "escalation_method": "sms",  // or "voice", "email"
  
  "created_at": "2026-02-15T00:50:21Z",
  "sent_at": "2026-02-15T00:50:35Z",
  "delivery_status": "delivered",  // or "pending", "failed"
  "retry_count": 0,
  
  "content": {
    "sms_body": "John Doe has a RED alert from health check-in (2026-02-15 00:50). Please check on him.",
    "voice_message": "John Doe has a health alert. Please check on him immediately.",
    "email_subject": "URGENT: Health Alert for John Doe"
  },
  
  "clinician_notified": true,
  "clinician_notification_at": "2026-02-15T00:50:40Z"
}
```

---

## API Endpoints

### Authentication Routes (`/auth`)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/auth/register` | Create new user account | None |
| POST | `/auth/login` | Exchange credentials for JWT token | None |
| JSON | `{"email": "...", "password": "..."}` | Request body format | - |
| Response | `{"access_token": "...", "token_type": "bearer"}` | JWT token for subsequent requests | - |
| GET | `/auth/me` | Verify JWT token & get current user | Bearer Token |

### Gemini Integration Routes (`/auth`)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/auth/ephemeral-token` | Generate Gemini ephemeral session token | Bearer Token |
| Response | `{"token": "xyz", "expires_in": 3600}` | For Gemini Live browser session | - |

### Check-In Workflow Routes (`/checkins`)

| Method | Endpoint | Purpose | Auth | Payload |
|--------|----------|---------|------|---------|
| POST | `/checkins/start` | Initialize new check-in session | Bearer | `{"checkin_type": "daily"}` |
| Response | `{"checkin_id": "uuid", "started_at": "iso8601"}` | Session ID for subsequent uploads | - | - |
| POST | `/checkins/{checkin_id}/upload` | Upload video + audio artifacts | Bearer | Form-data: `video`, `audio`, `metadata` |
| Response | `{"vhr": {...}, "status": "uploaded"}` | Facial analysis results | - | - |
| POST | `/checkins/{checkin_id}/complete` | Finalize check-in with screening results | Bearer | STT transcript, answers |
| Response | `{"triage_status": "green", "reasons": [...]}` | Triage classification + explanation | - | - |
| GET | `/checkins/{checkin_id}/validate` | Check completion status (for polling) | Bearer | - |
| Response | `{"is_complete": true, "triage_status": "..."}` | Current status | - | - |

**Upload Payload Example:**
```json
{
  "video": "<binary video file>",
  "audio": "<binary audio file>",
  "metadata": "{ \"duration_ms\": 12000, \"fps\": 30 }"
}
```

**Complete Payload Example:**
```json
{
  "screening_session_id": "screening_1771116551516",
  "screening_responses": [
    {
      "question_index": 0,
      "question": "How are you feeling today?",
      "answer_text": "I'm feeling good",
      "parsed_bool": true
    }
  ],
  "transcript": "AI: How are you feeling today? USER: I'm feeling good"
}
```

### Screening Routes (`/screenings`)

| Method | Endpoint | Purpose | Auth | Payload |
|--------|----------|---------|------|---------|
| POST | `/screenings` | Create Gemini Live screening session | Bearer | `{"checkin_id": "uuid"}` |
| Response | `{"session_id": "...", "start_timestamp": "..."}` | Session ID & timing | - | - |
| GET | `/screenings/{session_id}` | Retrieve screening session details | Bearer | - |
| Response | Full screening object with transcripts | Session data | - | - |

### Senior Profile Routes (`/seniors`)

| Method | Endpoint | Purpose | Auth | Role |
|--------|----------|---------|------|------|
| GET | `/seniors/{senior_id}/checkins` | List check-in history | Bearer | Doctor or Senior |
| Query Params | `?from_date=2026-02-01&to_date=2026-02-28&status=yellow` | Filter options | - | - |
| Response | `[{checkin}, ...]` with pagination | Matching check-ins | - | - |
| GET | `/seniors/{senior_id}/baseline` | Retrieve computed baseline metrics | Bearer | Doctor |
| Response | `{"mean": {...}, "std": {...}, "created_at": "..."}` | Statistical baseline | - | - |
| POST | `/seniors/{senior_id}/weekly-summary` | Generate AI summary for week | Bearer | Doctor |
| Payload | `{"week_start": "2026-02-15", "week_end": "2026-02-21"}` | Date range | - | - |
| Response | `{"narrative": "...", "metrics": {...}}` | AI-generated summary | - | - |
| GET | `/seniors/{senior_id}/weekly-summary` | Retrieve latest summary | Bearer | Doctor |

### Dashboard Routes (`/dashboard`)

| Method | Endpoint | Purpose | Auth | Role |
|--------|----------|---------|------|------|
| GET | `/dashboard/seniors` | List all seniors with current status | Bearer | Doctor |
| Response | `[{name, role, last_checkin, status, ...}, ...]` | Senior overview with current status | - | Doctor |
| Query | `?status=red&sort=by_date` | Filter/sort options | - | - |

### Alert Routes (`/alerts`)

| Method | Endpoint | Purpose | Auth | Role |
|--------|----------|---------|------|------|
| GET | `/seniors/{senior_id}/alerts` | List alerts for a senior | Bearer | Doctor |
| Response | `[{alert_type, reason, created_at, sent_at, ...}, ...]` | Alert history | - | Doctor |
| POST | `/alerts/test` | Trigger test alert to verify escalation | Bearer | Doctor |
| Payload | `{"senior_id": "...", "method": "sms"}` | Alert configuration | - | Doctor |
| Response | `{"alert_id": "...", "status": "sent"}` | Confirmation | - | - |

### Report Generation Routes (`/reports`)

| Method | Endpoint | Purpose | Auth | Role |
|--------|----------|---------|------|------|
| POST | `/reports/senior-summary` | Generate AI summary for senior | Bearer | Doctor |
| Payload | `{"senior_id": "uuid", "include_recommendations": true}` | Summary options | - | Doctor |
| Response | `{"summary": "AI narrative...", "export_formats": ["pdf", "txt"]}` | Generated report | - | - |

### ElevenLabs Integration Routes (`/elevenlabs`)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/elevenlabs/signed-url` | Get signed URL for voice agent | Bearer |
| Query | `?agent_id=optional_agent_override` | Optional agent selection | - |
| Response | `{"signed_url": "https://...", "expires_at": "..."}` | Browser-safe voice AI access | - |
| POST | `/elevenlabs/save-qa` | Store Q&A responses from voice session | Bearer |
| Payload | `{"pairs": [{"question": "...", "answer": "..."}, ...]}` | Q&A history | - |
| Response | `{"saved": true, "count": 3}` | Confirmation | - |

### Health Monitoring Routes (`/health`)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/health` | System health status | None |
| Response | `{"status": "ok", "time": "...", "mongo": "connected", "pymongo": "..."}` | Service health | - |

---

## File Structure & Organization

### Frontend Organization

```
frontend/
├── src/
│   ├── App.jsx                           # Main app routing (LoginScreen → DoctorDashboard or SeniorCheckin)
│   ├── Auth.jsx                          # Auth context provider (if used)
│   ├── main.jsx                          # React DOM entry point
│   ├── index.css / style.css            # Global styles
│   │
│   ├── components/                       # React components
│   │   ├── LoginScreen.jsx              # Email/password login form
│   │   ├── DoctorDashboard.jsx          # Doctor analytics & senior management
│   │   ├── SeniorCheckin.jsx            # Main check-in flow (senior UX)
│   │   │
│   │   ├── login/                       # Login sub-components
│   │   │   ├── AuthCard.jsx             # Card layout wrapper
│   │   │   ├── AuthedPanel.jsx          # Post-login user panel
│   │   │   ├── AuthFields.jsx           # Input fields for credentials
│   │   │   ├── BrandHeader.jsx          # SeniCare logo & title
│   │   │   ├── ModeToggle.jsx           # Login/register mode switcher
│   │   │   ├── PrimarySubmit.jsx        # Styled submit button
│   │   │   └── TrustBadges.jsx          # Security indicators
│   │   │
│   │   └── checkin/                     # Check-in sub-components
│   │       ├── CompletionScreen.jsx     # Results display (Green/Yellow/Red)
│   │       └── [Camera, Voice, etc.]    # Modal/step components
│   │
│   ├── hooks/                            # Custom React hooks
│   │   ├── useAuth.js                   # Authentication state & JWT token management
│   │   ├── useCheckin.js                # Check-in workflow state machine
│   │   └── useDoctorDashboard.js        # Dashboard data fetching & filtering
│   │
│   ├── lib/                              # Shared utilities
│   │   ├── api.js                       # Axios/fetch wrapper for API calls
│   │   ├── auth.js                      # JWT token storage & retrieval
│   │   ├── audio.js                     # Audio recording helpers
│   │   ├── screening.js                 # Voice Q&A logic & constants
│   │   └── [other utilities]            # Date formatting, validation, etc.
│   │
│   └── public/                           # Static assets
│       └── senicarelogo.png             # Brand assets
│
├── index.html                            # HTML entry point (Vite)
├── package.json                          # Dependencies & build scripts
├── vite.config.js                        # Vite configuration (dev server, build)
├── tailwind.config.js                    # Tailwind CSS configuration
├── postcss.config.js                     # PostCSS plugins (autoprefixer)
└── .env.example                          # Example environment variables
```

### Backend Organization

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                           # FastAPI app initialization & startup
│   ├── auth.py                           # JWT token creation, password hashing, user indexes
│   ├── db.py                             # MongoDB connection pooling & helpers
│   ├── dependencies.py                   # FastAPI dependency injection (auth checks, user retrieval)
│   │
│   ├── routes/                           # API endpoint implementations
│   │   ├── __init__.py                   # register_routes() function for all endpoints
│   │   ├── auth.py                       # Register, login, ephemeral token endpoints
│   │   ├── checkins.py                   # Start, upload, complete check-in workflows
│   │   ├── screenings.py                 # Gemini Live session management
│   │   ├── seniors.py                    # Senior profiles, history, baselines
│   │   ├── dashboard.py                  # Doctor dashboard endpoints
│   │   ├── alerts.py                     # Alert creation & escalation
│   │   ├── reports.py                    # AI summary generation
│   │   ├── elevenlabs.py                 # Voice AI integration (signed URLs, save Q&A)
│   │   └── health.py                     # System health status
│   │
│   ├── models/                           # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── auth.py                       # RegisterRequest, LoginRequest, TokenResponse
│   │   ├── checkin.py                    # CheckinStartRequest, CheckinCompleteRequest
│   │   ├── health.py                     # HealthStatus schema
│   │   ├── alert.py                      # AlertRequest, AlertResponse
│   │   ├── screening.py                  # ScreeningCreateRequest, ScreeningSession
│   │   ├── report.py                     # ReportRequest, ReportResponse
│   │   └── [others]                      # Additional schemas per domain
│   │
│   ├── services/                         # Complex business logic
│   │   ├── __init__.py
│   │   ├── facial_symmetry.py            # Facial analysis: MediaPipe, asymmetry computation
│   │   ├── screening.py                  # Voice screening: transcript parsing, triage
│   │   ├── triage.py                     # Multimodal triage logic: combine video + voice signals
│   │   ├── ai_summary.py                 # Gemini LLM: narrative generation for clinicians
│   │   ├── stt_assessment.py             # Speech-to-text analysis: rate, pause detection
│   │   └── [others]                      # Additional analysis services
│   │
│   ├── vhr/                              # Video Heart Rate (open-rppg) module
│   │   ├── __init__.py
│   │   ├── analyzer.py                   # open-rppg wrapper & HR waveform extraction
│   │   ├── service.py                    # VHR pipeline orchestration
│   │   └── __pycache__/                 # Compiled bytecode
│   │
│   └── __pycache__/                     # Compiled bytecode
│
├── logs/                                 # Runtime logs
│   └── stt.json                         # STT processing logs
│
├── models/                               # ML model files
│   └── face_landmarker.task             # MediaPipe face mesh model
│
├── requirements.txt                      # Python dependencies
├── README.md                             # Backend documentation
└── .env.example                          # Example environment file (MONGO_URI, JWT_SECRET, etc.)
```

### Root-Level Documentation

```
senicare/
├── ARCHITECTURE.md                       # High-level system design (features, data flow)
├── MONGODB_SCHEMA_SIMPLE.md              # Database schema definitions & query examples
├── README.md                             # Project overview & quick start guide
├── requirements.txt                      # Root-level Python deps (if any shared)
└── run_facial_symmetry_checkin.py       # CLI diagnostic script for local facial analysis testing
```

### VHR Spike (Reference Implementation)

```
VHR/
├── plan.md                               # Design document for VHR(Video Heart Rate) research
├── README.md                             # VHR instructions & demo walkthrough
│
├── frontend/                             # Next.js + TypeScript front-end
│   ├── app/
│   │   ├── page.tsx                      # Video recording & upload UI
│   │   ├── layout.tsx                    # Layout wrapper
│   │   └── globals.css                   # Global styles
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.mjs
│   └── README.md
│
└── backend/                              # FastAPI backend (minimal)
    ├── main.py                           # RPPG analysis endpoint
    ├── analyzer.py                       # open-rppg integration
    ├── requirements.txt
    └── README.md
```

---

## Key Technical Capabilities & Innovations

### 1. Facial Symmetry Analysis (Custom Module)

**Purpose:** Detect facial drooping or asymmetry that may indicate stroke or neurological changes.

**Technology:**
- MediaPipe Face Mesh: 468 landmark points per frame (high precision)
- OpenCV: Frame preprocessing, coordinate transformation
- NumPy: Statistical aggregation

**Pipeline:**
1. Extract face region from video frames
2. Detect 468 facial landmarks with MediaPipe
3. Identify key landmark pairs (left vs. right):
   - Mouth corners (bilateral symmetry)
   - Eyes (canthi position)
   - Nasolabial folds
4. Compute deviation angle/distance for each pair
5. Aggregate across valid frames with outlier removal
6. Output: Asymmetry score (0-1), confidence band, change from baseline

**Clinical Relevance:**
- Facial droop is a FAST criterion for stroke (Face, Arms, Speech, Time)
- Device-free assessment (no EMG or imaging)
- Repeatable baseline for trend tracking

**Code Location:** [services/facial_symmetry.py](backend/app/services/facial_symmetry.py)

### 2. Remote Photoplethysmography (rPPG) for Heart Rate

**Purpose:** Non-contact heart rate estimation from facial color changes.

**Technology:**
- `open-rppg` library: Tracks subtle skin color pulsations
- OpenCV + ffmpeg: Video preprocessing
- Signal processing: FFT for frequency analysis

**Pipeline:**
1. Extract forehead/cheek ROI from video frames
2. Track green-channel (G) pulsation over time (skin reflects green light in sync with cardiac pulse)
3. Build time-domain waveform
4. Apply FFT to identify dominant frequency → HR (bpm)
5. Calculate signal quality index (SQI)
6. Output: HR ± confidence, quality label, waveform

**Quality Metrics:**
- `hr_quality: "low" | "medium" | "high"` based on SQI
- `usable_seconds`: frames with sufficient quality for analysis
- Confidence interval on HR estimate

**Limitations & Design Notes:**
- Requires stable lighting & minimal motion
- Quality degrades with makeup, beards, extreme angles
- Validation against reference (pulse oximetry) recommended for clinical use

**Code Location:** [vhr/](backend/app/vhr/), [routes/checkins.py](backend/app/routes/checkins.py)

### 3. Gemini Live Screening (Server-Side Ephemeral Tokens)

**Purpose:** Natural, conversational voice-based symptom screening.

**Technology:**
- Google Gemini Live: Real-time multimodal conversation API
- Ephemeral tokens: Short-lived (1-hour) session credentials issued server-to-browser
- Browser Web Speech API: Client-side audio capture

**Architecture Pattern:**
```
Senior (Browser)
  ↓
1. Request ephemeral token (JWT authenticated)
  ↓
Backend (/auth/ephemeral-token)
  ↓
2. Contact Google Gemini API → get one-time token
  ↓
3. Return ephemeral token to browser
  ↓
4. Frontend uses token for direct Gemini Live session (no backend intermediary)
  ↓
Gemini Service
  ↑
5. Frontend uploads transcript/responses to backend
```

**Security & UX Benefits:**
- Backend never sees raw audio (privacy)
- Frontend has bounded session duration (1 hour)
- No repetitive backend proxying → low latency
- Can handle network hiccups with client-side retry

**Integration in App:**
- Questions delivered by ElevenLabs TTS (voice agent reads)
- Responses captured via Gemini Live transcription
- Transcript POSTed to backend for logging & analysis

**Code Locations:**
- [routes/auth.py](backend/app/routes/auth.py) - `create_ephemeral_token()`
- [routes/screenings.py](backend/app/routes/screenings.py) - Session management
- [lib/screening.js](frontend/src/lib/screening.js) - Frontend integration

### 4. Multimodal Triage Classification

**Purpose:** Combine visual biometrics + voice analysis + self-report for holistic health assessment.

**Signals Processed:**

| Signal | Source | Metrics | Triage Contribution |
|--------|--------|---------|---------------------|
| **Visual** | Facial video | Asymmetry score, HR, motion | Main indicator for structural changes |
| **Voice** | Audio transcript & quality | Speech rate, pause duration, keywords | Cognitive/cardiac stress proxy |
| **Self-Report** | Parsed responses | Symptom presence (yes/no), medication compliance | Direct clinical symptoms |
| **Historical** | Personal baseline | Mean/std dev per metric, trend | Contextualizes current finding |

**Triage Algorithm:**

```python
def compute_triage_status(
    facial_z_score: float,      # |z| = |current - baseline| / σ_baseline
    hr_z_score: float,
    voice_keywords: list[str],   # ["chest pain", "can't breathe", etc.]
    medication_compliance: bool,
    speech_rate: float,          # words per minute
    longest_pause_ms: int
) -> TriageStatus:
    
    # Count RED conditions
    red_count = 0
    if abs(facial_z_score) >= 2.5:
        red_count += 1  # Major facial change
    if abs(hr_z_score) >= 2.5:
        red_count += 1  # Major HR change
    if any(kw in voice_keywords for kw in ["chest pain", "can't breathe", "collapse"]):
        red_count += 1  # Emergency keyword
    
    # Count YELLOW conditions
    yellow_count = 0
    if 2.0 <= abs(facial_z_score) < 2.5:
        yellow_count += 1
    if 2.0 <= abs(hr_z_score) < 2.5:
        yellow_count += 1
    if not medication_compliance:
        yellow_count += 1
    if longest_pause_ms > 5000:  # 5+ sec pause (potential confusion)
        yellow_count += 1
    
    # Final classification
    if red_count >= 1:
        return TriageStatus.RED
    elif yellow_count >= 2:
        return TriageStatus.YELLOW
    else:
        return TriageStatus.GREEN
```

**Example Scenarios:**

1. **Scenario: All Green**
   ```
   Facial ΔZ = 0.5 (normal)
   HR ΔZ = 1.2 (normal)
   Voice keywords: []
   Speech rate: 120 wpm (normal)
   Medication: Yes
   → GREEN ("Great check-in! All metrics normal.")
   ```

2. **Scenario: Borderline (Yellow)**
   ```
   Facial ΔZ = 2.3 (+2.3σ, subtle asymmetry)
   HR ΔZ = 1.1 (normal)
   Voice keywords: []
   Medication: No (skipped today)
   → YELLOW ("Slight facial asymmetry detected. Monitor closely. Did you miss meds?")
   ```

3. **Scenario: Critical (Red)**
   ```
   Facial ΔZ = 3.0 (+3σ, major deviation)
   HR ΔZ = 3.5 (+3.5σ, tachycardia)
   Voice keywords: ["chest pain", "shortness of breath"]
   Medication: N/A
   → RED ("ALERT SENT. Immediate evaluation needed. Facial/HR changes + symptoms.")
   ```

**Code Location:** [routes/checkins.py](backend/app/routes/checkins.py) - `_triage_from_ai_signals()`

### 5. Baseline Learning & Statistical Anomaly Detection

**Rationale:**
- "Normal" is highly variable across seniors
- John's baseline HR 70 ≠ Jane's 65
- 5-check-in learning phase establishes personal norms
- Then use z-score for standardized deviation measurement

**Implementation:**

```python
# Learning phase (check-ins 1-5)
baselines = {}
for i, checkin in enumerate(first_5_checkins, 1):
    for metric_name, value in checkin.metrics.items():
        if metric_name not in baselines:
            baselines[metric_name] = []
        baselines[metric_name].append(value)
    if i < 5:
        return TriageStatus.GREEN  # All green during learning

# After 5 check-ins, compute statistics
baseline_stats = {
    metric: {
        "mean": np.mean(values),
        "std": np.std(values),
        "min": np.min(values),
        "max": np.max(values)
    }
    for metric, values in baselines.items()
}

# Store baseline_stats in DB for future comparisons

# Subsequent check-ins: Anomaly detection
def is_anomaly(metric_value: float, metric_name: str, threshold_sigma: float = 2.0):
    baseline = baseline_stats[metric_name]
    z_score = (metric_value - baseline["mean"]) / baseline["std"]
    return abs(z_score) >= threshold_sigma
```

**Benefits:**
- Adapts to individual variability
- Reduces false positives for seniors with naturally high HR
- Detects gradual decline (trend analysis)
- Mathematically rigorous (z-score is well-established in medicine)

**Code Location:** [services/triage.py](backend/app/services/triage.py)

### 6. AI-Generated Clinician Summaries (Gemini)

**Purpose:** Translate raw metrics into human-readable narrative for clinical decision-making.

**Prompt Engineering:**

```python
system_prompt = """You are a clinical summary generator for elderly primary care.
Your task: Convert check-in metrics into a concise, professional summary for the clinician.

Format:
- Opening: Overall status in one sentence
- Trends: Any patterns (improving, stable, declining)
- Notable events: Red/Yellow flags with context
- Recommendation: Next steps (routine follow-up, phone call, urgent visit)

Keep it under 200 words. Use precise language. Include data (e.g., "HR elevated 8% on 2/20").
Never exaggerate. Flag uncertainty (e.g., "HR quality was low due to ambient light").
"""

user_message = f"""
Senior: John Doe (78M)
Week: 2026-02-15 to 2026-02-21

Check-in Summary:
- Total checks: 7/7 completed
- Status distribution: 5 Green, 1 Yellow, 1 Red
- Facial symmetry: Normal 6/7 days, elevated +2.3σ on 2/20
- HR: Range 68-92 bpm, mean 74, elevated only on 2/20
- Medication compliance: 6/7 days reported
- Notable symptoms: None reported

Raw metrics (JSON attached)...
"""

# Call Gemini API with prompt + metrics
response = gemini_client.generateContent(
    [system_prompt, user_message, json.dumps(checkin_data)]
)
summary_narrative = response.text
```

**Output Example:**
```
John Doe maintains stable health metrics overall. Facial symmetry normal 6/7 
days; transient asymmetry on 2/20 (+2.3σ) accompanied by HR elevation (92 bpm) 
but did not recur. Speech patterns and medication compliance stable. No acute 
concerns identified. Continue daily check-ins per care plan.
```

**Security & Privacy:**
- Metrics anonymized before sending to Gemini (no PII in prompt)
- Only aggregated statistics, not raw audio/video
- Summaries stored encrypted in MongoDB
- Doctor-only access via role-based authorization

**Code Location:** [services/ai_summary.py](backend/app/services/ai_summary.py)

---

## Technology Choices & Rationale

### Why FastAPI?

- **Async-native**: Handle multiple simultaneous check-in uploads
- **Automatic OpenAPI docs**: Built-in `/docs` for API exploration
- **Type safety**: Pydantic integration catches schema errors early
- **Performance**: Top-tier ASGI framework benchmarks
- **Python ecosystem**: Integrates cleanly with MediaPipe, open-rppg, Gemini SDK

### Why React + Vite?

- **Senior-friendly UX**: Large buttons, high contrast, mobile-responsive
- **Real-time feedback**: LiveReload during dev, instant testing
- **Component reusability**: Separate login, check-in, dashboard flows
- **Small bundle**: Vite tree-shaking keeps JS download fast

### Why MongoDB?

- **Flexible schema**: Check-ins vary in content (some have VHR, some don't)
- **Nested documents**: Store full metrics hierarchy (facial → mouth/eye/nasal)
- **Horizontal scaling**: Atlas provides auto-sharding for >1M seniors
- **Developer-friendly**: JSON-like documents match app data structures

### Why Gemini Live?

- **Natural conversation**: Seniors can speak naturally, not repeat keywords
- **Streaming responses**: Real-time transcript as they speak
- **Multimodal**: Theoretically can include video context (future enhancement)
- **Cost-effective**: Ephemeral tokens avoid per-request overhead

### Why ElevenLabs?

- **Voice consistency**: Same voice asks all questions (familiarity for seniors)
- **Multi-language support**: Easily expand to non-English populations
- **Natural TTS**: Better than system speech synthesis
- **Agent API**: Conversational agent mode for interactive dialogue (future)

---

## Deployment & Infrastructure Considerations

### Local Development

```bash
# Terminal 1: Backend
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev  # Vite dev server on http://localhost:5173
```

### Production Deployment

**Backend:**
- Cloud platform: AWS EC2, Azure VM, or Heroku/Railway
- Docker containerization recommended
- Uvicorn with Gunicorn for process management
- MongoDB Atlas for managed database (automatic backups, replication)
- JWT_SECRET & other env vars via secure secret manager

**Frontend:**
- Static hosting: Vercel, Netlify, AWS S3 + CloudFront
- Environment variables for API endpoint
- HTTPS enforced
- CSP headers for security

**External Integrations:**
- Gemini API key + quota management
- ElevenLabs API key + voice agent creation
- Twilio account + phone numbers for alerts
- MongoDB Atlas network access + IP whitelist

---

## Security & Compliance Considerations

### Authentication & Authorization

- **JWT tokens**: Short-lived (default 60 min), signed with HS256
- **Password hashing**: PBKDF2-SHA256 via passlib
- **Role-based access**: Senior can only see own data; doctor sees assigned seniors
- **Rate limiting**: Recommended on login/register endpoints (not implemented in MVP)

### Data Privacy

- **Audio/video**: Processed server-side; not stored long-term in raw form
- **Transcripts**: Stored encrypted at-rest in MongoDB
- **Metrics**: Aggregated & anonymized before sending to external LLMs
- **GDPR compliance**: Ability to export/delete user data (scaffold for future)

### Application Security

- **CORS**: Restricted to frontend origins
- **SQL injection**: N/A (MongoDB uses document queries)
- **XSS protection**: React auto-escapes content
- **CSRF**: N/A for API-first architecture

### Compliance Gaps (MVP)

- No HIPAA Business Associate Agreement (BAA) with Gemini/ElevenLabs
- No audit logging for check-in access
- No encryption in-transit for video uploads (should use HTTPS everywhere)
- **Liability disclaimer**: "This is not a medical device" + informed consent required

---

## Testing & Quality Assurance

### Unit Testing

- **Frontend**: React Testing Library for component tests
- **Backend**: pytest for service logic (facial symmetry, triage classification)
- **Example test**:
  ```python
  def test_facial_symmetry_detection():
      frames = load_test_video("test_stroke_facial_droop.mp4")
      result = analyze_facial_symmetry(frames)
      assert result.asymmetry_index > 0.5  # Detects droop
      assert result.confidence > 0.8
  ```

### Integration Testing

- End-to-end check-in flow: Register → Start → Upload → Complete
- Dashboard: Retrieve senior list → Click senior → View check-in history
- Alert escalation: Red triage → Verify Twilio SMS queued

### Manual Testing

- **Facial symmetry**: Recorded videos of normal face, then facial droop simulation
- **VHR**: Validation against pulse oximetry (reference standard)
- **Voice screening**: Multiple accent/speech pattern variations
- **Baseline edge cases**: < 5 check-ins, rapid baseline changes

### Performance Testing

- **Load test**: 100 simultaneous check-in uploads to backend
- **Video processing**: Latency for facial analysis (target: <5 sec for 20-sec clip)
- **DB query**: List all seniors for doctor (target: <1 sec for 1000 seniors)

---

## Future Roadmap & Enhancements

### Phase 2: Production Hardening

1. **HIPAA Compliance**
   - Encrypt all data in-transit (HTTPS, TLS)
   - Database encryption at-rest
   - Audit logging for all data access
   - Business Associate Agreements with vendors
   - Data retention policies & deletion procedures

2. **Advanced Analytics**
   - Multi-week trend analysis (moving averages, regression)
   - Predictive alerts ("HR trending up; watch for infection")
   - Cohort comparison (is John's baseline typical for age/gender?)
   - Export summaries as PDF with charts

3. **Caregiver Portal**
   - Alert notifications pushed to family members
   - View recent check-in status (without raw metrics)
   - Two-way messaging with clinician
   - Schedule check-in reminders for seniors

### Phase 3: Clinical Validation

1. **Prospective studies**
   - Validate facial symmetry detection against neurologist exam
   - Compare VHR estimates to FDA-approved devices
   - Sensitivity/specificity for early detection of common geriatric syndromes

2. **Regulatory pathway**
   - FDA 510(k) submission (if detecting specific medical conditions)
   - Clinical Laboratory Improvement Amendments (CLIA) certification (if processing lab data)
   - State medical board approvals for telemedicine integration

### Phase 4: Scale & International

1. **Multi-language support**
   - Translate UI to Spanish, Mandarin, etc.
   - ElevenLabs multi-language voice agents
   - Gemini Live with language parameter

2. **Adaptive UI**
   - Accessibility: Screen readers, keyboard-only navigation, high-contrast mode
   - Cognitive assessment: Simplified check-in for seniors with mild cognitive impairment
   - Mobile app (React Native or Flutter) for broader access

3. **Integration ecosystem**
   - EHR integration (HL7v2 export to Epic, Cerner)
   - Smart TV app for larger screen (nursing homes)
   - Integration with wearables (smartwatch HR for correlation)

---

## Known Limitations & Caveats

### Facial Symmetry Analysis

- **Not a diagnostic tool**: Asymmetry != stroke. Requires clinical correlation.
- **Baseline drift**: Changes in hairstyle, glasses, or weight affect landmarks
- **Ambient light sensitivity**: Poor lighting reduces landmark confidence
- **Cultural variation**: Not validated across diverse populations

### VHR (Heart Rate)

- **Quality dependent on lighting & motion**: Best in controlled environments
- **Makeup/cosmetics interference**: Can degrade G-channel signal
- **Not suitable for arrhythmias**: Assumes regular rhythm
- **Requires validation**: Compare against pulse oximetry in clinical trial

### Voice Screening

- **Language limitation**: English-only prompts in current version
- **Hearing impairment**: Seniors with hearing loss may struggle with voice agent
- **Transcript accuracy dependent**: On background noise and accent
- **No real-time red flag**: Responses analyzed retrospectively, not mid-conversation

### Overall System

- **MVP status**: Not FDA-approved; for research/demo only
- **Connectivity requirement**: Needs stable internet for video upload
- **Data retention**: Currently stores all metrics indefinitely (should implement TTL)
- **Scalability**: MongoDB on Atlas scales, but Gemini API quotas may limit concurrent sessions

---

## Getting Started for Developers

### Prerequisites

- Python 3.9+
- Node.js 16+ (LTS recommended)
- Chrome/Firefox (for frontend testing)
- Docker (optional, for database)
- Git

### Initial Setup

```bash
# Clone repo
git clone <repo-url> && cd senicare

# Backend setup
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Copy .env template and configure
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET, API keys for Gemini/ElevenLabs

# Start MongoDB locally (if using Docker)
docker-compose up -d mongo

# Start backend
uvicorn app.main:app --reload --port 8000

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev

# Visit http://localhost:5173
```

### Local Testing Checklist

1. **Register** as new user (senior role)
2. **Start check-in**: Press "Start Check-In" button
3. **Upload video**: Use browser camera or upload pre-recorded clip
4. **Complete check-in**: Respond to voice questions (ElevenLabs TTS + Gemini Live)
5. **View result**: Confirm Green/Yellow/Red triage display
6. **Doctor login**: Use doctor credentials to view dashboard
7. **Baseline creation**: Complete 5 check-ins to generate baseline (watch database)

---

## Contact & Support

- **Project**: SeniCare (2026 CtrlHackDel winner)
- **Team**: [Your name/team]
- **Code Repository**: [GitHub URL]
- **Issues/Feedback**: [GitHub Issues or email]

---

## Glossary of Terms

| Term | Definition |
|------|-----------|
| **Triage** | Classification of patient urgency (Green/Yellow/Red) |
| **Asymmetry** | Lack of bilateral symmetry (e.g., droopy left eye) |
| **Baseline** | Personal statistical norm (mean/std dev of metrics) |
| **rPPG** | Remote Photoplethysmography (contactless HR estimation) |
| **SQI** | Signal Quality Index (0-1, confidence in HR estimate) |
| **Ephemeral token** | Short-lived credential issued once per session |
| **Z-score** | Standardized deviation: (value - mean) / std dev |
| **Gemini Live** | Google's real-time conversation API |
| **ElevenLabs** | Voice AI platform for TTS and voice agents |
| **MediaPipe** | Google's ML framework for pose/gesture detection |
| **STT** | Speech-to-Text (transcription) |
| **TTS** | Text-to-Speech (voice synthesis) |
| **MCP** | Model Context Protocol (for AI agent communication) |
| **CORS** | Cross-Origin Resource Sharing (browser security) |
| **JWT** | JSON Web Token (authentication credential) |

---

## Document Metadata

| Property | Value |
|----------|-------|
| **Document Title** | SeniCare - Complete Project Information |
| **Creation Date** | 2026-04-11 |
| **Last Updated** | 2026-04-11 |
| **Audience** | AI Resume Tailoring Tools, Prospective Employers, Team Members |
| **Scope** | Full-stack architecture, features, tech stack, deployment |
| **Confidentiality** | Public (no proprietary algorithms detailed) |

