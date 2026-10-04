import { Component, Input } from '@angular/core';
import { GeneratedResume } from '../../../../core/models/generated-resume.model';

@Component({
  selector: 'app-modern-template',
  template: `
    <div class="resume-document modern" id="resume-preview-document" *ngIf="resume">
      <!-- HEADER -->
      <header class="header">
        <div class="header-main">
          <h1 class="name">{{ resume.personalInfo.fullName }}</h1>
          <div class="title-badge">{{ resume.personalInfo.professionalTitle }}</div>
        </div>
        
        <div class="contact-bar">
          <div class="contact-item" *ngIf="resume.personalInfo.email">
            <span class="lbl">EMAIL</span>
            <span class="val">{{ resume.personalInfo.email }}</span>
          </div>
          <div class="contact-item" *ngIf="resume.personalInfo.phone">
            <span class="lbl">PHONE</span>
            <span class="val">{{ resume.personalInfo.phone }}</span>
          </div>
          <div class="contact-item" *ngIf="resume.personalInfo.location">
            <span class="lbl">LOCATION</span>
            <span class="val">{{ resume.personalInfo.location }}</span>
          </div>
          <div class="contact-item" *ngIf="resume.personalInfo.linkedin">
            <span class="lbl">LINKEDIN</span>
            <span class="val">{{ resume.personalInfo.linkedin }}</span>
          </div>
          <div class="contact-item" *ngIf="resume.personalInfo.github">
            <span class="lbl">GITHUB</span>
            <span class="val">{{ resume.personalInfo.github }}</span>
          </div>
        </div>
      </header>

      <!-- SUMMARY -->
      <section class="section" *ngIf="resume.professionalSummary">
        <h2 class="section-title">Professional Summary</h2>
        <p class="summary-text">{{ resume.professionalSummary }}</p>
      </section>

      <!-- SKILLS -->
      <section class="section" *ngIf="hasSkills()">
        <h2 class="section-title">Technical Expertise</h2>
        <div class="skills-flex">
          <ng-container *ngFor="let skill of getCombinedSkills()">
            <span class="skill-tag">{{ skill }}</span>
          </ng-container>
        </div>
      </section>

      <!-- PROFESSIONAL EXPERIENCE -->
      <section class="section" *ngIf="resume.experience && resume.experience.length > 0">
        <h2 class="section-title">Professional Experience</h2>
        <div class="item" *ngFor="let exp of resume.experience">
          <div class="item-header">
            <div class="role-company">
              <strong class="role">{{ exp.role }}</strong>
              <span class="company">@ {{ exp.company }}</span>
            </div>
            <div class="item-date">{{ exp.startDate }} – {{ exp.endDate }}</div>
          </div>
          <div class="item-location" *ngIf="exp.location">{{ exp.location }}</div>
          <ul class="bullet-list">
            <li *ngFor="let bullet of exp.bulletPoints">{{ bullet }}</li>
          </ul>
        </div>
      </section>

      <!-- PROJECTS -->
      <section class="section" *ngIf="resume.projects && resume.projects.length > 0">
        <h2 class="section-title">Featured Projects</h2>
        <div class="item" *ngFor="let proj of resume.projects">
          <div class="item-header">
            <strong class="role">{{ proj.name }}</strong>
          </div>
          <p class="proj-desc" *ngIf="proj.description">{{ proj.description }}</p>
          <div class="tech-pills" *ngIf="proj.technologies && proj.technologies.length > 0">
            <span class="tech-mini" *ngFor="let t of proj.technologies">{{ t }}</span>
          </div>
          <ul class="bullet-list" *ngIf="proj.bulletPoints && proj.bulletPoints.length > 0">
            <li *ngFor="let bullet of proj.bulletPoints">{{ bullet }}</li>
          </ul>
        </div>
      </section>

      <!-- EDUCATION -->
      <section class="section" *ngIf="resume.education && resume.education.length > 0">
        <h2 class="section-title">Education</h2>
        <div class="item" *ngFor="let edu of resume.education">
          <div class="item-header">
            <div>
              <strong class="role">{{ edu.degree }}</strong> — <span class="company">{{ edu.institution }}</span>
            </div>
            <div class="item-date">{{ edu.startDate }} – {{ edu.endDate }}</div>
          </div>
          <div class="item-location" *ngIf="edu.location">{{ edu.location }} <span *ngIf="edu.grade">({{ edu.grade }})</span></div>
        </div>
      </section>

      <!-- CERTIFICATIONS -->
      <section class="section" *ngIf="resume.certifications && resume.certifications.length > 0">
        <h2 class="section-title">Certifications</h2>
        <ul class="bullet-list">
          <li *ngFor="let cert of resume.certifications">
            <strong>{{ cert.name }}</strong> — {{ cert.issuer }} ({{ cert.date }})
          </li>
        </ul>
      </section>

    </div>
  `,
  styles: [`
    .resume-document.modern {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 40px 48px;
      box-sizing: border-box;
      width: 100%;
      min-height: 1000px;
      line-height: 1.5;
      font-size: 10pt;
    }
    .header {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .name {
      font-size: 22pt;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 6px 0;
      letter-spacing: -0.5px;
    }
    .title-badge {
      display: inline-block;
      font-size: 11pt;
      font-weight: 600;
      color: #4f46e5;
      background: #e0e7ff;
      padding: 4px 12px;
      border-radius: 6px;
      margin-bottom: 16px;
    }
    .contact-bar {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
    }
    .contact-item {
      display: flex;
      flex-direction: column;
    }
    .lbl {
      font-size: 7.5pt;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.5px;
    }
    .val {
      font-size: 9pt;
      color: #1e293b;
      font-weight: 500;
    }
    .section {
      margin-bottom: 22px;
    }
    .section-title {
      font-size: 12pt;
      font-weight: 700;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 12px 0;
      padding-bottom: 4px;
      border-bottom: 2px solid #6366f1;
    }
    .summary-text {
      margin: 0;
      font-size: 10pt;
      color: #334155;
    }
    .skills-flex {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .skill-tag {
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #cbd5e1;
      font-size: 9pt;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .item {
      margin-bottom: 14px;
    }
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .role {
      font-size: 11pt;
      color: #0f172a;
    }
    .company {
      font-weight: 600;
      color: #4f46e5;
    }
    .item-date {
      font-size: 9pt;
      font-weight: 600;
      color: #64748b;
      background: #f1f5f9;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .item-location {
      font-size: 9pt;
      color: #64748b;
      margin-bottom: 4px;
    }
    .proj-desc {
      font-size: 9.5pt;
      margin: 2px 0;
    }
    .tech-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin: 4px 0;
    }
    .tech-mini {
      font-size: 8.5pt;
      background: #e0e7ff;
      color: #4338ca;
      padding: 1px 6px;
      border-radius: 4px;
      font-weight: 500;
    }
    .bullet-list {
      margin: 4px 0 0 0;
      padding-left: 18px;
      font-size: 9.5pt;
      color: #1e293b;
    }
    .bullet-list li {
      margin-bottom: 3px;
    }
    @media (max-width: 768px) {
      .resume-document.modern {
        padding: 20px 14px;
        min-height: auto;
      }
      .name {
        font-size: 18pt;
      }
      .header {
        padding: 16px;
      }
      .contact-bar {
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .item-header {
        flex-direction: column;
        align-items: flex-start;
      }
    }
    @media (max-width: 480px) {
      .contact-bar {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ModernTemplateComponent {
  @Input() resume: GeneratedResume | null = null;

  hasSkills(): boolean {
    if (!this.resume || !this.resume.skills) return false;
    return this.getCombinedSkills().length > 0;
  }

  getCombinedSkills(): string[] {
    if (!this.resume || !this.resume.skills) return [];
    const s = this.resume.skills;
    return [
      ...(s.languagesAndFrameworks || []),
      ...(s.technicalSkills || []),
      ...(s.toolsAndTechnologies || []),
      ...(s.coreCompetencies || [])
    ];
  }
}
