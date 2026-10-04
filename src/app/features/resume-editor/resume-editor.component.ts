import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResumeGeneratorService } from '../../core/services/resume-generator.service';
import { DraftService } from '../../core/services/draft.service';
import { MasterResumeService } from '../../core/services/master-resume.service';
import { PdfService } from '../../core/services/pdf.service';
import { PromptService } from '../../core/services/prompt.service';
import { SettingsService } from '../../core/services/settings.service';
import { ToastService } from '../../core/services/toast.service';
import { GeneratedResume } from '../../core/models/generated-resume.model';
import { ResumeTemplateType } from '../../core/models/settings.model';
import { KeywordMatchResult } from '../../core/models/job-analysis.model';

@Component({
  selector: 'app-resume-editor',
  template: `
    <div class="page-container" *ngIf="resume">
      
      <!-- TOP CONTROL TOOLBAR -->
      <div class="editor-toolbar">
        <div class="toolbar-left">
          <button class="btn btn-sm btn-outline" (click)="goBack()">← Back</button>
          <div class="resume-info">
            <h2>{{ resume.personalInfo.fullName }} — {{ resume.personalInfo.professionalTitle }}</h2>
            <span class="draft-badge" *ngIf="currentDraftId">Draft Saved</span>
          </div>
        </div>

        <div class="toolbar-right">
          <!-- TEMPLATE SELECTOR -->
          <div class="template-selector">
            <label>Template:</label>
            <select [(ngModel)]="activeTemplate" (change)="onTemplateChange()">
              <option value="ats-minimal">1. ATS Minimal</option>
              <option value="professional">2. Professional Corporate</option>
              <option value="modern">3. Modern Tech</option>
            </select>
          </div>

          <button class="btn btn-outline" (click)="showDebugDrawer = !showDebugDrawer">
            🔍 View Prompt / Debug
          </button>

          <button class="btn btn-secondary" (click)="saveAsDraft()">
            💾 Save Draft
          </button>

          <button class="btn btn-outline" (click)="printResume()">
            🖨️ Print
          </button>

          <button class="btn btn-primary" (click)="downloadPdf()">
            📥 Download PDF
          </button>
        </div>
      </div>

      <!-- MOBILE VIEW TABS (Visible on screens <= 1024px) -->
      <div class="mobile-view-tabs">
        <button 
          class="mobile-view-btn" 
          [class.active]="mobileViewTab === 'editor'"
          (click)="mobileViewTab = 'editor'"
        >
          ✏️ Edit Content
        </button>
        <button 
          class="mobile-view-btn" 
          [class.active]="mobileViewTab === 'preview'"
          (click)="mobileViewTab = 'preview'"
        >
          👁️ View A4 Resume
        </button>
      </div>

      <!-- MAIN DUAL-PANEL EDITOR WORKSPACE -->
      <div class="editor-grid">
        
        <!-- LEFT PANEL: EDITABLE FORM CONTROLS -->
        <div class="edit-panel" [class.mobile-hidden]="mobileViewTab !== 'editor'">
          
          <div class="tab-header">
            <button class="tab-btn" [class.active]="activeTab === 'content'" (click)="activeTab = 'content'">
              ✏️ Content Editor
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'keywords'" (click)="activeTab = 'keywords'">
              🔍 Keyword Match
            </button>
          </div>

          <!-- TAB 1: CONTENT EDITOR -->
          <div class="tab-content" *ngIf="activeTab === 'content'">
            
            <!-- PERSONAL INFO EDIT -->
            <div class="edit-section">
              <h4 class="section-title">Personal Info & Title</h4>
              <div class="form-grid col-2">
                <div class="form-group">
                  <label>Full Name</label>
                  <input type="text" [(ngModel)]="resume.personalInfo.fullName" />
                </div>
                <div class="form-group">
                  <label>Professional Title</label>
                  <input type="text" [(ngModel)]="resume.personalInfo.professionalTitle" />
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input type="text" [(ngModel)]="resume.personalInfo.email" />
                </div>
                <div class="form-group">
                  <label>Phone</label>
                  <input type="text" [(ngModel)]="resume.personalInfo.phone" />
                </div>
                <div class="form-group">
                  <label>Location</label>
                  <input type="text" [(ngModel)]="resume.personalInfo.location" />
                </div>
                <div class="form-group">
                  <label>LinkedIn</label>
                  <input type="text" [(ngModel)]="resume.personalInfo.linkedin" />
                </div>
              </div>
            </div>

            <!-- SUMMARY EDIT -->
            <div class="edit-section">
              <h4 class="section-title">Professional Summary</h4>
              <div class="form-group">
                <textarea [(ngModel)]="resume.professionalSummary" rows="4"></textarea>
              </div>
            </div>

            <!-- SKILLS EDIT -->
            <div class="edit-section" *ngIf="resume.skills">
              <h4 class="section-title">Skills & Stack</h4>
              
              <div class="form-group">
                <label>Languages & Frameworks (comma-separated)</label>
                <input type="text" [value]="getJoinedArray(resume.skills.languagesAndFrameworks)" (input)="setJoinedArray(resume.skills, 'languagesAndFrameworks', $event)" />
              </div>

              <div class="form-group">
                <label>Technical Skills & Stack (comma-separated)</label>
                <input type="text" [value]="getJoinedArray(resume.skills.technicalSkills)" (input)="setJoinedArray(resume.skills, 'technicalSkills', $event)" />
              </div>

              <div class="form-group">
                <label>Tools & Infrastructure (comma-separated)</label>
                <input type="text" [value]="getJoinedArray(resume.skills.toolsAndTechnologies)" (input)="setJoinedArray(resume.skills, 'toolsAndTechnologies', $event)" />
              </div>

              <div class="form-group">
                <label>Core Competencies (comma-separated)</label>
                <input type="text" [value]="getJoinedArray(resume.skills.coreCompetencies)" (input)="setJoinedArray(resume.skills, 'coreCompetencies', $event)" />
              </div>
            </div>

            <!-- EXPERIENCE EDIT -->
            <div class="edit-section">
              <div class="header-with-add">
                <h4 class="section-title">Experience Entries</h4>
              </div>

              <div class="item-edit-box" *ngFor="let exp of resume.experience; let i = index">
                <div class="item-edit-header">
                  <strong>#{{ i + 1 }}: {{ exp.role }} @ {{ exp.company }}</strong>
                </div>

                <div class="form-grid col-2">
                  <div class="form-group">
                    <label>Role / Position</label>
                    <input type="text" [(ngModel)]="exp.role" />
                  </div>
                  <div class="form-group">
                    <label>Company</label>
                    <input type="text" [(ngModel)]="exp.company" />
                  </div>
                  <div class="form-group">
                    <label>Dates</label>
                    <input type="text" [value]="exp.startDate + ' – ' + exp.endDate" (change)="updateExpDates(exp, $event)" />
                  </div>
                  <div class="form-group">
                    <label>Location</label>
                    <input type="text" [(ngModel)]="exp.location" />
                  </div>
                </div>

                <div class="form-group">
                  <label>Bullet Points (one per line)</label>
                  <textarea [value]="getJoinedLines(exp.bulletPoints)" (input)="setJoinedLines(exp, 'bulletPoints', $event)" rows="4"></textarea>
                </div>

                <!-- SOURCE TRACEABILITY BADGE -->
                <div class="source-badge" *ngIf="exp.sourceMappings && exp.sourceMappings.length > 0">
                  <span>Source: Master Resume → Professional Experience</span>
                </div>
              </div>
            </div>

            <!-- PROJECTS EDIT -->
            <div class="edit-section">
              <h4 class="section-title">Projects</h4>
              <div class="item-edit-box" *ngFor="let proj of resume.projects; let i = index">
                <div class="form-group">
                  <label>Project Name</label>
                  <input type="text" [(ngModel)]="proj.name" />
                </div>
                <div class="form-group">
                  <label>Description</label>
                  <input type="text" [(ngModel)]="proj.description" />
                </div>
                <div class="form-group">
                  <label>Technologies Used (comma-separated)</label>
                  <input type="text" [value]="getJoinedArray(proj.technologies)" (input)="setJoinedArray(proj, 'technologies', $event)" />
                </div>
                <div class="form-group">
                  <label>Bullet Points (one per line)</label>
                  <textarea [value]="getJoinedLines(proj.bulletPoints)" (input)="setJoinedLines(proj, 'bulletPoints', $event)" rows="3"></textarea>
                </div>
              </div>
            </div>

          </div>

          <!-- TAB 2: KEYWORD MATCH ANALYSIS -->
          <div class="tab-content" *ngIf="activeTab === 'keywords'">
            <app-keyword-match [matchResult]="keywordMatchResult"></app-keyword-match>
          </div>

        </div>

        <!-- RIGHT PANEL: LIVE A4 RESUME PREVIEW -->
        <div class="preview-panel" [class.mobile-hidden]="mobileViewTab !== 'preview'">
          <div class="preview-header">
            <span>A4 Document Preview</span>
            <span class="page-count">1 Page Standard</span>
          </div>

          <div class="preview-scroll-area">
            <app-resume-preview-container 
              [resume]="resume" 
              [template]="activeTemplate"
            ></app-resume-preview-container>
          </div>
        </div>

      </div>

      <!-- PROMPT TRANSPARENCY & DEBUG DRAWER -->
      <div class="debug-drawer" *ngIf="showDebugDrawer">
        <div class="drawer-header">
          <h3>🔍 AI System Prompt & Generation Debug Inspection</h3>
          <button class="btn-close" (click)="showDebugDrawer = false">✕</button>
        </div>
        <div class="drawer-body">
          <div class="debug-block">
            <strong>System Prompt (Strict Zero-Hallucination Rules):</strong>
            <pre>{{ systemPrompt }}</pre>
          </div>
          <div class="debug-block">
            <strong>Generated Resume JSON:</strong>
            <pre>{{ resume | json }}</pre>
          </div>
        </div>
      </div>

    </div>

    <!-- EMPTY STATE IF NO RESUME -->
    <div class="page-container empty-container" *ngIf="!resume">
      <div class="empty-card">
        <div class="empty-icon">✨</div>
        <h2>No Tailored Resume Loaded</h2>
        <p>Paste a Job Description to generate a tailored resume or load an existing draft.</p>
        <a routerLink="/create-resume" class="btn btn-primary">Create Tailored Resume</a>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      box-sizing: border-box;
      width: 100%;
    }
    @media (max-width: 768px) {
      .page-container {
        padding: 14px 10px;
      }
    }
    .editor-toolbar {
      background: var(--bg-card, #1e293b);
      border: 1px solid var(--border-color, rgba(255,255,255,0.08));
      border-radius: 14px;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 16px;
    }
    @media (max-width: 768px) {
      .editor-toolbar {
        flex-direction: column;
        align-items: stretch;
        padding: 14px 12px;
        gap: 12px;
        margin-bottom: 14px;
      }
    }
    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .resume-info h2 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      color: var(--text-main, #f8fafc);
    }
    @media (max-width: 768px) {
      .resume-info h2 {
        font-size: 14px;
      }
    }
    .draft-badge {
      font-size: 11px;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    @media (max-width: 768px) {
      .toolbar-right {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        width: 100%;
      }
      .toolbar-right .btn {
        width: 100%;
        text-align: center;
        justify-content: center;
        box-sizing: border-box;
      }
      .toolbar-right .btn-primary {
        grid-column: 1 / -1;
      }
    }
    @media (max-width: 480px) {
      .toolbar-right {
        grid-template-columns: 1fr;
      }
    }
    .template-selector {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text-muted, #94a3b8);
    }
    @media (max-width: 768px) {
      .template-selector {
        grid-column: 1 / -1;
        width: 100%;
        display: flex;
        justify-content: space-between;
      }
      .template-selector select {
        flex: 1;
      }
    }
    .template-selector select {
      background: var(--bg-main, #0f172a);
      border: 1px solid var(--border-color, rgba(255,255,255,0.12));
      color: var(--text-main, #f8fafc);
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 13px;
    }
    .btn {
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .btn-primary { background: #6366f1; color: white; }
    .btn-primary:hover { background: #4f46e5; }
    .btn-secondary { background: #334155; color: white; }
    .btn-secondary:hover { background: #475569; }
    .btn-outline { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); color: var(--text-main, #f8fafc); }
    .btn-outline:hover { background: rgba(255,255,255,0.1); }
    .btn-sm { padding: 5px 10px; font-size: 12px; }

    /* MOBILE VIEW TABS (Visible <= 1024px) */
    .mobile-view-tabs {
      display: none;
      background: var(--bg-card, #1e293b);
      border: 1px solid var(--border-color, rgba(255,255,255,0.08));
      border-radius: 12px;
      padding: 4px;
      margin-bottom: 16px;
      gap: 6px;
    }
    .mobile-view-btn {
      flex: 1;
      background: transparent;
      border: none;
      color: var(--text-muted, #94a3b8);
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
    }
    .mobile-view-btn.active {
      background: #6366f1;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
    }

    .editor-grid {
      display: grid;
      grid-template-columns: 500px 1fr;
      gap: 24px;
    }
    @media (max-width: 1024px) {
      .mobile-view-tabs {
        display: flex;
      }
      .editor-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      .edit-panel.mobile-hidden,
      .preview-panel.mobile-hidden {
        display: none !important;
      }
      .edit-panel {
        max-height: none !important;
        overflow-y: visible !important;
      }
      .preview-panel {
        height: auto !important;
        min-height: 500px;
        padding: 12px 8px;
      }
      .preview-scroll-area {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        padding: 12px 6px;
      }
      .form-grid.col-2 {
        grid-template-columns: 1fr !important;
      }
    }
    .edit-panel {
      background: var(--bg-card, #1e293b);
      border: 1px solid var(--border-color, rgba(255,255,255,0.08));
      border-radius: 16px;
      padding: 20px;
      max-height: calc(100vh - 180px);
      overflow-y: auto;
      color: var(--text-main, #f8fafc);
    }
    .tab-header {
      display: flex;
      gap: 8px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .tab-btn {
      background: transparent;
      border: none;
      color: var(--text-muted, #94a3b8);
      font-size: 13px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
    }
    .tab-btn.active {
      background: rgba(99, 102, 241, 0.15);
      color: #818cf8;
    }
    .edit-section {
      margin-bottom: 24px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      padding-bottom: 20px;
    }
    .section-title {
      font-size: 15px;
      font-weight: 600;
      margin: 0 0 14px 0;
    }
    .form-grid {
      display: grid;
      gap: 12px;
    }
    .form-grid.col-2 { grid-template-columns: 1fr 1fr; }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 12px;
    }
    .form-group label {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted, #94a3b8);
      text-transform: uppercase;
    }
    .form-group input, .form-group textarea {
      background: var(--bg-main, #0f172a);
      border: 1px solid var(--border-color, rgba(255,255,255,0.12));
      border-radius: 6px;
      padding: 8px 10px;
      color: var(--text-main, #f8fafc);
      font-size: 13px;
      font-family: inherit;
      box-sizing: border-box;
      width: 100%;
    }
    .item-edit-box {
      background: var(--bg-main, #0f172a);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 14px;
    }
    .item-edit-header {
      font-size: 13px;
      margin-bottom: 10px;
      color: #818cf8;
    }
    .source-badge {
      font-size: 11px;
      color: #34d399;
      background: rgba(16, 185, 129, 0.1);
      padding: 4px 8px;
      border-radius: 4px;
      margin-top: 6px;
      display: inline-block;
    }

    .preview-panel {
      background: var(--bg-card, #1e293b);
      border: 1px solid var(--border-color, rgba(255,255,255,0.08));
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      height: calc(100vh - 180px);
    }
    .preview-header {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted, #94a3b8);
      margin-bottom: 16px;
    }
    .preview-scroll-area {
      flex: 1;
      overflow-y: auto;
      overflow-x: auto;
      padding: 20px;
      background: #334155;
      border-radius: 10px;
      display: flex;
      justify-content: center;
    }

    .debug-drawer {
      position: fixed;
      bottom: 0;
      right: 0;
      left: 0;
      background: #0f172a;
      border-top: 2px solid #6366f1;
      padding: 24px;
      z-index: 9980;
      max-height: 400px;
      overflow-y: auto;
      box-shadow: 0 -10px 30px rgba(0,0,0,0.5);
      color: #f8fafc;
    }
    .drawer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .drawer-header h3 { margin: 0; font-size: 16px; }
    .btn-close { background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; }
    .debug-block {
      margin-bottom: 16px;
    }
    .debug-block pre {
      background: #1e293b;
      padding: 12px;
      border-radius: 8px;
      font-size: 11px;
      overflow-x: auto;
      color: #cbd5e1;
    }

    .empty-container { text-align: center; padding: 60px 24px; }
    .empty-card { background: var(--bg-card, #1e293b); padding: 40px; border-radius: 16px; display: inline-block; max-width: 440px; }
    .empty-icon { font-size: 40px; margin-bottom: 12px; }
  `]
})
export class ResumeEditorComponent implements OnInit {
  resume: GeneratedResume | null = null;
  activeTemplate: ResumeTemplateType = 'ats-minimal';
  activeTab: 'content' | 'keywords' = 'content';
  mobileViewTab: 'editor' | 'preview' = 'editor';
  showDebugDrawer = false;
  currentDraftId: string | null = null;
  systemPrompt = '';
  keywordMatchResult: KeywordMatchResult | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private generatorService: ResumeGeneratorService,
    private masterResumeService: MasterResumeService,
    private draftService: DraftService,
    private pdfService: PdfService,
    private promptService: PromptService,
    private settingsService: SettingsService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.systemPrompt = this.promptService.getResumeGenerationSystemPrompt();
    this.activeTemplate = this.settingsService.getSettings().defaultTemplate;

    // Check if draftId is passed in queryParams
    this.route.queryParams.subscribe(params => {
      if (params['draftId']) {
        const draft = this.draftService.getDraftById(params['draftId']);
        if (draft) {
          this.currentDraftId = draft.id;
          this.resume = draft.resumeData;
          this.activeTemplate = draft.template || 'ats-minimal';
          this.computeKeywordMatch();
          return;
        }
      }

      // Otherwise get active generated resume
      this.resume = this.generatorService.getActiveGeneratedResume();
      this.computeKeywordMatch();
    });
  }

  computeKeywordMatch(): void {
    if (this.resume && this.resume.jobAnalysis) {
      const master = this.masterResumeService.getCurrentMasterResume();
      this.keywordMatchResult = this.generatorService.calculateKeywordMatch(this.resume.jobAnalysis, master);
    }
  }

  onTemplateChange(): void {
    this.toastService.info('Template Changed', `Switched view to ${this.activeTemplate} template.`);
  }

  getJoinedArray(arr: string[] | undefined): string {
    return Array.isArray(arr) ? arr.join(', ') : '';
  }

  setJoinedArray(target: any, field: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    target[field] = val.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  getJoinedLines(arr: string[] | undefined): string {
    return Array.isArray(arr) ? arr.join('\n') : '';
  }

  setJoinedLines(target: any, field: string, event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    target[field] = val.split('\n').map(s => s.trim()).filter(s => s.length > 0);
  }

  updateExpDates(exp: any, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    const parts = val.split('–').map(s => s.trim());
    exp.startDate = parts[0] || exp.startDate;
    exp.endDate = parts[1] || exp.endDate;
  }

  saveAsDraft(): void {
    if (!this.resume) return;
    const title = this.resume.generationOptions?.jobTitle || this.resume.personalInfo.professionalTitle;
    const company = this.resume.generationOptions?.companyName || 'Target Company';

    const draft = this.draftService.saveDraft(
      title,
      company,
      this.resume,
      this.activeTemplate,
      undefined,
      this.currentDraftId || undefined
    );
    this.currentDraftId = draft.id;
  }

  printResume(): void {
    this.pdfService.printResume();
  }

  downloadPdf(): void {
    if (!this.resume) return;
    const name = `${this.resume.personalInfo.fullName.replace(/\s+/g, '_')}_Resume`;
    this.pdfService.downloadPdf('resume-preview-document', name);
  }

  goBack(): void {
    this.router.navigate(['/create-resume']);
  }
}
