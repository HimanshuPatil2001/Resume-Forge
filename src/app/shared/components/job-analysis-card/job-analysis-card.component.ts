import { Component, Input } from '@angular/core';
import { JobAnalysis } from '../../../core/models/job-analysis.model';

@Component({
  selector: 'app-job-analysis-card',
  template: `
    <div class="job-analysis-card" *ngIf="analysis">
      <div class="card-header">
        <div class="title-wrap">
          <span class="badge-icon">📊</span>
          <div>
            <h3>{{ analysis.jobTitle || 'Analyzed Role' }}</h3>
            <span class="sub-company" *ngIf="analysis.companyName">{{ analysis.companyName }}</span>
          </div>
        </div>
      </div>

      <div class="analysis-grid">
        
        <div class="section-box" *ngIf="analysis.requiredSkills && analysis.requiredSkills.length > 0">
          <span class="box-label">Required Skills</span>
          <div class="pills-wrap">
            <span class="pill pill-indigo" *ngFor="let skill of analysis.requiredSkills">{{ skill }}</span>
          </div>
        </div>

        <div class="section-box" *ngIf="analysis.preferredSkills && analysis.preferredSkills.length > 0">
          <span class="box-label">Preferred Skills</span>
          <div class="pills-wrap">
            <span class="pill pill-purple" *ngFor="let skill of analysis.preferredSkills">{{ skill }}</span>
          </div>
        </div>

        <div class="section-box" *ngIf="analysis.technologies && analysis.technologies.length > 0">
          <span class="box-label">Technologies & Tools</span>
          <div class="pills-wrap">
            <span class="pill pill-cyan" *ngFor="let tech of analysis.technologies">{{ tech }}</span>
          </div>
        </div>

        <div class="section-box" *ngIf="analysis.keywords && analysis.keywords.length > 0">
          <span class="box-label">ATS Keywords</span>
          <div class="pills-wrap">
            <span class="pill pill-emerald" *ngFor="let kw of analysis.keywords">{{ kw }}</span>
          </div>
        </div>

      </div>

      <div class="responsibilities-box" *ngIf="analysis.responsibilities && analysis.responsibilities.length > 0">
        <span class="box-label">Key Responsibilities</span>
        <ul class="resp-list">
          <li *ngFor="let resp of analysis.responsibilities.slice(0, 5)">{{ resp }}</li>
        </ul>
      </div>

    </div>
  `,
  styles: [`
    .job-analysis-card {
      background: var(--bg-card, #1e293b);
      border: 1px solid var(--border-color, rgba(255,255,255,0.1));
      border-radius: 14px;
      padding: 20px;
      color: var(--text-main, #f8fafc);
      margin-bottom: 20px;
    }
    @media (max-width: 768px) {
      .job-analysis-card {
        padding: 14px 12px;
        border-radius: 12px;
      }
    }
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      padding-bottom: 12px;
      flex-wrap: wrap;
      gap: 8px;
    }
    .title-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .badge-icon {
      font-size: 24px;
    }
    h3 {
      font-size: 17px;
      font-weight: 600;
      margin: 0;
    }
    .sub-company {
      font-size: 13px;
      color: var(--text-muted, #94a3b8);
    }
    .analysis-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    @media (max-width: 640px) {
      .analysis-grid { grid-template-columns: 1fr; }
    }
    .section-box {
      background: rgba(15, 23, 42, 0.4);
      padding: 12px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.04);
    }
    .box-label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted, #94a3b8);
      margin-bottom: 8px;
    }
    .pills-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .pill {
      font-size: 12px;
      padding: 3px 8px;
      border-radius: 6px;
      font-weight: 500;
    }
    .pill-indigo { background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.2); }
    .pill-purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.2); }
    .pill-cyan { background: rgba(6, 182, 212, 0.15); color: #22d3ee; border: 1px solid rgba(6, 182, 212, 0.2); }
    .pill-emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); }
    .responsibilities-box {
      background: rgba(15, 23, 42, 0.4);
      padding: 12px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.04);
    }
    .resp-list {
      margin: 0;
      padding-left: 18px;
      font-size: 13px;
      color: var(--text-main, #cbd5e1);
      line-height: 1.5;
    }
    .resp-list li {
      margin-bottom: 4px;
    }
  `]
})
export class JobAnalysisCardComponent {
  @Input() analysis: JobAnalysis | null = null;
}
