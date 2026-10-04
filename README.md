# 📄 ResumeForge AI

<div align="center">

[![Angular](https://img.shields.io/badge/Angular-14.2-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Groq AI](https://img.shields.io/badge/Groq-LPU%20Inference-F55036?style=for-the-badge&logo=fastapi&logoColor=white)](https://groq.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Author](https://img.shields.io/badge/Author-Himanshu%20Patil-blueviolet?style=for-the-badge&logo=github)](https://github.com/HimanshuPatil2001)

### **Zero-Hallucination Resume Engineering & Career Alignment Platform**

*An intelligent, privacy-first career copilot that bridges your verified experience with target job descriptions — generating ATS-optimized, high-impact resumes and LinkedIn profiles with 100% factual accuracy.*

[Key Features](#-key-features) • [Why I Built This](#-why-i-built-this) • [System Architecture](#-system-architecture) • [Engineering Decisions](#-engineering-decisions--interviewer-notes) • [Quick Start](#-quick-start) • [Docker Deployment](#-docker--home-server-deployment)

---

</div>

## 💡 Why I Built This

Every software engineer knows the pain of modern job hunting: you maintain an exhaustive multi-page history of projects, architectures, technologies, and achievements, yet every job application demands a uniquely tailored, 1-to-2 page ATS-optimized document. 

Most conventional "AI resume builders" suffer from two fatal flaws:
1. **The Hallucination Trap**: Generic LLM wrappers invent companies, fabricate metrics, or add skills you never touched — exposing you to disqualification during technical interviews.
2. **The Privacy Breach**: Your personal data, work history, and contact details get uploaded to opaque third-party cloud databases.

**ResumeForge AI was engineered to solve both problems:**
- **Strict Factual Grounding**: It treats your **Master Resume** as an immutable source of truth. The AI is structurally constrained by system prompts to only rephrase, emphasize, and align verified achievements with the target job description. It compiles career facts into relevant narratives rather than making things up.
- **Privacy by Design**: Fully client-side execution. Your career records and API credentials stay in your browser's `localStorage` or inside your own private self-hosted Docker container. No middleman servers, no tracking, zero telemetry.
- **Blazing Fast Iteration**: Leveraging **Groq's LPU™ inference engine**, full resume tailoring and comprehensive job analyses complete in seconds.

---

## 🌟 Key Features

### 📁 1. Master Resume Database (`/master-resume`)
- **Single Source of Truth**: Organize your lifetime career history — personal information, employment records, complex projects, categorised skill matrices, education, certifications, and awards.
- **In-Browser PDF & Text Parsing**: Upload your existing `.pdf` resume or paste raw text; an integrated in-browser text extractor (`PDF.js`) and Groq AI automatically parse and structure it into the schema.
- **Pre-Save Inspection & FormArray Editing**: Dynamic Angular `FormArray` inputs let you review, edit, reorder, and refine every single record before committing to local storage.
- **Portable Backups**: 1-click JSON schema export and validated import so you always own your data.

### 🎯 2. Intelligent Job Description Tailoring (`/create-resume`)
- **Deep JD Analysis**: Extracts required competencies, preferred frameworks, responsibilities, keywords, and industry domain.
- **Configurable Tailoring Strategies**:
  - **Styles**: ATS Friendly, Executive / Professional, Modern Minimalist.
  - **Page Constraints**: Strict 1-Page budget, 2-Page format, or Auto.
  - **Focus Biases**: Balanced, Deep Technical, Leadership & Experience, or Project-Centric.
- **Live Generation Stepper**: Interactive modal visualizing each stage: *Job Analysis → Experience Matching → Fact-Grounded Generation → Schema Validation*.

### ✏️ 3. Dual-Panel Live Editor & A4 Preview (`/resume-editor`)
- **Side-by-Side Synchronous Editing**: Modify bullet points, reorder sections, and adjust copy on the left while observing live A4 document rendering on the right.
- **Three Interchangeable Templates**:
  - `ATS Minimal`: Maximum parsing readability with standard fonts and single-column formatting.
  - `Professional`: Clean corporate styling with elegant typography and dividers.
  - `Modern`: Visual hierarchy with skill chips and balanced whitespace.
- **Transparent Keyword Match Matrix**: Highlights exact JD keyword overlaps against your Master Resume, distinguishing verified matches from missing prerequisites.
- **Prompt & Debug Inspector**: Peek under the hood to audit the exact system prompt, parameters, and raw JSON payload generated by Groq.
- **Export Ready**: Instant pixel-perfect PDF export via `html2canvas` + `jsPDF`, alongside print-optimized stylesheets (`@media print`).

### 🔗 4. LinkedIn Profile Optimizer (`/linkedin-optimizer`)
- **Profile Ingestion**: Paste profile text, profile URL, or upload your LinkedIn exported profile PDF.
- **Master Resume Cross-Audit**: Compares your public LinkedIn presence against your verified Master Resume to detect missing high-value accomplishments and metric-backed impact.
- **High-Impact Headlines**: Generates three 220-character conversion-tested variants:
  - *Recruiter & Keyword Search-Optimized*
  - *Value Proposition & Measurable Impact*
  - *Technical Authority & Architecture*
- **Story-Driven "About" Narratives**: First-person narratives crafted with engaging hooks, core technical wins, and clear calls-to-action.
- **Strategic Skill Curation**: Recommends top 5 pinned skills and flags critical keywords absent from your profile.
- **1-Click Markdown Export**: Copy individual sections or download the complete optimization guide.

### 📑 5. Drafts Library & Local Workspace (`/drafts`)
- Manage distinct resume drafts for different career trajectories (e.g., *Frontend Lead*, *Full Stack Engineer*, *DevOps Specialist*).
- Search, filter, duplicate, rename, or delete past generations seamlessly.

---

## 🏗️ System Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │               ResumeForge AI (Browser / UI)            │
                    └────────────────────────────────────────────────────────┘
                                 │                               │
                 [User Career History / PDF]           [Target Job Description]
                                 │                               │
                                 ▼                               ▼
                    ┌─────────────────────────┐     ┌────────────────────────┐
                    │  Master Resume Service  │     │   Job Analysis Engine  │
                    │   (Reactive FormArray)  │     │   (Keyword Extraction) │
                    └─────────────────────────┘     └────────────────────────┘
                                 │                               │
                                 └───────────────┬───────────────┘
                                                 │
                                                 ▼
                    ┌────────────────────────────────────────────────────────┐
                    │               Prompt Construction Service              │
                    │   - Injects Strict Zero-Hallucination Constraints      │
                    │   - Applies Style, Page Budget & Focus Rules           │
                    │   - Enforces JSON Schema Output Contract               │
                    └────────────────────────────────────────────────────────┘
                                                 │
                                                 ▼
                    ┌────────────────────────────────────────────────────────┐
                    │               Groq Cloud LPU™ API Engine               │
                    │      (openai/gpt-oss-120b | llama-3.3-70b-versatile)   │
                    └────────────────────────────────────────────────────────┘
                                                 │
                                                 ▼
                    ┌────────────────────────────────────────────────────────┐
                    │            Dual-Panel Editor & Template Engine         │
                    │   ┌────────────────────┐      ┌────────────────────┐   │
                    │   │ Live Reactive Form │ <──> │ Dynamic A4 Preview │   │
                    │   └────────────────────┘      └────────────────────┘   │
                    │      [ATS Minimal]       [Professional]     [Modern]   │
                    └────────────────────────────────────────────────────────┘
                                 │                               │
                                 ▼                               ▼
                    ┌─────────────────────────┐     ┌────────────────────────┐
                    │     PDF / Print Engine  │     │   Draft Storage Engine │
                    │   (jsPDF + html2canvas) │     │     (localStorage)     │
                    └─────────────────────────┘     └────────────────────────┘
```

---

## 🧠 Engineering Decisions & Interviewer Notes

| Decision | Rationale |
| :--- | :--- |
| **Angular 14 `NgModule` & Reactive Forms** | Chosen for enterprise-grade predictability. Resumes have deeply nested hierarchical schemas (experiences have bullet points, tech stacks, and metrics). Angular's `FormArray` enables granular validation, dynamic reordering, and dirty-state tracking without unnecessary re-renders. |
| **Frontend-Only Architecture** | Eliminates privacy concerns. Personal career history, phone numbers, and compensation metrics are never transmitted to or stored on an intermediate application server. |
| **Direct Groq LPU™ Integration** | Resume drafting requires interactive speed. Groq's LPUs deliver exceptional throughput (>250 tokens/sec), allowing real-time multi-stage analysis and generation without jarring user wait times. |
| **Runtime Docker Environment Injection** | Built with `envsubst` and an Nginx reverse proxy wrapper (`assets/env.template.js`). This allows deploying the same container image anywhere (home servers, NAS, private clouds) with injected environment variables without rebuilding the Angular app. |
| **Defensive Prompt Engineering** | LLMs are inherently eager to please and prone to embellishment. System prompts use negative constraints, structured schema enforcement, and key-anchoring to ensure that the output is strictly derived from the provided master document. |

---

## 💻 Tech Stack

- **Core Framework**: Angular 14.2.13 (TypeScript 4.7, RxJS 7.5)
- **Styling**: SCSS, CSS Custom Properties, Modular Design Tokens (Dark / Light SaaS themes)
- **AI Backend**: Groq OpenAI-compatible Chat Completions API (`openai/gpt-oss-120b`, `llama-3.3-70b-versatile`)
- **Document Processing**: `PDF.js` (client-side text parsing), `html2canvas` & `jsPDF` (vectorized PDF compilation)
- **Containerization**: Docker, Docker Compose, Alpine NGINX with dynamic `envsubst`

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: `v18.x`, `v20.x`, or `v24.x`
- **npm**: `v8.x`+
- **Angular CLI**: `npm install -g @angular/cli@14.2.13`
- A free **Groq API Key** from [console.groq.com](https://console.groq.com/keys)

### 1. Clone & Install
```bash
git clone https://github.com/HimanshuPatil2001/Resume-Forge.git
cd Resume-Forge

npm install
```

### 2. Run the Development Server
```bash
ng serve
```
Navigate to `http://localhost:4200/` in your browser.

### 3. Configure Your API Key
1. Open the app and navigate to **Settings** in the sidebar.
2. Enter your Groq API key (`gsk_...`).
3. Click **Test API Connection** to verify connectivity.
4. Click **Save Settings** (securely saved in your browser's `localStorage`).

---

## 🐳 Docker & Home Server Deployment

ResumeForge AI is pre-configured for self-hosted home servers (Unraid, TrueNAS, Portainer, or Raspberry Pi).

### Using Docker Compose
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Configure your environment variables in `.env`:
```env
GROQ_API_KEY=gsk_your_actual_key_here
GROQ_MODEL=openai/gpt-oss-120b
GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_TEMPERATURE=0.2
```

Launch the container:
```bash
docker compose up -d
```
Access the application on port `8080`: `http://localhost:8080/`

---

## 📂 Project Directory Map

```
src/
├── app/
│   ├── core/
│   │   ├── data/             # Master resume & job description reference fixtures
│   │   ├── models/           # TypeScript interfaces (MasterResume, GeneratedResume, Settings, etc.)
│   │   └── services/         # GroqService, MasterResumeService, ResumeGeneratorService,
│   │                         # PdfService, PdfTextExtractorService, StorageService, SettingsService
│   ├── features/
│   │   ├── dashboard/        # Welcome overview, quick stats & recent drafts
│   │   ├── master-resume/    # Master resume editor, PDF text auto-extraction & JSON sync
│   │   ├── create-resume/    # Job description parser, tailoring options & generation wizard
│   │   ├── resume-editor/    # Split-screen workspace, template selector & keyword alignment
│   │   ├── linkedin-optimizer/# Profile importer, gap analyzer & headline/narrative generator
│   │   ├── drafts/           # Drafts repository, filter, duplication & search
│   │   └── settings/         # API credentials, theme preferences & connection diagnostics
│   ├── layout/
│   │   ├── sidebar/          # Responsive navigation menu
│   │   └── topbar/           # Context header, breadcrumbs & theme toggler
│   └── shared/
│       └── components/       # Reusable UI widgets: Toast, Modals, Spinners, Templates
├── assets/
│   ├── env.template.js       # Runtime environment substitution template for Docker
│   └── master-resumes/       # Seed sample master career profiles
└── styles.scss               # Global SaaS theme variables, typography & print stylesheets
```

---

## 👤 Author & Connect

**Himanshu Patil**
- **GitHub**: [@HimanshuPatil2001](https://github.com/HimanshuPatil2001)
- **Docker Hub**: [himanshupatil591](https://hub.docker.com/u/himanshupatil591)

If you find this project useful or interesting, feel free to give it a ⭐️ on GitHub!

---

## 📄 License
This project is licensed under the [MIT License](LICENSE) — free for personal and educational use.
