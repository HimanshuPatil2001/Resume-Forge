import { Component, OnInit } from '@angular/core';
import { MasterResumeService } from '../../core/services/master-resume.service';
import { DraftService } from '../../core/services/draft.service';
import { MasterResume } from '../../core/models/master-resume.model';
import { ResumeDraft } from '../../core/models/draft.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="page-container">
      
      <!-- HERO BANNER -->
      <div class="hero-banner">
        <div class="hero-content">
          <h1>Craft AI-Tailored, Fact-Grounded Resumes</h1>
          <p>
            Seamlessly generate ATS-optimized, job-specific resumes using Groq AI. 
            Strictly grounded in your single Master Resume — zero hallucinations.
          </p>
          <div class="hero-actions">
            <a routerLink="/create-resume" class="btn btn-primary">
              ✨ Tailor New Resume
            </a>
            <a routerLink="/linkedin-optimizer" class="btn btn-purple">
              🔗 Optimize LinkedIn
            </a>
            <a routerLink="/master-resume" class="btn btn-secondary">
              📁 Manage Master Resume
            </a>
          </div>
        </div>
        <div class="hero-badge-wrap">
          <div class="engine-badge">
            <span class="icon">🚀</span>
            <div class="text">
              <strong>Groq Llama 3.3 Engine</strong>
              <span>Frontend-Only Execution</span>
            </div>
          </div>
        </div>
      </div>

      <!-- LINKEDIN OPTIMIZER PROMO CARD -->
      <div class="linkedin-promo-banner">
        <div class="promo-icon">🔗</div>
        <div class="promo-content">
          <div class="promo-title-row">
            <h4>LinkedIn Profile Optimizer</h4>
            <span class="badge-new">New Feature</span>
          </div>
          <p>
            Paste your LinkedIn profile or upload your profile PDF. Groq AI audits it against your Master Resume to generate recruiter-magnet headlines, a story-driven About narrative, and highlight missing high-value achievements.
          </p>
        </div>
        <div class="promo-actions">
          <a routerLink="/linkedin-optimizer" class="btn btn-purple">
            🚀 Open Optimizer →
          </a>
        </div>
      </div>

      <!-- METRICS CARDS -->
      <div class="metrics-grid">
        
        <div class="metric-card">
          <div class="metric-header">
            <span class="icon">👤</span>
            <span class="label">Master Resume</span>
          </div>
          <div class="metric-value green" *ngIf="masterResume$ | async as master">
            ✓ Ready
          </div>
          <div class="metric-sub" *ngIf="masterResume$ | async as master">
            Last Updated: {{ master.lastUpdated ? (master.lastUpdated | date:'mediumDate') : 'Today' }}
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="icon">💼</span>
            <span class="label">Experience Entries</span>
          </div>
          <div class="metric-value">
            {{ getExperienceCount(masterResume$ | async) }}
          </div>
          <div class="metric-sub">Verified Career History</div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="icon">🚀</span>
            <span class="label">Projects</span>
          </div>
          <div class="metric-value">
            {{ getProjectCount(masterResume$ | async) }}
          </div>
          <div class="metric-sub">Highlighted Work Portfolio</div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="icon">⚡</span>
            <span class="label">Skills Catalog</span>
          </div>
          <div class="metric-value">
            {{ getSkillCount(masterResume$ | async) }}
          </div>
          <div class="metric-sub">Across 10 Categories</div>
        </div>

      </div>

      <!-- RECENT DRAFTS SECTION -->
      <div class="section-container">
        <div class="section-header">
          <div>
            <h3>Recent Tailored Resumes</h3>
            <p>Saved local drafts created with Groq AI</p>
          </div>
          <a routerLink="/drafts" class="link-btn">View All Drafts →</a>
        </div>

        <div class="drafts-grid" *ngIf="(drafts$ | async) as drafts">
          
          <div class="empty-state" *ngIf="drafts.length === 0">
            <div class="empty-icon">📑</div>
            <h4>No Generated Resumes Yet</h4>
            <p>Paste a Job Description to create your first tailored resume.</p>
            <a routerLink="/create-resume" class="btn btn-primary">Create First Resume</a>
          </div>

          <div class="draft-card" *ngFor="let draft of drafts.slice(0, 3)">
            <div class="draft-card-header">
              <span class="template-badge">{{ draft.template }}</span>
              <span class="draft-date">{{ draft.updatedAt | date:'shortDate' }}</span>
            </div>
            <h4 class="draft-title">{{ draft.jobTitle }}</h4>
            <div class="draft-company">{{ draft.companyName || 'Target Company' }}</div>
            
            <div class="draft-footer">
              <span class="bullet-count">
                {{ (draft.resumeData.experience && draft.resumeData.experience.length) || 0 }} Experiences • {{ (draft.resumeData.projects && draft.resumeData.projects.length) || 0 }} Projects
              </span>
              <a [routerLink]="['/resume-editor']" [queryParams]="{ draftId: draft.id }" class="btn btn-sm btn-outline">
                Open & Edit
              </a>
            </div>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    .page-container {
      padding: 28px;
      max-width: 1200px;
      margin: 0 auto;
      box-sizing: border-box;
      width: 100%;
    }
    @media (max-width: 768px) {
      .page-container {
        padding: 16px 12px;
      }
    }
    .hero-banner {
      background: linear-gradient(135deg, #1e1b4b, #312e81, #4338ca);
      border-radius: 20px;
      padding: 36px 40px;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 28px;
      box-shadow: 0 20px 40px -15px rgba(67, 56, 202, 0.4);
    }
    @media (max-width: 768px) {
      .hero-banner {
        flex-direction: column;
        align-items: stretch;
        padding: 20px 16px;
        border-radius: 14px;
        margin-bottom: 20px;
        gap: 16px;
      }
    }
    .hero-content h1 {
      font-size: 26px;
      font-weight: 800;
      margin: 0 0 10px 0;
      line-height: 1.25;
    }
    @media (max-width: 768px) {
      .hero-content h1 {
        font-size: 21px;
      }
    }
    .hero-content p {
      font-size: 15px;
      color: #c7d2fe;
      margin: 0 0 24px 0;
      max-width: 600px;
      line-height: 1.5;
    }
    @media (max-width: 768px) {
      .hero-content p {
        font-size: 13px;
        margin-bottom: 16px;
      }
    }
    .hero-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    @media (max-width: 768px) {
      .hero-actions {
        flex-direction: column;
        width: 100%;
        gap: 8px;
      }
      .hero-actions .btn {
        width: 100%;
        justify-content: center;
        text-align: center;
        box-sizing: border-box;
      }
    }
    .btn {
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
      cursor: pointer;
      border: none;
    }
    .btn-primary { background: #6366f1; color: #ffffff; }
    .btn-primary:hover { background: #4f46e5; transform: translateY(-1px); }
    .btn-secondary { background: rgba(255,255,255,0.15); color: #ffffff; backdrop-filter: blur(4px); }
    .btn-secondary:hover { background: rgba(255,255,255,0.25); }
    .btn-purple {
      background: linear-gradient(135deg, #8b5cf6, #d946ef);
      color: #ffffff;
      font-weight: 700;
    }
    .btn-purple:hover {
      opacity: 0.95;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
    }
    .linkedin-promo-banner {
      display: flex;
      align-items: center;
      gap: 20px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12));
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 14px;
      padding: 18px 24px;
      margin-bottom: 28px;
    }
    @media (max-width: 768px) {
      .linkedin-promo-banner {
        flex-direction: column;
        align-items: stretch;
        padding: 16px 14px;
        margin-bottom: 20px;
        gap: 12px;
      }
    }
    .promo-icon {
      font-size: 32px;
      flex-shrink: 0;
    }
    .promo-content {
      flex: 1;
    }
    .promo-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 4px;
    }
    .promo-title-row h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: var(--text-main, #f8fafc);
    }
    .badge-new {
      background: #8b5cf6;
      color: #fff;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .promo-content p {
      margin: 0;
      font-size: 13px;
      color: var(--text-muted, #94a3b8);
      line-height: 1.4;
      max-width: 780px;
    }
    .promo-actions {
      flex-shrink: 0;
    }
    @media (max-width: 768px) {
      .promo-actions {
        width: 100%;
      }
      .promo-actions .btn {
        width: 100%;
        justify-content: center;
        box-sizing: border-box;
      }
    }
    .hero-badge-wrap {
      flex-shrink: 0;
    }
    @media (max-width: 768px) {
      .hero-badge-wrap {
        width: 100%;
      }
    }
    .engine-badge {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      padding: 14px 20px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    @media (max-width: 768px) {
      .engine-badge {
        width: 100%;
        box-sizing: border-box;
        justify-content: center;
        padding: 10px 14px;
      }
    }
    .engine-badge .icon { font-size: 24px; }
    .engine-badge strong { display: block; font-size: 13px; color: #ffffff; }
    .engine-badge span { font-size: 11px; color: #a5b4fc; }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 18px;
      margin-bottom: 32px;
    }
    @media (max-width: 900px) {
      .metrics-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    }
    @media (max-width: 500px) {
      .metrics-grid { grid-template-columns: 1fr; gap: 10px; margin-bottom: 20px; }
    }
    .metric-card {
      background: var(--bg-card, #1e293b);
      border: 1px solid var(--border-color, rgba(255,255,255,0.08));
      border-radius: 16px;
      padding: 20px;
      color: var(--text-main, #f8fafc);
    }
    @media (max-width: 500px) {
      .metric-card {
        padding: 14px 16px;
        border-radius: 12px;
      }
    }
    .metric-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }
    .metric-header .icon { font-size: 18px; }
    .metric-header .label { font-size: 13px; color: var(--text-muted, #94a3b8); font-weight: 500; }
    .metric-value {
      font-size: 26px;
      font-weight: 800;
      margin-bottom: 4px;
    }
    .metric-value.green { color: #34d399; font-size: 20px; }
    .metric-sub {
      font-size: 12px;
      color: var(--text-muted, #64748b);
    }

    .section-container {
      background: var(--bg-card, #1e293b);
      border: 1px solid var(--border-color, rgba(255,255,255,0.08));
      border-radius: 16px;
      padding: 24px;
    }
    @media (max-width: 768px) {
      .section-container {
        padding: 16px 14px;
        border-radius: 14px;
      }
    }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 10px;
    }
    @media (max-width: 768px) {
      .section-header {
        flex-direction: column;
        align-items: flex-start;
      }
    }
    .section-header h3 { font-size: 18px; margin: 0 0 4px 0; color: var(--text-main, #f8fafc); }
    .section-header p { font-size: 13px; margin: 0; color: var(--text-muted, #94a3b8); }
    .link-btn { color: #818cf8; text-decoration: none; font-size: 13px; font-weight: 600; }

    .drafts-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
    }
    @media (max-width: 1024px) {
      .drafts-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      .drafts-grid { grid-template-columns: 1fr; }
    }
    .draft-card {
      background: var(--bg-main, #0f172a);
      border: 1px solid var(--border-color, rgba(255,255,255,0.06));
      border-radius: 12px;
      padding: 18px;
      display: flex;
      flex-direction: column;
    }
    @media (max-width: 768px) {
      .draft-card {
        padding: 14px;
      }
    }
    .draft-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .template-badge {
      font-size: 11px;
      text-transform: uppercase;
      background: rgba(99, 102, 241, 0.15);
      color: #818cf8;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 600;
    }
    .draft-date { font-size: 12px; color: var(--text-muted, #64748b); }
    .draft-title { font-size: 15px; font-weight: 600; margin: 0 0 4px 0; color: var(--text-main, #f8fafc); }
    .draft-company { font-size: 13px; color: var(--text-muted, #94a3b8); margin-bottom: 16px; }
    .draft-footer {
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 12px;
      border-top: 1px solid rgba(255,255,255,0.06);
      flex-wrap: wrap;
      gap: 8px;
    }
    @media (max-width: 500px) {
      .draft-footer {
        flex-direction: column;
        align-items: stretch;
      }
      .draft-footer .btn-outline {
        width: 100%;
        text-align: center;
        justify-content: center;
        box-sizing: border-box;
      }
    }
    .bullet-count { font-size: 11px; color: var(--text-muted, #64748b); }
    .btn-outline {
      border: 1px solid var(--border-color, rgba(255,255,255,0.2));
      color: var(--text-main, #f8fafc);
      padding: 6px 12px;
      font-size: 12px;
    }
    .btn-outline:hover { background: rgba(255,255,255,0.08); }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 36px;
      background: rgba(15, 23, 42, 0.5);
      border-radius: 12px;
      border: 1px dashed rgba(255,255,255,0.1);
    }
    .empty-icon { font-size: 36px; margin-bottom: 8px; }
    .empty-state h4 { margin: 0 0 4px 0; font-size: 16px; color: var(--text-main, #f8fafc); }
    .empty-state p { font-size: 13px; color: var(--text-muted, #94a3b8); margin: 0 0 16px 0; }
  `]
})
export class DashboardComponent implements OnInit {
  masterResume$: Observable<MasterResume>;
  drafts$: Observable<ResumeDraft[]>;

  constructor(
    private masterResumeService: MasterResumeService,
    private draftService: DraftService
  ) {
    this.masterResume$ = this.masterResumeService.masterResume$;
    this.drafts$ = this.draftService.drafts$;
  }

  ngOnInit(): void {}

  getExperienceCount(master: MasterResume | null): number {
    return master && master.professionalExperience ? master.professionalExperience.length : 0;
  }

  getProjectCount(master: MasterResume | null): number {
    return master && master.projects ? master.projects.length : 0;
  }

  getSkillCount(master: MasterResume | null): number {
    if (!master || !master.skills) return 0;
    return Object.values(master.skills).flat().length;
  }
}
