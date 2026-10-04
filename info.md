# ResumeForge AI - Project Architecture & Context Guide (`info.md`)

> **Note for AI Assistant**: Read this file at the start of any new session to quickly gain full context on the application architecture, file locations, data models, workflows, and implemented features without scanning the whole repository.

---

## 📌 Project Summary

- **Project Name**: ResumeForge AI
- **Location**: `d:\Himanshu\Resume updater`
- **Framework**: Frontend-only **Angular 14.2.x** with `NgModule` architecture.
- **Node Version**: v24.13.0 (Windows OS)
- **Primary AI Provider**: Groq OpenAI-compatible Chat Completions API (`https://api.groq.com/openai/v1`).
- **Core Purpose**: Maintain a single source of truth **Master Resume**, paste target **Job Descriptions**, generate factually grounded job-specific resumes via Groq AI (with zero hallucinations), switch presentation templates, edit generated content, and export as PDF/Print.

---

## 🛠️ Environment & Setup Rules

- **Framework Rules**:
  - Keep on Angular 14. Do NOT upgrade to Angular 15+.
  - Do NOT migrate to standalone Angular architecture. Use `NgModule` (`app.module.ts`, `app-routing.module.ts`).
  - `"skipLibCheck": true` and `"types": []` are configured in `tsconfig.json` & `tsconfig.app.json` to avoid TypeScript conflicts with ambient `@types/node` on Node 24.
- **Run Commands**:
  - Install dependencies: `npm install`
  - Start development server: `ng serve` (runs on `http://localhost:4200/`)

---

## 🚀 Completed Features & Workflows

### 1. 📁 Master Resume Database (`/master-resume`)
- **Strong Typing**: `MasterResume`, `PersonalInfo`, `Experience`, `Project`, `SkillsCategory`, `Education`, `Certification`, `Achievement`.
- **FormArray Reactive Forms UI**: Allows adding, editing, reordering, and deleting entries for experience, projects, education, certifications, and skills.
- **✨ PDF Upload & Raw Text AI Auto-Fill**:
  - Upload `.pdf` resume file: Extracted in browser via `PdfTextExtractorService` (`PDF.js`) and parsed by Groq AI.
  - Paste raw text: Parsed by Groq AI into structured `MasterResume` JSON format.
  - **Pre-Save Review & Edit**: Extracted data populates the form fields first, displaying a green review banner so the user can edit before clicking **Save Master Resume**.
- **JSON Import / Export / Reset**: Export JSON file, schema-validated JSON import, and reset to sample data.

### 2. ✨ Create Tailored Resume (`/create-resume`)
- **JD Input**: Textarea with placeholder and **"Load Sample Job Description"** demo button.
- **Job Description Analysis**: Extracts required/preferred skills, technology stack, keywords, responsibilities, and industry domain using Groq AI.
- **Tailoring Options**: Target Job Title, Company Name, Resume Style (ATS Friendly, Professional, Modern, Minimal), Target Length (1 Page, 2 Pages, Auto), Focus Area (Balanced, Technical, Experience, Projects).
- **Strict Factual Grounding**: System prompt strictly forbids AI from inventing companies, experience, technologies, or dates.
- **Loading Overlay**: Interactive step-by-step loading modal (`loading-spinner`) showing progress (Job Analysis → Experience Match → AI Generation → Validation) with error recovery drawer.

### 3. ✏️ Dual-Panel Resume Editor & Preview (`/resume-editor`)
- **Side-by-Side Workspace**: Live editable form panel on the left and A4 document preview on the right.
- **3 Presentation Templates**:
  1. `ats-minimal`: Max ATS readability single-column template.
  2. `professional`: Executive corporate layout with subtle accent lines.
  3. `modern`: Contemporary layout with skill badges and clean typography.
- **Transparent Keyword Match Tab**: Compares JD keywords directly against Master Resume text (Matched vs Missing).
- **Prompt & Debug Drawer**: Inspect active AI system prompt, settings, and raw JSON response.
- **PDF & Print Export**: PDF export (`html2canvas` + `jsPDF`) and native browser printing (`window.print()`).

### 4. 📑 Saved Drafts Library (`/drafts`)
- Saved local resume library stored in `localStorage`. Search/filter by title/company, open/edit, duplicate, rename, or delete with confirmation dialog.

### 5. 🔗 LinkedIn Profile Optimizer (`/linkedin-optimizer`)
- **LinkedIn Profile Import & Extraction**:
  - Paste raw profile text or profile URL (with smart detection & login-wall export guidance).
  - Upload LinkedIn exported profile PDF (auto-extracted in-browser via `PdfTextExtractorService`).
  - Preloaded demo sample: "Load Sample Profile" for instant 1-click testing.
  - Groq AI extracts structured profile: Name, current headline, location, About summary, experience roles, and listed skills.
- **Master Resume Grounded Optimization**:
  - Audits LinkedIn profile against the verified Master Resume (single source of truth).
  - **High-Impact Headlines (220 max chars)**: Generates 3 conversion-tested headline variants (Recruiter & Keyword Search-Optimized, Value Proposition & Impact, Technical Authority) with live character counters and 1-click copy.
  - **Story-Driven "About" Section**: Generates first-person career narratives (Comprehensive Story and Punchy Executive) with hooks, key wins from Master Resume, and call-to-actions.
  - **Experience Gaps & Upgrades**: Detects verified accomplishments and metrics present in Master Resume but missing on LinkedIn, generating punchy mobile-friendly bullet points.
  - **Skills Strategy**: Recommends Top 5 Pinned Skills and highlights missing high-value skills from the Master Resume.
  - **1-Click Copy & Export**: Copy any section with one click, or export the full guide as Markdown (`.md`).
  - **Sync to Master Resume**: Option to import/merge any missing LinkedIn profile info into the Master Resume.

### 6. ⚙️ Application Settings (`/settings`) & Docker Environment Integration
- Masked Groq API key configuration (`gsk_...`).
- Default Recommended AI Model: `openai/gpt-oss-120b` (also supports `llama-3.3-70b-versatile`, `openai/gpt-oss-20b`, `llama3-70b-8192`, `llama3-8b-8192`, `mixtral-8x7b-32768`).
- Temperature slider (default 0.2), API Base URL, "Test API Connection" button, Dark/Light theme switcher.
- **Docker Environment Support**: Supports runtime container injection for `GROQ_API_KEY`, `GROQ_MODEL`, `GROQ_BASE_URL`, and `GROQ_TEMPERATURE` via `assets/env.js` and `envsubst` for self-hosted home servers.

---

## 📂 Codebase File Structure Map

```
d:/Himanshu/Resume updater/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── data/
│   │   │   │   ├── sample-master-resume.ts
│   │   │   │   └── sample-job-description.ts
│   │   │   ├── models/
│   │   │   │   ├── master-resume.model.ts
│   │   │   │   ├── generated-resume.model.ts
│   │   │   │   ├── job-analysis.model.ts
│   │   │   │   ├── settings.model.ts
│   │   │   │   └── draft.model.ts
│   │   │   └── services/
│   │   │       ├── storage.service.ts              # LocalStorage wrapper
│   │   │       ├── master-resume.service.ts        # Master Resume CRUD, JSON & AI text parse
│   │   │       ├── pdf-text-extractor.service.ts   # PDF.js text extraction from PDF files
│   │   │       ├── settings.service.ts             # Groq config & Theme toggle
│   │   │       ├── prompt.service.ts               # AI system & user prompts
│   │   │       ├── groq.service.ts                 # Groq API HttpClient calls
│   │   │       ├── resume-generator.service.ts     # AI JSON parser, JD analysis, generation
│   │   │       ├── draft.service.ts                # Saved resume drafts manager
│   │   │       ├── pdf.service.ts                  # PDF export & Print engine
│   │   │       └── toast.service.ts                # Toast notifications
│   │   ├── shared/
│   │   │   └── components/
│   │   │       ├── toast/                          # Toast UI component
│   │   │       ├── confirmation-dialog/           # Modal for reset/delete actions
│   │   │       ├── loading-spinner/               # Step-by-step progress overlay
│   │   │       ├── keyword-match/                 # ATS keyword alignment card
│   │   │       ├── job-analysis-card/             # JD requirements display card
│   │   │       └── templates/
│   │   │           ├── ats-minimal/                # Template 1
│   │   │           ├── professional/               # Template 2
│   │   │           ├── modern/                     # Template 3
│   │   │           └── resume-preview-container/   # Active template switcher wrapper
│   │   ├── layout/
│   │   │   ├── sidebar/                            # Collapsible navigation menu
│   │   │   └── topbar/                             # Top header & theme switcher
│   │   ├── features/
│   │   │   ├── dashboard/                          # Dashboard metrics view
│   │   │   ├── master-resume/                      # FormArray Master Resume view & AI auto-fill
│   │   │   ├── create-resume/                      # JD paste & generation options view
│   │   │   ├── resume-editor/                      # Side-by-side editor & A4 preview view
│   │   │   ├── drafts/                             # Drafts library view
│   │   │   └── settings/                           # API key & preferences view
│   │   ├── app-routing.module.ts
│   │   ├── app.module.ts
│   │   └── app.component.ts
│   ├── environments/
│   │   ├── ai-config.json
│   │   └── environment.ts
│   └── styles.scss                                 # Dark/Light CSS variables & @media print
├── tsconfig.json                                   # skipLibCheck: true, types: []
├── tsconfig.app.json
├── package.json
└── README.md
```

---

## 🔑 Key Service Methods Reference

| Service | Key Methods | Purpose |
| :--- | :--- | :--- |
| `MasterResumeService` | `getCurrentMasterResume()`, `saveMasterResume()`, `importMasterResumeJson()`, `exportMasterResumeJson()`, `parseRawTextToMasterResume()` | Manages master resume data & AI text/JSON parsing |
| `PdfTextExtractorService` | `extractTextFromPdf(file: File)` | Uses PDF.js in browser to extract text from `.pdf` files |
| `GroqService` | `testConnection()`, `createChatCompletion()` | HttpClient calls to Groq API endpoint |
| `ResumeGeneratorService` | `analyzeJobDescription()`, `generateTailoredResume()`, `calculateKeywordMatch()` | Handles JD extraction, resume generation, safe JSON parsing |
| `DraftService` | `saveDraft()`, `getDrafts()`, `duplicateDraft()`, `deleteDraft()` | Local storage draft management |
| `PdfService` | `downloadPdf()`, `printResume()` | Generates downloadable PDF via `html2canvas`+`jsPDF` and native `window.print()` |
| `LinkedInOptimizerService` | `parseLinkedInProfile()`, `optimizeLinkedIn()`, `mergeLinkedInIntoMasterResume()` | Extracts LinkedIn data and generates Master Resume grounded profile optimizations |
| `SettingsService` | `getSettings()`, `saveSettings()`, `toggleTheme()` | Stores Groq key, selected model, theme in `localStorage` |

---

## 🎯 Resume Session Resume Guide

When starting a new session:
1. Refer to `info.md` for current codebase state.
2. Run `ng serve` to test any new changes live.
3. Keep all changes frontend-only (Angular 14 NgModule pattern).
