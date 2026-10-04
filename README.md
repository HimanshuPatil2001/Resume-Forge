# ResumeForge AI - AI Resume Builder & Tailoring Application

**ResumeForge AI** is a production-ready, frontend-only Angular 14 application designed for building and tailoring job-specific resumes grounded strictly in your personal Master Resume using the **Groq AI API**.

---

## 🌟 Key Features

1. **Master Resume Database**
   - Single source of truth containing your complete career history, projects, skills breakdown, education, certifications, and achievements.
   - Form-based management with Angular Reactive Forms & `FormArray`.
   - Local storage persistence (`localStorage`).
   - Full JSON Export & Schema-validated Import with confirmation dialogs.

2. **Job Description Analysis**
   - Extracts job title, company name, required/preferred skills, technology stack, keywords, responsibilities, and industry domain.
   - Clean, structured Job Analysis Card display.

3. **Groq AI Integration & Strict Zero-Hallucination Grounding**
   - OpenAI-compatible Groq Chat Completions API (`llama-3.3-70b-versatile`).
   - Centralized `GroqService` using Angular `HttpClient`.
   - **No Hallucination Enforcement**: Strict system prompts guarantee that the AI will NEVER fabricate job titles, companies, employment dates, technologies, metrics, or certifications.
   - Traceability & source mapping for generated content.

4. **3 Printable / Exportable Resume Templates**
   - **ATS Minimal**: Single-column layout optimized for maximum ATS parsing accuracy.
   - **Professional**: Classic executive layout with clean section dividers.
   - **Modern**: Contemporary design with skill badges and clean typography.
   - Instant template switching without regenerating AI content.

5. **Dual-Panel Resume Editor & Live A4 Preview**
   - Edit generated resume text, bullet points, and skills in real-time.
   - Side-by-side live A4 document preview.
   - Prompt & Debug Inspector drawer to review AI system prompts and raw JSON.

6. **Transparent Keyword Alignment Analysis**
   - Frontend comparison of JD keywords against Master Resume content.
   - Highlights Matched Keywords vs Missing Keywords (absent from Master Resume).

7. **PDF Export & Browser Print**
   - Crisp PDF export using `html2canvas` + `jsPDF`.
   - Clean `@media print` stylesheet for native browser print (`window.print()`).

8. **Drafts Library & App Settings**
   - Save, reopen, rename, duplicate, and delete resume drafts.
   - Masked Groq API Key storage in `localStorage`.
   - API connection test tool.
   - Dark/Light theme toggle.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v14+ / v18+ / v20+ / v24+
- **Angular CLI**: 14.2.13

### 2. Installation
```bash
# Navigate to project directory
cd "d:\Himanshu\Resume updater"

# Install dependencies
npm install
```

### 3. Run Development Server
```bash
# Launch Angular application
ng serve
```
Open your browser and navigate to `http://localhost:4200/`.

---

## ⚙️ Groq API Key Setup

1. Obtain a free Groq API key from [https://console.groq.com/keys](https://console.groq.com/keys).
2. In **ResumeForge AI**, click **Settings** in the sidebar.
3. Paste your API key (`gsk_...`) into the **Groq API Key** field.
4. Click **Test API Connection** to verify your setup.
5. Click **Save Settings**.

> 🔒 **Security Notice**: This application is strictly **frontend-only**. Your Groq API key is stored locally in your browser's `localStorage` and sent directly to Groq's official API endpoint. Do not host this frontend on a public web server with your personal API key.

---

## 📁 Project Architecture

```
src/
├── app/
│   ├── core/
│   │   ├── data/             # Sample Master Resume & Job Description
│   │   ├── models/           # TypeScript interfaces (MasterResume, GeneratedResume, JobAnalysis, etc.)
│   │   └── services/         # MasterResume, Groq, ResumeGenerator, Draft, PDF, Storage, Prompt, Toast
│   ├── features/
│   │   ├── dashboard/        # Dashboard stats & recent drafts
│   │   ├── master-resume/    # FormArray Master Resume Editor & Import/Export
│   │   ├── create-resume/    # JD Paste, Options & AI Generation Trigger
│   │   ├── resume-editor/    # Side-by-side editor & live A4 preview workspace
│   │   ├── drafts/           # Saved drafts library & search
│   │   └── settings/         # API config, theme & default options
│   ├── layout/
│   │   ├── sidebar/          # Navigation menu
│   │   └── topbar/           # Header bar & theme toggle
│   ├── shared/
│   │   └── components/       # Toast, Confirmation Dialog, Loading Progress, Keyword Match, Templates
│   ├── app-routing.module.ts
│   ├── app.module.ts
│   └── app.component.ts
├── environments/
│   ├── ai-config.json        # AI default configuration
│   └── environment.ts
└── styles.scss               # SaaS dark/light variables & print CSS
```

---

## 📜 License
Personal Use Project.
