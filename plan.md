# ResumeForge AI - High-Paying Job Landing & Automation Roadmap (`plan.md`)

> **Session Plan & Architecture Guide**: This document details the planned automation features and architecture to transform ResumeForge AI into an end-to-end **Job Landing & Interview Domination System**, self-hosted on a private home server.

---

## 🎯 Executive Goal

To maximize high-paying interview call rates ($150k–$300k+ / Senior / Lead roles) and interview conversion through:
1. **Outreach & Referral Automation**: Bypassing low-yield job board queues (2–3% response) with direct hiring manager pitches and internal employee referral requests (25–40% response).
2. **Behavioral & Technical Interview Domination**: Pre-generating tailored STAR method stories, anticipated system design questions, and cheat sheets for every applied job.
3. **Application Pipeline CRM**: Tracking all applications, outreach notes, and interview prep in one local dashboard.
4. **Private Home Server Hosting**: Running 100% locally via Docker with zero cloud subscription fees, zero domain required, and total data privacy.

---

## 🏠 Home Server Deployment Setup (No Domain Needed)

ResumeForge AI is pre-configured with `Dockerfile` and `docker-compose.yml` for instant home server hosting.

### Quick Start Commands:
```bash
# 1. Clone or copy project to home server
cd /path/to/resume-forge-ai

# 2. Configure Groq API Key in docker-compose.yml or .env
# GROQ_API_KEY=gsk_...
# GROQ_MODEL=openai/gpt-oss-120b

# 3. Build & Run container detached
docker compose up -d --build

# 4. Access on your local network
http://<HOME_SERVER_LOCAL_IP>:8080
# Example: http://192.168.1.50:8080 or http://homeserver.local:8080
```

- **Local Network Access**: Accessible from any laptop, desktop, tablet, or phone connected to home Wi-Fi.
- **Data Privacy**: All resumes, LinkedIn profiles, application notes, and drafts reside locally in browser storage/container storage.
- **Resource Footprint**: Consumes under 50MB RAM via lightweight Nginx alpine image.

---

## 🚀 Planned Modules for Next Session

```
                                  [ TARGET JOB DESCRIPTION ]
                                              │
                                              ▼
                ┌───────────────────────────────────────────────────────────┐
                │          1-CLICK COMPLETE APPLICATION GENERATOR           │
                └─────────────────────────────┬─────────────────────────────┘
                                              │
         ┌──────────────────┬─────────────────┴─────────────────┬──────────────────┐
         ▼                  ▼                                   ▼                  ▼
┌─────────────────┐ ┌─────────────────┐               ┌─────────────────┐ ┌─────────────────┐
│ 1. ATS Tailored │ │ 2. Outreach &   │               │ 3. Interview    │ │ 4. Application  │
│    Resume       │ │    Referral Kit │               │    STAR Prep    │ │    Tracker CRM  │
│                 │ │                 │               │                 │ │                 │
│ • Grounded in   │ │ • 300-char LI   │               │ • 5 STAR Stories│ │ • Pipeline board│
│   Master Resume │ │   Connect Note  │               │ • 10 Technical  │ │ • Attached kit│
│ • Zero Fake Info│ │ • HM InMail     │               │   Questions     │ │ • Follow-up   │
│ • ATS Match %   │ │ • Referral Note │               │ • Smart Qs to   │ │   calendar      │
│ • PDF / Print   │ │ • Follow-up DMs │               │   Ask Recruiter │ │                 │
└─────────────────┘ └─────────────────┘               └─────────────────┘ └─────────────────┘
```

---

### Module 1: 📨 Recruiter & Referral Outreach Generator (`/outreach-generator`)

Direct reachouts to hiring managers and peer engineers for referrals drastically outperform cold applications.

- **LinkedIn Connection Note (< 300 Characters)**:
  - Generates crisp, high-converting connection messages strictly under LinkedIn's 300-character limit.
  - Automatically highlights candidate's biggest Master Resume metric solving the JD's exact focus.
- **Hiring Manager "Value Pitch" InMail / Email**:
  - Executive 3-paragraph pitch highlighting direct domain fit, quantified achievements, and immediate team value.
- **Peer Referral Request Message**:
  - Casual, respectful message template to contact engineers currently at the target company requesting an internal referral.
- **Post-Interview Thank You & Strategic Follow-Up**:
  - Post-interview note referencing interview discussions to reinforce candidate positioning.
- **1-Click Copy**: Instant clipboard copy with visual feedback for quick LinkedIn / email sending.

---

### Module 2: 🧠 Role-Specific Interview Preparation & STAR Cheat Sheet (`/interview-prep`)

High-paying senior interviews judge candidates on architectural depth, trade-offs, and behavioral execution (STAR method).

- **Tailored STAR Story Matrix**:
  - Automatically structures the candidate's real Master Resume projects into the STAR format:
    1. **Situation**: Problem context and business impact.
    2. **Task**: What the candidate was personally responsible for.
    3. **Action**: Technical architecture, design choices, and execution.
    4. **Result**: Quantified metrics (e.g., 42% latency drop, $50M+ volume, CPU reductions).
  - Covers top behavioral themes:
    - *Leading under pressure / Production outage*
    - *Architectural trade-offs & refactoring*
    - *Disagreements with product or management*
    - *Mentoring and elevating team members*
- **10 Predicted Technical & System Design Questions**:
  - Analyzes the JD's specific technology stack and generates the 10 most likely technical/architectural interview questions with grounded model answers.
- **High-Leverage Questions to Ask the Interviewer**:
  - 5 leadership-level questions to ask the interviewer at the end of rounds, demonstrating strategic business and engineering acumen.
- **Printable / Mobile Interview Cheat Sheet**:
  - 1-click printable / PDF export of the interview cheat sheet to have on your screen during interview calls.

---

### Module 3: 📊 Job Application Pipeline & Tracker (Local Home Server CRM) (`/tracker`)

Never lose track of where you applied, what resume version was sent, or what outreach notes were used.

- **Kanban Board Stages**:
  - `Wishlist / Research` ➔ `Applied & Outreach Sent` ➔ `Recruiter Screening` ➔ `Technical & System Design` ➔ `Offer & Negotiation`
- **Application Dossier Card**:
  - Company Name, Target Role, Location, Salary Range Target.
  - Date applied, date to follow up (with visual follow-up reminder badges).
  - Linked Tailored Resume version.
  - Linked Outreach Messages used.
  - Linked Interview Prep Cheat Sheet.
- **Zero Cloud Leakage**: Stored locally on the home server in browser storage / local JSON backup.

---

### Module 4: 🎯 ATS Pre-Flight Diagnostic & Keyword Gap Heatmap

- Comprehensive pre-flight audit before submitting:
  - **ATS Readability Score** (0–100%).
  - **Hard Skills Match vs. Missing Gap Matrix**.
  - **Action Verb & Quantified Metric Density**.
  - **Formatting & Length Diagnostics**.

---

## 🛠️ Step-by-Step Implementation Roadmap for Next Session

### Step 1: Data Models & Contracts
- Create `src/app/core/models/outreach.model.ts` (`OutreachKit`, `LinkedInConnectNote`, `HiringManagerEmail`, `ReferralRequest`).
- Create `src/app/core/models/interview-prep.model.ts` (`InterviewPrepKit`, `StarStory`, `TechnicalQuestion`, `InterviewerQuestion`).
- Create `src/app/core/models/job-tracker.model.ts` (`JobApplication`, `ApplicationStage`, `ApplicationNote`).

### Step 2: Groq AI Prompt Engineering
- Update `src/app/core/services/prompt.service.ts`:
  - `getOutreachKitSystemPrompt()` & `getOutreachKitUserPrompt()`
  - `getInterviewPrepSystemPrompt()` & `getInterviewPrepUserPrompt()`

### Step 3: Core Services
- Create `src/app/core/services/outreach.service.ts`
- Create `src/app/core/services/interview-prep.service.ts`
- Create `src/app/core/services/job-tracker.service.ts` (with localStorage persistence & import/export)

### Step 4: UI & Views
- Create `/features/outreach-generator` component
- Create `/features/interview-prep` component
- Create `/features/job-tracker` (Kanban board + detail drawer)
- Integrate **1-Click Complete Application Kit** button inside `/create-resume` and `/resume-editor`

### Step 5: Routing & Dashboard Integration
- Add routes in `app-routing.module.ts`
- Add sidebar links in `sidebar.component.ts`
- Add pipeline metrics & quick actions on `dashboard.component.ts`

---

## 📌 Rules & Checklist for Next Session
- [ ] Maintain Angular 14 `NgModule` architecture (do NOT migrate to standalone).
- [ ] Keep TypeScript clean with `"skipLibCheck": true` and `"types": []`.
- [ ] Strict Factual Grounding: AI prompts must never invent credentials, roles, or metrics.
- [ ] Test build locally with `npm run build` or `ng serve`.
- [ ] Keep container setup tested with `docker compose up -d --build`.
