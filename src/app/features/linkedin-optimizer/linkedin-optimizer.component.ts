import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LinkedInOptimizerService } from '../../core/services/linkedin-optimizer.service';
import { MasterResumeService } from '../../core/services/master-resume.service';
import { PdfTextExtractorService } from '../../core/services/pdf-text-extractor.service';
import { ToastService } from '../../core/services/toast.service';
import { SettingsService } from '../../core/services/settings.service';
import {
  LinkedInProfile,
  LinkedInOptimizationResult,
  LinkedInHeadlineOption,
  LinkedInAboutOption
} from '../../core/models/linkedin.model';
import { MasterResume } from '../../core/models/master-resume.model';

@Component({
  selector: 'app-linkedin-optimizer',
  template: `
    <div class="page-container">
      
      <!-- TOP HEADER -->
      <div class="page-header">
        <div>
          <div class="title-with-badge">
            <h1 class="page-title">LinkedIn Profile Optimizer</h1>
            <span class="badge-tag">AI Powered</span>
          </div>
          <p class="page-subtitle">
            Extract your LinkedIn profile, audit against your verified Master Resume, and generate recruiter-magnet headlines, story-driven About sections, and quantified experience bullets.
          </p>
        </div>

        <div class="header-actions">
          <button class="btn btn-outline" (click)="loadSample()">
            💡 Load Sample Profile
          </button>
          <button class="btn btn-outline" routerLink="/master-resume">
            📁 View Master Resume
          </button>
          <button class="btn btn-danger-outline" (click)="resetAll()" *ngIf="currentProfile || optimizationResult">
            🔄 Reset
          </button>
        </div>
      </div>

      <!-- STEP 1: INPUT BOX -->
      <div class="card-section input-card">
        <div class="section-title-row">
          <div class="title-wrap">
            <span class="step-num">1</span>
            <div>
              <h3>Import Your LinkedIn Profile</h3>
              <p>Paste profile text, paste your profile URL, or upload your LinkedIn "Save to PDF" document.</p>
            </div>
          </div>

          <div class="input-mode-tabs">
            <button class="tab-pill" [class.active]="inputMode === 'text'" (click)="inputMode = 'text'">
              📋 Paste Text / URL
            </button>
            <button class="tab-pill" [class.active]="inputMode === 'pdf'" (click)="inputMode = 'pdf'">
              📄 Upload LinkedIn PDF
            </button>
          </div>
        </div>

        <!-- MODE A: TEXT / URL INPUT -->
        <div class="mode-container" *ngIf="inputMode === 'text'">
          
          <!-- URL DETECTION NOTICE -->
          <div class="url-guide-banner" *ngIf="isUrlDetected">
            <div class="banner-icon">ℹ️</div>
            <div class="banner-content">
              <strong>LinkedIn URL Detected!</strong>
              <p>
                Because LinkedIn profiles are protected behind a login wall, direct web scraping is blocked by LinkedIn. 
                For 100% accurate results, choose one of these instant methods:
              </p>
              <div class="guide-steps">
                <div class="guide-step">
                  <span class="step-badge">Fastest</span>
                  <span>On your LinkedIn profile page, click <strong>More (...) → Save to PDF</strong>, then switch to the <em>Upload LinkedIn PDF</em> tab above!</span>
                </div>
                <div class="guide-step">
                  <span class="step-badge">Direct</span>
                  <span>Or simply open your LinkedIn profile, press <strong>Ctrl+A (Select All)</strong>, copy, and paste the text below!</span>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>
              LinkedIn Profile Text or URL
              <span class="label-hint">(Headline, About, Experience, Skills, or Full Page Copy)</span>
            </label>
            <textarea 
              [(ngModel)]="rawInputText"
              (input)="onTextChange()"
              rows="6"
              class="raw-text-area"
              placeholder="Paste text from your LinkedIn profile or paste your profile link (e.g. John Developer \n Software Developer at TechCorp...)"
            ></textarea>
          </div>

          <div class="action-row">
            <button 
              class="btn btn-primary"
              [disabled]="!rawInputText.trim() || (isParsing$ | async)"
              (click)="extractFromText()"
            >
              <span *ngIf="isParsing$ | async" class="spinner-sm"></span>
              {{ (isParsing$ | async) ? 'Extracting with Groq AI...' : '✨ Extract LinkedIn Info' }}
            </button>
          </div>
        </div>

        <!-- MODE B: PDF UPLOAD -->
        <div class="mode-container" *ngIf="inputMode === 'pdf'">
          <div class="pdf-dropzone">
            <span class="upload-icon">📄</span>
            <h4>Upload LinkedIn Profile PDF</h4>
            <p class="dropzone-sub">
              To export: Go to your LinkedIn profile → click <strong>More (...)</strong> → select <strong>Save to PDF</strong>.
            </p>
            
            <input 
              type="file" 
              id="linkedInPdfInput" 
              accept=".pdf" 
              (change)="onPdfSelected($event)" 
              class="file-input-hidden" 
            />
            <label for="linkedInPdfInput" class="btn btn-primary btn-sm">
              Choose LinkedIn PDF File
            </label>

            <div class="selected-file" *ngIf="selectedFileName">
              Selected: <strong>{{ selectedFileName }}</strong>
            </div>

            <div class="parsing-spinner" *ngIf="isPdfExtracting">
              <span class="spinner-sm"></span>
              <span>Extracting PDF text and analyzing with Groq AI...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 2: EXTRACTED LINKEDIN PROFILE PREVIEW -->
      <div class="card-section current-profile-card" *ngIf="currentProfile">
        <div class="section-title-row">
          <div class="title-wrap">
            <span class="step-num">2</span>
            <div>
              <h3>Extracted LinkedIn Profile</h3>
              <p>Review the recognized data from your current LinkedIn profile.</p>
            </div>
          </div>

          <div class="profile-cta-buttons">
            <button class="btn btn-secondary-outline" (click)="mergeToMasterResume()" title="Add missing items to Master Resume">
              📥 Sync to Master Resume
            </button>
            <button 
              class="btn btn-purple" 
              [disabled]="isOptimizing$ | async"
              (click)="runOptimization()"
            >
              <span *ngIf="isOptimizing$ | async" class="spinner-sm"></span>
              {{ (isOptimizing$ | async) ? 'Optimizing with Master Resume...' : '🚀 Optimize with Master Resume' }}
            </button>
          </div>
        </div>

        <div class="profile-summary-grid">
          <div class="summary-box">
            <div class="summary-label">Name & Headline</div>
            <div class="profile-name">{{ currentProfile.fullName }}</div>
            <div class="current-headline">{{ currentProfile.currentHeadline || 'No headline detected' }}</div>
            <div class="profile-meta" *ngIf="currentProfile.location">📍 {{ currentProfile.location }}</div>
          </div>

          <div class="summary-box">
            <div class="summary-label">Current About Section</div>
            <div class="profile-about-text">
              {{ currentProfile.about || 'No About section provided on profile.' }}
            </div>
          </div>
        </div>

        <div class="profile-details-grid">
          <!-- EXPERIENCES -->
          <div class="detail-box">
            <div class="detail-box-header">
              <span class="box-icon">💼</span>
              <strong>Experience Roles ({{ currentProfile.experiences.length }})</strong>
            </div>
            <div class="role-list">
              <div class="role-item" *ngFor="let exp of currentProfile.experiences">
                <div class="role-title">{{ exp.role }} <span class="at-company">at {{ exp.company }}</span></div>
                <div class="role-meta">{{ exp.duration || exp.startDate }}</div>
                <div class="bullet-count" *ngIf="exp.bulletPoints.length">
                  • {{ exp.bulletPoints.length }} bullets listed
                </div>
              </div>
              <div class="empty-hint" *ngIf="currentProfile.experiences.length === 0">
                No experience entries detected in text.
              </div>
            </div>
          </div>

          <!-- SKILLS -->
          <div class="detail-box">
            <div class="detail-box-header">
              <span class="box-icon">⚡</span>
              <strong>Listed Skills ({{ currentProfile.skills.length }})</strong>
            </div>
            <div class="skill-tags">
              <span class="skill-tag" *ngFor="let s of currentProfile.skills">{{ s }}</span>
              <span class="empty-hint" *ngIf="currentProfile.skills.length === 0">
                No individual skills detected in text.
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 3: OPTIMIZATION RESULTS DASHBOARD -->
      <div class="optimization-container" *ngIf="optimizationResult as opt">
        
        <!-- AUDIT SCORE CARD -->
        <div class="card-section audit-card">
          <div class="audit-header">
            <div class="audit-score-circle">
              <div class="score-number">{{ opt.audit.overallScore }}</div>
              <div class="score-max">/100</div>
              <div class="score-label">LinkedIn Strength</div>
            </div>

            <div class="audit-assessment">
              <h3>Profile Optimization Audit</h3>
              <p class="assessment-text">{{ opt.audit.summaryAssessment }}</p>

              <div class="score-bars-grid">
                <div class="score-bar-item">
                  <div class="bar-label">
                    <span>Headline Impact</span>
                    <strong>{{ opt.audit.headlineScore }}%</strong>
                  </div>
                  <div class="bar-track">
                    <div class="bar-fill" [style.width.%]="opt.audit.headlineScore"></div>
                  </div>
                </div>

                <div class="score-bar-item">
                  <div class="bar-label">
                    <span>About Storytelling</span>
                    <strong>{{ opt.audit.aboutScore }}%</strong>
                  </div>
                  <div class="bar-track">
                    <div class="bar-fill" [style.width.%]="opt.audit.aboutScore"></div>
                  </div>
                </div>

                <div class="score-bar-item">
                  <div class="bar-label">
                    <span>Experience Depth & Metrics</span>
                    <strong>{{ opt.audit.experienceScore }}%</strong>
                  </div>
                  <div class="bar-track">
                    <div class="bar-fill" [style.width.%]="opt.audit.experienceScore"></div>
                  </div>
                </div>

                <div class="score-bar-item">
                  <div class="bar-label">
                    <span>Skills Visibility</span>
                    <strong>{{ opt.audit.skillsScore }}%</strong>
                  </div>
                  <div class="bar-track">
                    <div class="bar-fill" [style.width.%]="opt.audit.skillsScore"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ACTION ITEMS -->
          <div class="action-items-box" *ngIf="opt.audit.keyActionItems.length">
            <strong>🎯 Key Action Items to Implement:</strong>
            <ul class="action-items-list">
              <li *ngFor="let item of opt.audit.keyActionItems">{{ item }}</li>
            </ul>
          </div>
        </div>

        <!-- TABS FOR RESULTS -->
        <div class="result-tabs-row">
          <button 
            class="nav-tab-btn" 
            [class.active]="activeTab === 'headlines'" 
            (click)="activeTab = 'headlines'"
          >
            🎯 High-Impact Headlines ({{ opt.headlineOptions.length }})
          </button>
          <button 
            class="nav-tab-btn" 
            [class.active]="activeTab === 'about'" 
            (click)="activeTab = 'about'"
          >
            📝 Story-Driven About ({{ opt.aboutOptions.length }})
          </button>
          <button 
            class="nav-tab-btn" 
            [class.active]="activeTab === 'experience'" 
            (click)="activeTab = 'experience'"
          >
            💼 Experience Upgrades ({{ opt.experienceOptimizations.length }})
          </button>
          <button 
            class="nav-tab-btn" 
            [class.active]="activeTab === 'skills'" 
            (click)="activeTab = 'skills'"
          >
            ⚡ Skills & Keywords
          </button>
        </div>

        <!-- TAB 1: HEADLINES -->
        <div class="tab-content" *ngIf="activeTab === 'headlines'">
          <div class="headline-cards-list">
            <div class="headline-card" *ngFor="let h of opt.headlineOptions; let i = index">
              <div class="card-top">
                <div class="headline-type-pill" [class.primary-pill]="i === 0">
                  {{ h.title }}
                </div>
                <div class="char-badge" [class.char-good]="h.charCount <= 220" [class.char-warn]="h.charCount > 220">
                  {{ h.charCount }} / 220 chars
                </div>
              </div>

              <div class="headline-text-box">
                {{ h.headline }}
              </div>

              <div class="card-bottom">
                <p class="explanation-text">💡 {{ h.explanation }}</p>
                <button 
                  class="btn btn-copy" 
                  [class.copied]="copiedIndex === 'h_' + i"
                  (click)="copyToClipboard(h.headline, 'h_' + i)"
                >
                  {{ copiedIndex === 'h_' + i ? '✓ Copied Headline' : '📋 Copy Headline' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: ABOUT SECTION -->
        <div class="tab-content" *ngIf="activeTab === 'about'">
          <div class="about-cards-list">
            <div class="about-card" *ngFor="let a of opt.aboutOptions; let i = index">
              <div class="card-top">
                <div class="headline-type-pill primary-pill">
                  {{ a.title }}
                </div>
                <div class="char-badge char-good">
                  {{ a.aboutText.length }} / 2,600 chars
                </div>
              </div>

              <div class="hook-box" *ngIf="a.hook">
                <span class="hook-label">Opening Hook:</span>
                <em>"{{ a.hook }}"</em>
              </div>

              <div class="about-text-content">
                <pre class="about-pre">{{ a.aboutText }}</pre>
              </div>

              <div class="card-bottom">
                <div class="cta-preview" *ngIf="a.callToAction">
                  <strong>CTA:</strong> {{ a.callToAction }}
                </div>
                <button 
                  class="btn btn-copy"
                  [class.copied]="copiedIndex === 'a_' + i"
                  (click)="copyToClipboard(a.aboutText, 'a_' + i)"
                >
                  {{ copiedIndex === 'a_' + i ? '✓ Copied About' : '📋 Copy About Section' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 3: EXPERIENCE UPGRADES -->
        <div class="tab-content" *ngIf="activeTab === 'experience'">
          <div class="experience-upgrades-list">
            <div class="exp-upgrade-card" *ngFor="let exp of opt.experienceOptimizations; let i = index">
              <div class="exp-card-header">
                <div>
                  <h4>{{ exp.role }} <span class="at-company">at {{ exp.company }}</span></h4>
                  <p class="impact-note">{{ exp.impactExplanation }}</p>
                </div>

                <button 
                  class="btn btn-copy"
                  [class.copied]="copiedIndex === 'exp_' + i"
                  (click)="copyToClipboard(exp.optimizedBullets.join('\n\n'), 'exp_' + i)"
                >
                  {{ copiedIndex === 'exp_' + i ? '✓ Copied Bullets' : '📋 Copy Bullets' }}
                </button>
              </div>

              <!-- GAPS DETECTED IN MASTER RESUME -->
              <div class="gaps-box" *ngIf="exp.masterResumeGapsFound.length">
                <div class="gaps-header">
                  <span class="badge-alert">Gaps Found</span>
                  <span>Valuable achievements in Master Resume missing from LinkedIn:</span>
                </div>
                <ul class="gaps-list">
                  <li *ngFor="let gap of exp.masterResumeGapsFound">{{ gap }}</li>
                </ul>
              </div>

              <!-- OPTIMIZED BULLETS -->
              <div class="optimized-bullets-box">
                <div class="box-title">✨ Recommended LinkedIn Bullet Points:</div>
                <div class="bullet-item" *ngFor="let bullet of exp.optimizedBullets">
                  <span class="bullet-dot">•</span>
                  <span>{{ bullet }}</span>
                </div>
              </div>
            </div>

            <div class="empty-hint" *ngIf="opt.experienceOptimizations.length === 0">
              No experience optimizations needed or available.
            </div>
          </div>
        </div>

        <!-- TAB 4: SKILLS STRATEGY -->
        <div class="tab-content" *ngIf="activeTab === 'skills'">
          <div class="skills-strategy-grid">
            
            <!-- TOP 5 PINNED SKILLS -->
            <div class="strategy-card">
              <div class="card-header-icon">
                <span class="icon">📌</span>
                <div>
                  <h4>Top 5 Pinned Skills</h4>
                  <p>Pin these 5 core skills to the top of your LinkedIn profile for recruiter search visibility.</p>
                </div>
              </div>

              <div class="pinned-skills-list">
                <div class="pinned-badge" *ngFor="let skill of opt.skillsOptimization.top5PinnedSkills; let idx = index">
                  <span class="pin-num">#{{ idx + 1 }}</span>
                  <span class="pin-text">{{ skill }}</span>
                </div>
              </div>
            </div>

            <!-- MISSING HIGH-VALUE SKILLS -->
            <div class="strategy-card">
              <div class="card-header-icon">
                <span class="icon">🔍</span>
                <div>
                  <h4>Missing Skills from Master Resume</h4>
                  <p>These verified skills exist in your Master Resume but are missing from your LinkedIn skills list.</p>
                </div>
              </div>

              <div class="missing-skills-list">
                <span class="missing-badge" *ngFor="let s of opt.skillsOptimization.missingHighValueSkills">
                  + {{ s }}
                </span>
                <span class="empty-hint" *ngIf="opt.skillsOptimization.missingHighValueSkills.length === 0">
                  All Master Resume skills are already represented!
                </span>
              </div>
            </div>

          </div>

          <!-- CATEGORIZED SKILL MATRIX -->
          <div class="categorized-skills-section" *ngIf="opt.skillsOptimization.categorizedSkills.length">
            <h4 class="matrix-title">Strategic Skills Matrix</h4>
            <div class="matrix-grid">
              <div class="matrix-card" *ngFor="let cat of opt.skillsOptimization.categorizedSkills">
                <div class="matrix-cat-title">{{ cat.category }}</div>
                <div class="cat-tags">
                  <span class="cat-tag" *ngFor="let sk of cat.skills">{{ sk }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- EXPORT BAR -->
        <div class="card-section export-bar">
          <div class="export-text">
            <h4>Ready to Update Your LinkedIn Profile?</h4>
            <p>Copy individual sections above or copy the entire optimization guide into your clipboard.</p>
          </div>

          <div class="export-actions">
            <button 
              class="btn btn-primary"
              [class.copied]="copiedIndex === 'all'"
              (click)="copyFullOptimization(opt)"
            >
              {{ copiedIndex === 'all' ? '✓ Copied Full Guide' : '📋 Copy Full Guide to Clipboard' }}
            </button>
            <button class="btn btn-outline" (click)="downloadMarkdownReport(opt)">
              📥 Download Report (.md)
            </button>
          </div>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .page-container {
      padding: 28px 36px;
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
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      gap: 20px;
      flex-wrap: wrap;
    }
    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: stretch;
        gap: 14px;
      }
    }
    .title-with-badge {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .page-title {
      font-size: 26px;
      font-weight: 700;
      color: var(--text-main, #f8fafc);
      margin: 0;
    }
    @media (max-width: 768px) {
      .page-title {
        font-size: 21px;
      }
    }
    .badge-tag {
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .page-subtitle {
      color: var(--text-muted, #94a3b8);
      font-size: 14px;
      margin: 6px 0 0 0;
      max-width: 750px;
      line-height: 1.5;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    @media (max-width: 768px) {
      .header-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        width: 100%;
      }
      .header-actions .btn {
        width: 100%;
        justify-content: center;
        text-align: center;
        box-sizing: border-box;
      }
    }
    @media (max-width: 480px) {
      .header-actions {
        grid-template-columns: 1fr;
      }
    }
    .card-section {
      background: var(--bg-card, #1e293b);
      border: 1px solid var(--border-color, rgba(255,255,255,0.08));
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    @media (max-width: 768px) {
      .card-section {
        padding: 16px 12px;
        border-radius: 12px;
      }
    }
    .section-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
      flex-wrap: wrap;
      gap: 16px;
    }
    @media (max-width: 768px) {
      .section-title-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
      .input-mode-tabs {
        width: 100%;
        display: flex;
      }
      .input-mode-tabs .tab-pill {
        flex: 1;
        text-align: center;
      }
    }
    .title-wrap {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .title-wrap h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--text-main, #f8fafc);
    }
    .title-wrap p {
      margin: 2px 0 0 0;
      font-size: 13px;
      color: var(--text-muted, #94a3b8);
    }
    .step-num {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
    }
    .input-mode-tabs {
      display: flex;
      background: rgba(0,0,0,0.2);
      padding: 4px;
      border-radius: 8px;
      gap: 4px;
    }
    .tab-pill {
      background: transparent;
      border: none;
      color: var(--text-muted, #94a3b8);
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .tab-pill.active {
      background: var(--bg-card-hover, rgba(255,255,255,0.1));
      color: var(--text-main, #fff);
      font-weight: 600;
    }
    .url-guide-banner {
      display: flex;
      gap: 12px;
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 16px;
      color: var(--text-main, #f8fafc);
      font-size: 13px;
    }
    .banner-icon {
      font-size: 20px;
    }
    .banner-content strong {
      color: #818cf8;
      font-size: 14px;
    }
    .banner-content p {
      margin: 4px 0 8px 0;
      color: var(--text-muted, #94a3b8);
      line-height: 1.4;
    }
    .guide-steps {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .guide-step {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .step-badge {
      background: #6366f1;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 16px;
    }
    .form-group label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-main, #f8fafc);
    }
    .label-hint {
      font-weight: 400;
      color: var(--text-muted, #94a3b8);
      font-size: 12px;
      margin-left: 6px;
    }
    .raw-text-area {
      width: 100%;
      background: var(--bg-input, #0f172a);
      border: 1px solid var(--border-color, rgba(255,255,255,0.12));
      border-radius: 8px;
      padding: 12px 14px;
      color: var(--text-main, #f8fafc);
      font-size: 13px;
      font-family: inherit;
      resize: vertical;
      box-sizing: border-box;
      line-height: 1.5;
    }
    .raw-text-area:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }
    .action-row {
      display: flex;
      justify-content: flex-end;
    }
    .pdf-dropzone {
      border: 2px dashed var(--border-color, rgba(255,255,255,0.15));
      border-radius: 10px;
      padding: 36px 20px;
      text-align: center;
      background: rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .upload-icon {
      font-size: 36px;
    }
    .pdf-dropzone h4 {
      margin: 0;
      font-size: 16px;
      color: var(--text-main, #f8fafc);
    }
    .dropzone-sub {
      color: var(--text-muted, #94a3b8);
      font-size: 13px;
      margin: 0;
      max-width: 500px;
    }
    .file-input-hidden {
      display: none;
    }
    .selected-file {
      font-size: 12px;
      color: #34d399;
      background: rgba(52, 211, 153, 0.1);
      padding: 4px 10px;
      border-radius: 6px;
    }
    .parsing-spinner {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #818cf8;
      margin-top: 6px;
    }
    /* STEP 2 PREVIEW */
    .profile-cta-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .profile-summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    @media (max-width: 768px) {
      .profile-summary-grid { grid-template-columns: 1fr; }
    }
    .summary-box {
      background: rgba(0,0,0,0.18);
      border: 1px solid var(--border-color, rgba(255,255,255,0.06));
      border-radius: 8px;
      padding: 16px;
    }
    .summary-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted, #94a3b8);
      font-weight: 700;
      margin-bottom: 6px;
    }
    .profile-name {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-main, #f8fafc);
    }
    .current-headline {
      font-size: 13px;
      color: #818cf8;
      margin-top: 2px;
      font-weight: 500;
    }
    .profile-meta {
      font-size: 12px;
      color: var(--text-muted, #94a3b8);
      margin-top: 6px;
    }
    .profile-about-text {
      font-size: 13px;
      color: var(--text-muted, #cbd5e1);
      line-height: 1.5;
      max-height: 90px;
      overflow-y: auto;
    }
    .profile-details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    @media (max-width: 768px) {
      .profile-details-grid { grid-template-columns: 1fr; }
    }
    .detail-box {
      background: rgba(0,0,0,0.18);
      border: 1px solid var(--border-color, rgba(255,255,255,0.06));
      border-radius: 8px;
      padding: 16px;
    }
    .detail-box-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text-main, #f8fafc);
      margin-bottom: 12px;
    }
    .role-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 160px;
      overflow-y: auto;
    }
    .role-item {
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }
    .role-item:last-child { border-bottom: none; padding-bottom: 0; }
    .role-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-main, #f8fafc);
    }
    .at-company {
      font-weight: 400;
      color: var(--text-muted, #94a3b8);
    }
    .role-meta {
      font-size: 11px;
      color: var(--text-muted, #64748b);
    }
    .bullet-count {
      font-size: 11px;
      color: #818cf8;
      margin-top: 2px;
    }
    .skill-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      max-height: 160px;
      overflow-y: auto;
    }
    .skill-tag {
      background: rgba(255,255,255,0.06);
      color: var(--text-main, #f8fafc);
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
    .empty-hint {
      font-size: 12px;
      color: var(--text-muted, #64748b);
      font-style: italic;
    }

    /* STEP 3 AUDIT CARD */
    .audit-header {
      display: flex;
      gap: 28px;
      align-items: center;
      flex-wrap: wrap;
    }
    @media (max-width: 768px) {
      .audit-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 16px;
      }
      .audit-assessment {
        min-width: 0 !important;
        width: 100%;
        text-align: left;
      }
    }
    .audit-score-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2));
      border: 3px solid #6366f1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .score-number {
      font-size: 36px;
      font-weight: 800;
      color: #fff;
      line-height: 1;
    }
    .score-max {
      font-size: 12px;
      color: var(--text-muted, #94a3b8);
    }
    .score-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #818cf8;
      font-weight: 700;
      margin-top: 2px;
    }
    .audit-assessment {
      flex: 1;
      min-width: 280px;
    }
    .audit-assessment h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: var(--text-main, #f8fafc);
    }
    .assessment-text {
      color: var(--text-muted, #cbd5e1);
      font-size: 13px;
      margin: 6px 0 14px 0;
      line-height: 1.5;
    }
    .score-bars-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 20px;
    }
    @media (max-width: 600px) {
      .score-bars-grid { grid-template-columns: 1fr; }
    }
    .score-bar-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .bar-label {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--text-muted, #94a3b8);
    }
    .bar-label strong {
      color: var(--text-main, #f8fafc);
    }
    .bar-track {
      width: 100%;
      height: 6px;
      background: rgba(255,255,255,0.08);
      border-radius: 4px;
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #a855f7);
      border-radius: 4px;
      transition: width 0.5s ease-out;
    }
    .action-items-box {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid rgba(255,255,255,0.06);
      font-size: 13px;
      color: var(--text-main, #f8fafc);
    }
    .action-items-list {
      margin: 8px 0 0 0;
      padding-left: 18px;
      color: var(--text-muted, #cbd5e1);
      line-height: 1.6;
    }

    /* RESULT TABS */
    .result-tabs-row {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.08));
      padding-bottom: 8px;
      overflow-x: auto;
    }
    .nav-tab-btn {
      background: transparent;
      border: none;
      color: var(--text-muted, #94a3b8);
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;
    }
    .nav-tab-btn.active {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2));
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .nav-tab-btn:hover:not(.active) {
      color: #fff;
      background: rgba(255,255,255,0.04);
    }

    /* HEADLINES LIST */
    .headline-cards-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }
    .headline-card {
      background: var(--bg-card, #1e293b);
      border: 1px solid var(--border-color, rgba(255,255,255,0.08));
      border-radius: 10px;
      padding: 20px;
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      flex-wrap: wrap;
      gap: 8px;
    }
    .headline-type-pill {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted, #94a3b8);
      background: rgba(255,255,255,0.06);
      padding: 4px 10px;
      border-radius: 6px;
    }
    .primary-pill {
      background: rgba(99, 102, 241, 0.2);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .char-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .char-good {
      background: rgba(52, 211, 153, 0.15);
      color: #34d399;
    }
    .char-warn {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
    }
    .headline-text-box {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-main, #f8fafc);
      background: rgba(0,0,0,0.25);
      padding: 14px 16px;
      border-radius: 8px;
      line-height: 1.5;
      margin-bottom: 12px;
      border-left: 3px solid #6366f1;
    }
    .card-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    @media (max-width: 600px) {
      .card-bottom {
        flex-direction: column;
        align-items: stretch;
      }
      .card-bottom .btn {
        width: 100%;
        justify-content: center;
      }
    }
    .explanation-text {
      margin: 0;
      font-size: 12px;
      color: var(--text-muted, #94a3b8);
      flex: 1;
      min-width: 250px;
    }
    @media (max-width: 600px) {
      .explanation-text {
        min-width: 0;
      }
    }

    /* ABOUT SECTION */
    .about-cards-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 24px;
    }
    .about-card {
      background: var(--bg-card, #1e293b);
      border: 1px solid var(--border-color, rgba(255,255,255,0.08));
      border-radius: 10px;
      padding: 22px;
    }
    .hook-box {
      background: rgba(99, 102, 241, 0.1);
      border-left: 3px solid #818cf8;
      padding: 10px 14px;
      border-radius: 6px;
      margin-bottom: 14px;
      font-size: 13px;
      color: var(--text-main, #f8fafc);
    }
    .hook-label {
      font-weight: 700;
      color: #818cf8;
      margin-right: 6px;
    }
    .about-text-content {
      background: rgba(0,0,0,0.25);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 14px;
    }
    .about-pre {
      margin: 0;
      white-space: pre-wrap;
      font-family: inherit;
      font-size: 13px;
      line-height: 1.6;
      color: var(--text-main, #cbd5e1);
    }
    .cta-preview {
      font-size: 12px;
      color: var(--text-muted, #94a3b8);
      flex: 1;
    }
    .cta-preview strong { color: #818cf8; }

    /* EXPERIENCE UPGRADES */
    .experience-upgrades-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 24px;
    }
    .exp-upgrade-card {
      background: var(--bg-card, #1e293b);
      border: 1px solid var(--border-color, rgba(255,255,255,0.08));
      border-radius: 10px;
      padding: 20px;
    }
    .exp-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 14px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .exp-card-header h4 {
      margin: 0;
      font-size: 16px;
      color: var(--text-main, #f8fafc);
    }
    .impact-note {
      margin: 4px 0 0 0;
      font-size: 12px;
      color: var(--text-muted, #94a3b8);
    }
    .gaps-box {
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.25);
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 14px;
    }
    .gaps-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 600;
      color: #f87171;
      margin-bottom: 6px;
    }
    .badge-alert {
      background: #ef4444;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .gaps-list {
      margin: 0;
      padding-left: 18px;
      font-size: 12px;
      color: var(--text-main, #f8fafc);
      line-height: 1.5;
    }
    .optimized-bullets-box {
      background: rgba(0,0,0,0.2);
      border-radius: 8px;
      padding: 14px 16px;
    }
    .box-title {
      font-size: 12px;
      font-weight: 700;
      color: #818cf8;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .bullet-item {
      display: flex;
      gap: 8px;
      font-size: 13px;
      color: var(--text-main, #cbd5e1);
      line-height: 1.5;
      margin-bottom: 8px;
    }
    .bullet-item:last-child { margin-bottom: 0; }
    .bullet-dot {
      color: #6366f1;
      font-weight: 700;
    }

    /* SKILLS STRATEGY */
    .skills-strategy-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    @media (max-width: 768px) {
      .skills-strategy-grid { grid-template-columns: 1fr; }
    }
    .strategy-card {
      background: var(--bg-card, #1e293b);
      border: 1px solid var(--border-color, rgba(255,255,255,0.08));
      border-radius: 10px;
      padding: 20px;
    }
    .card-header-icon {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .card-header-icon .icon {
      font-size: 24px;
    }
    .card-header-icon h4 {
      margin: 0;
      font-size: 15px;
      color: var(--text-main, #f8fafc);
    }
    .card-header-icon p {
      margin: 2px 0 0 0;
      font-size: 12px;
      color: var(--text-muted, #94a3b8);
    }
    .pinned-skills-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .pinned-badge {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(99, 102, 241, 0.25);
      padding: 8px 12px;
      border-radius: 6px;
    }
    .pin-num {
      font-size: 12px;
      font-weight: 800;
      color: #818cf8;
    }
    .pin-text {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-main, #f8fafc);
    }
    .missing-skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .missing-badge {
      background: rgba(52, 211, 153, 0.12);
      border: 1px solid rgba(52, 211, 153, 0.3);
      color: #34d399;
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
    }
    .categorized-skills-section {
      background: var(--bg-card, #1e293b);
      border: 1px solid var(--border-color, rgba(255,255,255,0.08));
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .matrix-title {
      margin: 0 0 14px 0;
      font-size: 15px;
      color: var(--text-main, #f8fafc);
    }
    .matrix-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 14px;
    }
    .matrix-card {
      background: rgba(0,0,0,0.2);
      border: 1px solid var(--border-color, rgba(255,255,255,0.06));
      border-radius: 8px;
      padding: 12px;
    }
    .matrix-cat-title {
      font-size: 12px;
      font-weight: 700;
      color: #818cf8;
      margin-bottom: 8px;
    }
    .cat-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .cat-tag {
      background: rgba(255,255,255,0.06);
      color: var(--text-muted, #cbd5e1);
      font-size: 11px;
      padding: 3px 6px;
      border-radius: 4px;
    }

    /* EXPORT BAR */
    .export-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      border: 1px solid rgba(99, 102, 241, 0.3);
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.08));
    }
    .export-text h4 {
      margin: 0;
      font-size: 16px;
      color: var(--text-main, #f8fafc);
    }
    .export-text p {
      margin: 4px 0 0 0;
      font-size: 13px;
      color: var(--text-muted, #94a3b8);
    }
    .export-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    /* BUTTONS & COMMON */
    .btn {
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: none;
      transition: all 0.2s ease;
      text-decoration: none;
    }
    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }
    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: #fff;
    }
    .btn-primary:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    .btn-purple {
      background: linear-gradient(135deg, #8b5cf6, #d946ef);
      color: #fff;
      font-weight: 700;
    }
    .btn-purple:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    .btn-outline {
      background: transparent;
      border: 1px solid var(--border-color, rgba(255,255,255,0.15));
      color: var(--text-muted, #94a3b8);
    }
    .btn-outline:hover {
      background: rgba(255,255,255,0.06);
      color: #fff;
    }
    .btn-secondary-outline {
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #818cf8;
    }
    .btn-secondary-outline:hover {
      background: rgba(99, 102, 241, 0.2);
    }
    .btn-danger-outline {
      background: transparent;
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
    }
    .btn-danger-outline:hover {
      background: rgba(239, 68, 68, 0.1);
    }
    .btn-copy {
      background: rgba(255,255,255,0.08);
      color: var(--text-main, #f8fafc);
      font-size: 12px;
    }
    .btn-copy:hover {
      background: rgba(255,255,255,0.15);
    }
    .btn-copy.copied {
      background: #10b981;
      color: #fff;
    }
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .spinner-sm {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LinkedInOptimizerComponent implements OnInit {
  inputMode: 'text' | 'pdf' = 'text';
  rawInputText = '';
  isUrlDetected = false;
  selectedFileName = '';
  isPdfExtracting = false;

  currentProfile: LinkedInProfile | null = null;
  optimizationResult: LinkedInOptimizationResult | null = null;

  isParsing$ = this.linkedInService.isParsing$;
  isOptimizing$ = this.linkedInService.isOptimizing$;

  activeTab: 'headlines' | 'about' | 'experience' | 'skills' = 'headlines';
  copiedIndex: string | null = null;

  constructor(
    private linkedInService: LinkedInOptimizerService,
    private masterResumeService: MasterResumeService,
    private pdfExtractor: PdfTextExtractorService,
    private toastService: ToastService,
    private settingsService: SettingsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.linkedInService.activeProfile$.subscribe(p => this.currentProfile = p);
    this.linkedInService.activeResult$.subscribe(r => this.optimizationResult = r);
  }

  onTextChange(): void {
    const trimmed = this.rawInputText.trim().toLowerCase();
    this.isUrlDetected = trimmed.includes('linkedin.com/in/') || trimmed.startsWith('http://') || trimmed.startsWith('https://');
  }

  loadSample(): void {
    this.linkedInService.setSampleProfile();
    this.rawInputText = this.currentProfile?.rawText || '';
    this.isUrlDetected = false;
  }

  extractFromText(): void {
    if (!this.rawInputText.trim()) return;

    // Check if Groq API key is configured
    const settings = this.settingsService.getSettings();
    if (!settings.groq.apiKey) {
      this.toastService.warning('API Key Required', 'Please configure your Groq API key in Settings first.');
      this.router.navigate(['/settings']);
      return;
    }

    this.linkedInService.parseLinkedInProfile(this.rawInputText).subscribe({
      next: (profile) => {
        this.currentProfile = profile;
      },
      error: () => {}
    });
  }

  async onPdfSelected(event: any): Promise<void> {
    const file: File = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      this.toastService.error('Invalid File', 'Please upload a valid .pdf file.');
      return;
    }

    this.selectedFileName = file.name;
    this.isPdfExtracting = true;

    try {
      const extractedText = await this.pdfExtractor.extractTextFromPdf(file);
      this.isPdfExtracting = false;

      if (!extractedText.trim()) {
        this.toastService.error('Empty PDF', 'Could not extract text from the selected PDF.');
        return;
      }

      this.rawInputText = extractedText;
      this.inputMode = 'text';
      this.extractFromText();
    } catch (err: any) {
      this.isPdfExtracting = false;
      this.toastService.error('PDF Extraction Failed', err.message || 'Failed to read PDF file.');
    }
  }

  runOptimization(): void {
    if (!this.currentProfile) return;

    const masterResume = this.masterResumeService.getCurrentMasterResume();
    if (!masterResume || !masterResume.personalInfo) {
      this.toastService.warning('Master Resume Empty', 'Please ensure your Master Resume has data before optimizing.');
      return;
    }

    this.linkedInService.optimizeLinkedIn(this.currentProfile, masterResume).subscribe({
      next: (result) => {
        this.optimizationResult = result;
      },
      error: () => {}
    });
  }

  mergeToMasterResume(): void {
    if (!this.currentProfile) return;
    const current = this.masterResumeService.getCurrentMasterResume();
    const merged = this.linkedInService.mergeLinkedInIntoMasterResume(this.currentProfile, current);
    this.masterResumeService.saveMasterResume(merged);
    this.toastService.success('Synced to Master Resume', 'Imported new details from LinkedIn into Master Resume.');
  }

  copyToClipboard(text: string, id: string): void {
    if (!navigator.clipboard) {
      this.toastService.info('Copy', 'Clipboard not available in this browser environment.');
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      this.copiedIndex = id;
      this.toastService.success('Copied!', 'Content copied to clipboard.');
      setTimeout(() => {
        if (this.copiedIndex === id) this.copiedIndex = null;
      }, 2500);
    });
  }

  copyFullOptimization(result: LinkedInOptimizationResult): void {
    let report = `# LinkedIn Profile Optimization Report\n\n`;
    report += `Generated with ResumeForge AI on ${new Date().toLocaleDateString()}\n\n`;
    report += `## Profile Audit Score: ${result.audit.overallScore}/100\n`;
    report += `Assessment: ${result.audit.summaryAssessment}\n\n`;
    report += `### Action Items:\n`;
    result.audit.keyActionItems.forEach(item => report += `- ${item}\n`);
    report += `\n---\n\n`;

    report += `## 🎯 Recommended Headlines\n\n`;
    result.headlineOptions.forEach(h => {
      report += `### ${h.title} (${h.charCount}/220 chars)\n`;
      report += `\`${h.headline}\`\n`;
      report += `*${h.explanation}*\n\n`;
    });

    report += `\n---\n\n`;
    report += `## 📝 Recommended About Section\n\n`;
    result.aboutOptions.forEach(a => {
      report += `### ${a.title}\n\n`;
      report += `${a.aboutText}\n\n`;
    });

    report += `\n---\n\n`;
    report += `## 💼 Experience Upgrades\n\n`;
    result.experienceOptimizations.forEach(exp => {
      report += `### ${exp.role} at ${exp.company}\n`;
      if (exp.masterResumeGapsFound.length) {
        report += `**Master Resume Gaps Found:**\n`;
        exp.masterResumeGapsFound.forEach(g => report += `- ${g}\n`);
      }
      report += `\n**Optimized Bullets:**\n`;
      exp.optimizedBullets.forEach(b => report += `- ${b}\n`);
      report += `\n`;
    });

    report += `\n---\n\n`;
    report += `## ⚡ Skills Strategy\n\n`;
    report += `### Top 5 Pinned Skills:\n`;
    if (result.skillsOptimization && Array.isArray(result.skillsOptimization.top5PinnedSkills)) {
      result.skillsOptimization.top5PinnedSkills.forEach((s: string, idx: number) => report += `${idx + 1}. ${s}\n`);
    }
    report += `\n### Missing High-Value Skills (from Master Resume):\n`;
    if (result.skillsOptimization && Array.isArray(result.skillsOptimization.missingHighValueSkills)) {
      result.skillsOptimization.missingHighValueSkills.forEach((s: string) => report += `- ${s}\n`);
    }

    this.copyToClipboard(report, 'all');
  }

  downloadMarkdownReport(result: LinkedInOptimizationResult): void {
    let report = `# LinkedIn Profile Optimization Report\n\n`;
    report += `Candidate: ${this.currentProfile?.fullName || 'Candidate'}\n`;
    report += `Generated: ${new Date().toLocaleString()}\n\n`;
    report += `## 1. Profile Audit Score: ${result.audit.overallScore}/100\n`;
    report += `${result.audit.summaryAssessment}\n\n`;
    
    report += `## 2. Headline Options (220 max chars)\n\n`;
    result.headlineOptions.forEach(h => {
      report += `### ${h.title}\n`;
      report += `${h.headline}\n\n`;
    });

    report += `## 3. Story-Driven About Section\n\n`;
    result.aboutOptions.forEach(a => {
      report += `### ${a.title}\n\n`;
      report += `${a.aboutText}\n\n`;
    });

    report += `## 4. Experience Bullets\n\n`;
    result.experienceOptimizations.forEach(e => {
      report += `### ${e.role} - ${e.company}\n`;
      e.optimizedBullets.forEach(b => report += `- ${b}\n`);
      report += `\n`;
    });

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LinkedIn_Optimization_${(this.currentProfile?.fullName || 'Profile').replace(/\\s+/g, '_')}.md`;
    a.click();
    window.URL.revokeObjectURL(url);
    this.toastService.info('Exported', 'LinkedIn optimization report downloaded.');
  }

  resetAll(): void {
    this.linkedInService.clear();
    this.rawInputText = '';
    this.selectedFileName = '';
    this.isUrlDetected = false;
    this.currentProfile = null;
    this.optimizationResult = null;
    this.toastService.info('Reset', 'Cleared LinkedIn profile data.');
  }
}
