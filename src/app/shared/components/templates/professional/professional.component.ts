import { Component, Input } from '@angular/core';
import { GeneratedResume } from '../../../../core/models/generated-resume.model';

@Component({
  selector: 'app-professional-template',
  template: `
    <div class="resume-document professional" id="resume-preview-document" *ngIf="resume">
      <!-- HEADER -->
      <header class="header">
        <h1 class="name">{{ resume.personalInfo.fullName }}</h1>
        <div class="title">{{ resume.personalInfo.professionalTitle }}</div>
        
        <div class="contact-grid">
          <span *ngIf="resume.personalInfo.email">✉ {{ resume.personalInfo.email }}</span>
          <span *ngIf="resume.personalInfo.phone">📱 {{ resume.personalInfo.phone }}</span>
          <span *ngIf="resume.personalInfo.location">📍 {{ resume.personalInfo.location }}</span>
          <span *ngIf="resume.personalInfo.linkedin">🔗 {{ resume.personalInfo.linkedin }}</span>
          <span *ngIf="resume.personalInfo.github">💻 {{ resume.personalInfo.github }}</span>
          <span *ngIf="resume.personalInfo.portfolio">🌐 {{ resume.personalInfo.portfolio }}</span>
        </div>
      </header>

      <!-- SUMMARY -->
      <section class="section" *ngIf="resume.professionalSummary">
        <h2 class="section-title"><span>Executive Profile</span></h2>
        <p class="summary-text">{{ resume.professionalSummary }}</p>
      </section>

      <!-- SKILLS -->
      <section class="section" *ngIf="hasSkills()">
        <h2 class="section-title"><span>Core Technical Expertise</span></h2>
        <div class="skills-grid">
          <div *ngIf="resume.skills.languagesAndFrameworks && resume.skills.languagesAndFrameworks.length > 0">
            <span class="skill-label">Languages & Frameworks:</span>
            <p>{{ resume.skills.languagesAndFrameworks.join(' • ') }}</p>
          </div>
          <div *ngIf="resume.skills.technicalSkills && resume.skills.technicalSkills.length > 0">
            <span class="skill-label">Technical Competencies:</span>
            <p>{{ resume.skills.technicalSkills.join(' • ') }}</p>
          </div>
          <div *ngIf="resume.skills.toolsAndTechnologies && resume.skills.toolsAndTechnologies.length > 0">
            <span class="skill-label">Tools & Infrastructure:</span>
            <p>{{ resume.skills.toolsAndTechnologies.join(' • ') }}</p>
          </div>
        </div>
      </section>

      <!-- PROFESSIONAL EXPERIENCE -->
      <section class="section" *ngIf="resume.experience && resume.experience.length > 0">
        <h2 class="section-title"><span>Professional Experience</span></h2>
        <div class="item" *ngFor="let exp of resume.experience">
          <div class="item-header">
            <div>
              <span class="role">{{ exp.role }}</span>
              <span class="company"> | {{ exp.company }}</span>
            </div>
            <div class="item-date">{{ exp.startDate }} – {{ exp.endDate }}</div>
          </div>
          <div class="item-sub" *ngIf="exp.location">{{ exp.location }}</div>
          <ul class="bullet-list">
            <li *ngFor="let bullet of exp.bulletPoints">{{ bullet }}</li>
          </ul>
        </div>
      </section>

      <!-- PROJECTS -->
      <section class="section" *ngIf="resume.projects && resume.projects.length > 0">
        <h2 class="section-title"><span>Key Projects</span></h2>
        <div class="item" *ngFor="let proj of resume.projects">
          <div class="item-header">
            <span class="role">{{ proj.name }}</span>
          </div>
          <p class="proj-desc" *ngIf="proj.description">{{ proj.description }}</p>
          <div class="tech-tag" *ngIf="proj.technologies && proj.technologies.length > 0">
            <strong>Stack:</strong> {{ proj.technologies.join(', ') }}
          </div>
          <ul class="bullet-list" *ngIf="proj.bulletPoints && proj.bulletPoints.length > 0">
            <li *ngFor="let bullet of proj.bulletPoints">{{ bullet }}</li>
          </ul>
        </div>
      </section>

      <!-- EDUCATION -->
      <section class="section" *ngIf="resume.education && resume.education.length > 0">
        <h2 class="section-title"><span>Education</span></h2>
        <div class="item" *ngFor="let edu of resume.education">
          <div class="item-header">
            <div>
              <span class="role">{{ edu.degree }}</span>
              <span class="company"> — {{ edu.institution }}</span>
            </div>
            <div class="item-date">{{ edu.startDate }} – {{ edu.endDate }}</div>
          </div>
          <div class="item-sub" *ngIf="edu.location">{{ edu.location }} <span *ngIf="edu.grade">({{ edu.grade }})</span></div>
        </div>
      </section>

      <!-- CERTIFICATIONS -->
      <section class="section" *ngIf="resume.certifications && resume.certifications.length > 0">
        <h2 class="section-title"><span>Certifications</span></h2>
        <ul class="bullet-list">
          <li *ngFor="let cert of resume.certifications">
            <strong>{{ cert.name }}</strong> — {{ cert.issuer }} ({{ cert.date }})
          </li>
        </ul>
      </section>

    </div>
  `,
  styles: [`
    .resume-document.professional {
      font-family: 'Georgia', 'Times New Roman', serif;
      color: #1a1a1a;
      background: #ffffff;
      padding: 44px 50px;
      box-sizing: border-box;
      width: 100%;
      min-height: 1000px;
      line-height: 1.5;
      font-size: 10.5pt;
    }
    .header {
      border-bottom: 3px double #1e3a8a;
      padding-bottom: 16px;
      margin-bottom: 22px;
    }
    .name {
      font-size: 24pt;
      font-weight: 700;
      color: #1e3a8a;
      margin: 0 0 4px 0;
      letter-spacing: 0.5px;
    }
    .title {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 12pt;
      font-weight: 600;
      color: #4b5563;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .contact-grid {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      display: flex;
      flex-wrap: wrap;
      gap: 12px 18px;
      font-size: 9pt;
      color: #374151;
    }
    .section {
      margin-bottom: 20px;
    }
    .section-title {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 11pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #1e3a8a;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      margin: 0 0 12px 0;
    }
    .summary-text {
      margin: 0;
      font-size: 10pt;
      text-align: justify;
      color: #1f2937;
    }
    .skills-grid {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      display: grid;
      grid-template-columns: 1fr;
      gap: 6px;
      font-size: 9.5pt;
    }
    .skill-label {
      font-weight: bold;
      color: #1e3a8a;
    }
    .skills-grid p {
      margin: 2px 0 0 0;
      color: #374151;
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
      font-weight: bold;
      font-size: 11pt;
      color: #0f172a;
    }
    .company {
      font-style: italic;
      color: #334155;
    }
    .item-date {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 9.5pt;
      font-weight: 600;
      color: #475569;
    }
    .item-sub {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 9pt;
      color: #64748b;
      margin-bottom: 4px;
    }
    .proj-desc {
      font-size: 10pt;
      margin: 2px 0;
    }
    .tech-tag {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 9pt;
      color: #1e3a8a;
      margin-bottom: 4px;
    }
    .bullet-list {
      margin: 4px 0 0 0;
      padding-left: 18px;
      font-size: 10pt;
    }
    .bullet-list li {
      margin-bottom: 3px;
    }
    @media (max-width: 768px) {
      .resume-document.professional {
        padding: 22px 14px;
        min-height: auto;
      }
      .name {
        font-size: 19pt;
      }
      .title {
        font-size: 10.5pt;
      }
      .item-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .contact-grid {
        gap: 8px 12px;
      }
    }
  `]
})
export class ProfessionalTemplateComponent {
  @Input() resume: GeneratedResume | null = null;

  hasSkills(): boolean {
    if (!this.resume || !this.resume.skills) return false;
    const s = this.resume.skills;
    return (s.languagesAndFrameworks?.length > 0) || (s.technicalSkills?.length > 0) || (s.toolsAndTechnologies?.length > 0) || (s.coreCompetencies?.length > 0);
  }
}
