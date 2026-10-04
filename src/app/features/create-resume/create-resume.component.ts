import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MasterResumeService } from '../../core/services/master-resume.service';
import { ResumeGeneratorService, GenerationProgress } from '../../core/services/resume-generator.service';
import { SettingsService } from '../../core/services/settings.service';
import { ToastService } from '../../core/services/toast.service';
import { SAMPLE_JOB_DESCRIPTION } from '../../core/data/sample-job-description';
import { JobAnalysis } from '../../core/models/job-analysis.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-create-resume',
  template: `
    <div class="page-container">
      
      <div class="page-header">
        <div>
          <h1 class="page-title">Create Job-Specific Tailored Resume</h1>
          <p class="page-subtitle">Paste a target Job Description to generate a factually grounded resume matching company requirements.</p>
        </div>
        <button class="btn btn-outline" (click)="loadSampleJd()">
          📄 Load Sample Job Description
        </button>
      </div>

      <div class="create-grid">
        
        <!-- LEFT: JOB DESCRIPTION FORM -->
        <div class="left-panel">
          
          <div class="card-box">
            <div class="box-header">
              <h3>Target Job Description</h3>
              <span class="required-tag">* Required</span>
            </div>

            <textarea 
              [(ngModel)]="jobDescription" 
              rows="14" 
              placeholder="Paste the complete job description here (responsibilities, required skills, preferred qualifications, tech stack)..."
              class="jd-textarea"
            ></textarea>

            <div class="btn-group-row">
              <button 
                class="btn btn-secondary" 
                [disabled]="!jobDescription.trim() || (progress$ | async)?.status !== 'idle'"
                (click)="onAnalyzeJd()"
              >
                🔍 Analyze Job Description
              </button>
            </div>
          </div>

          <!-- JOB ANALYSIS RESULT CARD -->
          <app-job-analysis-card [analysis]="jobAnalysis$ | async"></app-job-analysis-card>

        </div>

        <!-- RIGHT: TAILORING OPTIONS & GENERATE BUTTON -->
        <div class="right-panel">
          
          <div class="card-box sticky-box">
            <h3 class="box-title">Tailoring Preferences</h3>
            <p class="box-desc">Customize how Groq AI selects and emphasizes your experience.</p>

            <div class="form-group">
              <label>Target Job Title (Optional)</label>
              <input type="text" [(ngModel)]="jobTitle" placeholder="e.g. Senior .NET & Angular Developer" />
            </div>

            <div class="form-group">
              <label>Target Company Name (Optional)</label>
              <input type="text" [(ngModel)]="companyName" placeholder="e.g. Enterprise Digital Tech Solutions" />
            </div>

            <div class="form-group">
              <label>Resume Presentation Style</label>
              <select [(ngModel)]="resumeStyle">
                <option value="ATS Friendly">ATS Friendly (Max Readability)</option>
                <option value="Professional">Professional (Corporate Executive)</option>
                <option value="Modern">Modern (Contemporary Tech)</option>
                <option value="Minimal">Minimal (Clean & Compact)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Target Resume Length</label>
              <select [(ngModel)]="targetLength">
                <option value="1 Page">1 Page (Concise Summary)</option>
                <option value="2 Pages">2 Pages (Detailed History)</option>
                <option value="Auto">Auto (Best Fit)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Emphasis & Focus Area</label>
              <select [(ngModel)]="focusArea">
                <option value="Balanced">Balanced (Experience + Skills + Projects)</option>
                <option value="Technical">Technical (Emphasize Stack & Skills)</option>
                <option value="Experience">Experience (Highlight Leadership & Career)</option>
                <option value="Projects">Projects (Emphasize Portfolio Deliverables)</option>
              </select>
            </div>

            <div class="generation-footer">
              <button 
                class="btn btn-primary btn-block btn-lg" 
                [disabled]="!jobDescription.trim() || isGenerating"
                (click)="onGenerateResume()"
              >
                ✨ Generate Tailored Resume
              </button>
              
              <div class="fact-guarantee">
                🔒 <strong>Strict Factual Grounding:</strong> AI will never invent experience, technologies, or dates.
              </div>
            </div>

          </div>

        </div>

      </div>

      <!-- LOADING PROGRESS OVERLAY -->
      <app-loading-spinner [progress]="progress$ | async"></app-loading-spinner>

    </div>
  `,
  styles: [`
    .page-container {
      padding: 28px;
      max-width: 1240px;
      margin: 0 auto;
      box-sizing: border-box;
      width: 100%;
    }
    @media (max-width: 768px) {
      .page-container {
        padding: 16px 12px;
      }
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }
    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }
      .page-header .btn {
        width: 100%;
        justify-content: center;
        text-align: center;
        box-sizing: border-box;
      }
    }
    .page-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 4px 0;
      color: var(--text-main, #f8fafc);
    }
    .page-subtitle {
      font-size: 14px;
      color: var(--text-muted, #94a3b8);
      margin: 0;
    }
    .create-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 24px;
    }
    @media (max-width: 960px) {
      .create-grid { grid-template-columns: 1fr; }
    }
    .card-box {
      background: var(--bg-card, #1e293b);
      border: 1px solid var(--border-color, rgba(255,255,255,0.08));
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      color: var(--text-main, #f8fafc);
    }
    @media (max-width: 768px) {
      .card-box {
        padding: 16px 14px;
        border-radius: 12px;
      }
    }
    .sticky-box {
      position: sticky;
      top: 88px;
    }
    @media (max-width: 960px) {
      .sticky-box {
        position: static;
        top: auto;
      }
    }
    .box-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }
    .box-header h3, .box-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }
    .box-desc {
      font-size: 13px;
      color: var(--text-muted, #94a3b8);
      margin: 4px 0 20px 0;
    }
    .required-tag {
      font-size: 11px;
      color: #f87171;
      font-weight: 600;
    }
    .jd-textarea {
      width: 100%;
      background: var(--bg-main, #0f172a);
      border: 1px solid var(--border-color, rgba(255,255,255,0.12));
      border-radius: 10px;
      padding: 16px;
      color: var(--text-main, #f8fafc);
      font-family: inherit;
      font-size: 14px;
      line-height: 1.5;
      resize: vertical;
      box-sizing: border-box;
      margin-bottom: 16px;
    }
    .jd-textarea:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }
    .btn-group-row {
      display: flex;
      gap: 12px;
    }
    @media (max-width: 768px) {
      .btn-group-row {
        width: 100%;
      }
      .btn-group-row .btn {
        width: 100%;
        justify-content: center;
      }
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 16px;
    }
    .form-group label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted, #94a3b8);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .form-group input, .form-group select {
      background: var(--bg-main, #0f172a);
      border: 1px solid var(--border-color, rgba(255,255,255,0.12));
      border-radius: 8px;
      padding: 10px 12px;
      color: var(--text-main, #f8fafc);
      font-size: 14px;
      font-family: inherit;
    }
    .form-group input:focus, .form-group select:focus {
      outline: none;
      border-color: #6366f1;
    }
    .generation-footer {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .btn {
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }
    .btn-primary { background: #6366f1; color: white; }
    .btn-primary:hover { background: #4f46e5; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { background: #334155; color: white; }
    .btn-secondary:hover { background: #475569; }
    .btn-outline { background: var(--bg-card, #1e293b); border: 1px solid var(--border-color, rgba(255,255,255,0.15)); color: var(--text-main, #f8fafc); }
    .btn-block { width: 100%; text-align: center; }
    .btn-lg { padding: 14px 20px; font-size: 15px; }

    .fact-guarantee {
      font-size: 12px;
      color: var(--text-muted, #94a3b8);
      margin-top: 12px;
      text-align: center;
      line-height: 1.4;
    }
  `]
})
export class CreateResumeComponent implements OnInit {
  jobDescription = '';
  jobTitle = '';
  companyName = '';
  resumeStyle: 'ATS Friendly' | 'Professional' | 'Modern' | 'Minimal' = 'ATS Friendly';
  targetLength: '1 Page' | '2 Pages' | 'Auto' = '1 Page';
  focusArea: 'Balanced' | 'Technical' | 'Experience' | 'Projects' = 'Balanced';

  isGenerating = false;
  progress$: Observable<GenerationProgress>;
  jobAnalysis$: Observable<JobAnalysis | null>;

  constructor(
    private router: Router,
    private masterResumeService: MasterResumeService,
    private generatorService: ResumeGeneratorService,
    private settingsService: SettingsService,
    private toastService: ToastService
  ) {
    this.progress$ = this.generatorService.progress$;
    this.jobAnalysis$ = this.generatorService.activeJobAnalysis$;
  }

  ngOnInit(): void {
    const settings = this.settingsService.getSettings();
    this.resumeStyle = settings.defaultStyle;
    this.targetLength = settings.defaultLength;
    this.focusArea = settings.defaultFocus;
  }

  loadSampleJd(): void {
    this.jobDescription = SAMPLE_JOB_DESCRIPTION;
    this.jobTitle = 'Senior .NET & Angular Developer';
    this.companyName = 'Enterprise Digital Tech Solutions';
    this.toastService.info('Sample Loaded', 'Populated form with demo Job Description.');
  }

  onAnalyzeJd(): void {
    if (!this.jobDescription.trim()) {
      this.toastService.warning('Validation', 'Please paste a Job Description first.');
      return;
    }

    const settings = this.settingsService.getSettings();
    if (!settings.groq.apiKey) {
      this.toastService.error('Groq API Key Required', 'Please configure your Groq API Key in Settings first.');
      this.router.navigate(['/settings']);
      return;
    }

    this.generatorService.analyzeJobDescription(this.jobDescription).subscribe({
      next: (analysis) => {
        if (analysis.jobTitle && !this.jobTitle) {
          this.jobTitle = analysis.jobTitle;
        }
      },
      error: () => {}
    });
  }

  onGenerateResume(): void {
    if (!this.jobDescription.trim()) {
      this.toastService.warning('Validation', 'Please paste a target Job Description.');
      return;
    }

    const masterResume = this.masterResumeService.getCurrentMasterResume();
    if (!masterResume || !masterResume.personalInfo || !masterResume.personalInfo.fullName) {
      this.toastService.error('Master Resume Missing', 'Please complete your Master Resume first.');
      this.router.navigate(['/master-resume']);
      return;
    }

    const settings = this.settingsService.getSettings();
    if (!settings.groq.apiKey) {
      this.toastService.error('Groq API Key Required', 'Please configure your Groq API Key in Settings before generating.');
      this.router.navigate(['/settings']);
      return;
    }

    this.isGenerating = true;

    this.generatorService.generateTailoredResume(masterResume, this.jobDescription, {
      jobTitle: this.jobTitle,
      companyName: this.companyName,
      resumeStyle: this.resumeStyle,
      targetLength: this.targetLength,
      focusArea: this.focusArea
    }).subscribe({
      next: (generated) => {
        this.isGenerating = false;
        // Navigate to Editor view with generated data
        this.router.navigate(['/resume-editor']);
      },
      error: (err) => {
        this.isGenerating = false;
      }
    });
  }
}
