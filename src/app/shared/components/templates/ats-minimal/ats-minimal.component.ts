import { Component, Input } from '@angular/core';
import { GeneratedResume } from '../../../../core/models/generated-resume.model';

@Component({
  selector: 'app-ats-minimal-template',
  template: `
    <div class="resume-document ats-minimal" id="resume-preview-document" *ngIf="resume">
      <!-- HEADER -->
      <header class="header">
        <h1 class="name">{{ resume.personalInfo.fullName }}</h1>
        <div class="title">{{ resume.personalInfo.professionalTitle }}</div>
        <div class="contact-line">
          <span *ngIf="resume.personalInfo.email">{{ resume.personalInfo.email }}</span>
          <span class="sep" *ngIf="resume.personalInfo.email && resume.personalInfo.phone">•</span>
          <span *ngIf="resume.personalInfo.phone">{{ resume.personalInfo.phone }}</span>
          <span class="sep" *ngIf="resume.personalInfo.phone && resume.personalInfo.location">•</span>
          <span *ngIf="resume.personalInfo.location">{{ resume.personalInfo.location }}</span>
        </div>
        <div class="links-line" *ngIf="resume.personalInfo.linkedin || resume.personalInfo.github || resume.personalInfo.portfolio">
          <span *ngIf="resume.personalInfo.linkedin">LinkedIn: {{ resume.personalInfo.linkedin }}</span>
          <span class="sep" *ngIf="resume.personalInfo.linkedin && resume.personalInfo.github">•</span>
          <span *ngIf="resume.personalInfo.github">GitHub: {{ resume.personalInfo.github }}</span>
          <span class="sep" *ngIf="resume.personalInfo.github && resume.personalInfo.portfolio">•</span>
          <span *ngIf="resume.personalInfo.portfolio">Portfolio: {{ resume.personalInfo.portfolio }}</span>
        </div>
      </header>

      <!-- SUMMARY -->
      <section class="section" *ngIf="resume.professionalSummary">
        <h2 class="section-title">SUMMARY</h2>
        <p class="summary-text">{{ resume.professionalSummary }}</p>
      </section>

      <!-- SKILLS -->
      <section class="section" *ngIf="hasSkills()">
        <h2 class="section-title">SKILLS</h2>
        <div class="skills-block">
          <div *ngIf="resume.skills.languagesAndFrameworks && resume.skills.languagesAndFrameworks.length > 0">
            <strong>Languages & Frameworks:</strong> {{ resume.skills.languagesAndFrameworks.join(', ') }}
          </div>
          <div *ngIf="resume.skills.technicalSkills && resume.skills.technicalSkills.length > 0">
            <strong>Technical Skills:</strong> {{ resume.skills.technicalSkills.join(', ') }}
          </div>
          <div *ngIf="resume.skills.toolsAndTechnologies && resume.skills.toolsAndTechnologies.length > 0">
            <strong>Tools & Infrastructure:</strong> {{ resume.skills.toolsAndTechnologies.join(', ') }}
          </div>
          <div *ngIf="resume.skills.coreCompetencies && resume.skills.coreCompetencies.length > 0">
            <strong>Core Competencies:</strong> {{ resume.skills.coreCompetencies.join(', ') }}
          </div>
        </div>
      </section>

      <!-- PROFESSIONAL EXPERIENCE -->
      <section class="section" *ngIf="resume.experience && resume.experience.length > 0">
        <h2 class="section-title">PROFESSIONAL EXPERIENCE</h2>
        <div class="item" *ngFor="let exp of resume.experience">
          <div class="item-header">
            <div class="item-title-group">
              <strong class="role">{{ exp.role }}</strong> — <span class="company">{{ exp.company }}</span>
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
        <h2 class="section-title">PROJECTS</h2>
        <div class="item" *ngFor="let proj of resume.projects">
          <div class="item-header">
            <div class="item-title-group">
              <strong class="role">{{ proj.name }}</strong>
            </div>
          </div>
          <p class="proj-desc" *ngIf="proj.description">{{ proj.description }}</p>
          <div class="tech-used" *ngIf="proj.technologies && proj.technologies.length > 0">
            <em>Technologies: {{ proj.technologies.join(', ') }}</em>
          </div>
          <ul class="bullet-list" *ngIf="proj.bulletPoints && proj.bulletPoints.length > 0">
            <li *ngFor="let bullet of proj.bulletPoints">{{ bullet }}</li>
          </ul>
        </div>
      </section>

      <!-- EDUCATION -->
      <section class="section" *ngIf="resume.education && resume.education.length > 0">
        <h2 class="section-title">EDUCATION</h2>
        <div class="item" *ngFor="let edu of resume.education">
          <div class="item-header">
            <div>
              <strong class="role">{{ edu.degree }}</strong> — <span class="institution">{{ edu.institution }}</span>
            </div>
            <div class="item-date">{{ edu.startDate }} – {{ edu.endDate }}</div>
          </div>
          <div class="item-location" *ngIf="edu.location">{{ edu.location }} <span *ngIf="edu.grade">| Grade: {{ edu.grade }}</span></div>
        </div>
      </section>

      <!-- CERTIFICATIONS -->
      <section class="section" *ngIf="resume.certifications && resume.certifications.length > 0">
        <h2 class="section-title">CERTIFICATIONS</h2>
        <ul class="bullet-list">
          <li *ngFor="let cert of resume.certifications">
            <strong>{{ cert.name }}</strong> — {{ cert.issuer }} ({{ cert.date }})
          </li>
        </ul>
      </section>

      <!-- ACHIEVEMENTS -->
      <section class="section" *ngIf="resume.achievements && resume.achievements.length > 0">
        <h2 class="section-title">KEY ACHIEVEMENTS</h2>
        <ul class="bullet-list">
          <li *ngFor="let ach of resume.achievements">
            <strong>{{ ach.title }}:</strong> {{ ach.description }} <span *ngIf="ach.date">({{ ach.date }})</span>
          </li>
        </ul>
      </section>

    </div>
  `,
  styles: [`
    .resume-document.ats-minimal {
      font-family: 'Calibri', 'Helvetica Neue', Arial, sans-serif;
      color: #000000;
      background: #ffffff;
      padding: 40px 48px;
      box-sizing: border-box;
      width: 100%;
      min-height: 1000px;
      line-height: 1.45;
      font-size: 11pt;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #000000;
    }
    .name {
      font-size: 22pt;
      font-weight: bold;
      text-transform: uppercase;
      margin: 0 0 4px 0;
      letter-spacing: 0.5px;
    }
    .title {
      font-size: 13pt;
      font-weight: 600;
      color: #333333;
      margin-bottom: 8px;
    }
    .contact-line, .links-line {
      font-size: 9.5pt;
      color: #333333;
    }
    .sep {
      margin: 0 6px;
      color: #666666;
    }
    .section {
      margin-bottom: 18px;
    }
    .section-title {
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
      border-bottom: 1px solid #000000;
      padding-bottom: 3px;
      margin: 0 0 10px 0;
      letter-spacing: 0.8px;
    }
    .summary-text {
      margin: 0;
      font-size: 10.5pt;
      text-align: justify;
    }
    .skills-block div {
      margin-bottom: 4px;
      font-size: 10pt;
    }
    .item {
      margin-bottom: 12px;
    }
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .role {
      font-size: 11pt;
    }
    .company, .institution {
      font-weight: bold;
    }
    .item-date {
      font-size: 10pt;
      font-weight: bold;
    }
    .item-location {
      font-size: 9.5pt;
      color: #444444;
      font-style: italic;
      margin-bottom: 4px;
    }
    .proj-desc {
      font-size: 10pt;
      margin: 2px 0 4px 0;
    }
    .tech-used {
      font-size: 9.5pt;
      color: #333333;
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
      .resume-document.ats-minimal {
        padding: 24px 16px;
        min-height: auto;
        font-size: 10pt;
      }
      .name {
        font-size: 18pt;
      }
      .title {
        font-size: 11pt;
      }
      .item-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .contact-line, .links-line {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 4px;
      }
    }
  `]
})
export class AtsMinimalTemplateComponent {
  @Input() resume: GeneratedResume | null = null;

  hasSkills(): boolean {
    if (!this.resume || !this.resume.skills) return false;
    const s = this.resume.skills;
    return (s.languagesAndFrameworks?.length > 0) || (s.technicalSkills?.length > 0) || (s.toolsAndTechnologies?.length > 0) || (s.coreCompetencies?.length > 0);
  }
}
