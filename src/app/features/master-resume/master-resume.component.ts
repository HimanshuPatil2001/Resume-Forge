import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MasterResumeService } from '../../core/services/master-resume.service';
import { PdfTextExtractorService } from '../../core/services/pdf-text-extractor.service';
import { SettingsService } from '../../core/services/settings.service';
import { ToastService } from '../../core/services/toast.service';
import { ExternalLinkFetcherService, DetectedLinks } from '../../core/services/external-link-fetcher.service';
import { MasterResume, StoredMasterResume } from '../../core/models/master-resume.model';

@Component({
  selector: 'app-master-resume',
  template: `
    <div class="page-container">
      
      <!-- TOP ACTION BAR -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Master Resume Database</h1>
          <p class="page-subtitle">Your complete, verified career history. The AI generator grounds all resumes exclusively on this data.</p>
        </div>

        <div class="action-buttons">
          <button class="btn btn-purple" (click)="showAiParseBox = !showAiParseBox">
            ✨ AI Auto-Fill (PDF / Text)
          </button>

          <button class="btn btn-outline" (click)="onManualCheckLinks()" title="Scan and fetch projects/skills from LinkedIn, GitHub, or Portfolio links">
            🔗 Fetch Profile Links
          </button>

          <button class="btn btn-outline" (click)="onExportJson()">
            📥 Export JSON
          </button>
          
          <label class="btn btn-outline file-label">
            📤 Import JSON
            <input type="file" (change)="onFileSelected($event)" accept=".json" style="display: none;" />
          </label>

          <button class="btn btn-danger-outline" (click)="openResetConfirm()">
            🔄 Reset Sample Data
          </button>

          <button class="btn btn-primary" (click)="saveMasterResume()">
            💾 Save Master Resume
          </button>
        </div>
      </div>

      <!-- SAVED MASTER RESUME LIBRARY BAR -->
      <div class="card-section library-bar">
        <div class="library-info">
          <span class="library-badge-icon">📁</span>
          <div>
            <div class="library-label">Active Stored Master Profile</div>
            <div class="library-title-row">
              <strong class="profile-name">{{ getActiveProfileName() }}</strong>
              <span class="default-badge" *ngIf="masterResumeService.getActiveProfile()?.isDefault">Primary Default</span>
            </div>
          </div>
        </div>

        <div class="library-actions">
          <button type="button" class="btn btn-outline btn-sm" (click)="loadFromFolderAsset()" title="Load default JSON file from /assets/master-resumes/">
            ⚡ Load from Folder Asset
          </button>
          
          <button type="button" class="btn btn-secondary btn-sm" (click)="openSaveProfileModal()">
            💾 Save Profile to Library
          </button>

          <button type="button" class="btn btn-purple btn-sm" (click)="showLibraryModal = true">
            📚 Manage Profiles ({{ (storedProfiles$ | async)?.length || 0 }})
          </button>
        </div>
      </div>

      <!-- AI PARSE / PDF UPLOAD BOX -->
      <div class="card-section ai-parse-card" *ngIf="showAiParseBox">
        <div class="parse-card-header">
          <div class="header-title">
            <span class="sparkle-icon">✨</span>
            <div>
              <h3>AI Auto-Fill Master Resume</h3>
              <p>Upload a PDF resume or paste raw text. Groq AI will extract and merge your complete history into the editable form below.</p>
            </div>
          </div>
          <button class="btn-close-box" (click)="showAiParseBox = false">✕</button>
        </div>

        <!-- IMPORT MODE MERGE VS OVERWRITE SELECTOR -->
        <div class="import-mode-bar">
          <span class="mode-label">Accumulation Mode:</span>
          <button type="button" class="mode-pill" [class.active]="autoFillMode === 'merge'" (click)="autoFillMode = 'merge'">
            🔀 Smart Merge (Preserve & Accumulate History)
          </button>
          <button type="button" class="mode-pill" [class.active]="autoFillMode === 'replace'" (click)="autoFillMode = 'replace'">
            🔄 Overwrite Entire Form
          </button>
        </div>

        <div class="parse-tabs">
          <button class="tab-pill" [class.active]="parseMode === 'pdf'" (click)="parseMode = 'pdf'">
            📄 Upload PDF File
          </button>
          <button class="tab-pill" [class.active]="parseMode === 'text'" (click)="parseMode = 'text'">
            ✏️ Paste Raw Text
          </button>
        </div>

        <!-- MODE 1: PDF UPLOAD -->
        <div class="parse-tab-body" *ngIf="parseMode === 'pdf'">
          <div class="file-drop-zone">
            <span class="upload-icon">📁</span>
            <p>Select your PDF Resume file to auto-extract text and parse with Groq AI</p>
            <input type="file" (change)="onPdfFileSelected($event)" accept=".pdf" class="pdf-input" id="pdfFileInput" />
            <label for="pdfFileInput" class="btn btn-primary btn-sm">
              Choose PDF File
            </label>
            <span class="selected-filename" *ngIf="selectedPdfFileName">{{ selectedPdfFileName }}</span>
          </div>
        </div>

        <!-- MODE 2: RAW TEXT PASTE -->
        <div class="parse-tab-body" *ngIf="parseMode === 'text'">
          <div class="form-group">
            <label>Raw Resume Content (copied from PDF/Word)</label>
            <textarea 
              [(ngModel)]="rawResumeText" 
              rows="6" 
              placeholder="Paste all text from your existing PDF or resume document here..."
              class="raw-text-area"
            ></textarea>
          </div>
          <div class="parse-action-row">
            <button 
              class="btn btn-primary" 
              [disabled]="!rawResumeText.trim() || isParsing" 
              (click)="parsePastedText()"
            >
              {{ isParsing ? 'Parsing with Groq AI...' : '✨ Parse Text & Fill Form' }}
            </button>
          </div>
        </div>

        <!-- PARSING STATUS SPINNER -->
        <div class="parsing-status-overlay" *ngIf="isParsing">
          <div class="spinner-sm"></div>
          <span>{{ parsingStatusMessage }}</span>
        </div>
      </div>

      <!-- AUTO-FILL REVIEW BANNER -->
      <div class="review-banner" *ngIf="isAutoFilled">
        <span class="banner-icon">💡</span>
        <div class="banner-text">
          <strong>Review Master Resume Data:</strong> New career history entries were accumulated into the form below. Please review experience bullets, dates, and tech stack, then click <strong>Save Master Resume</strong> when ready.
        </div>
        <button class="btn btn-sm btn-primary" (click)="saveMasterResume()">
          💾 Save Master Resume
        </button>
      </div>

      <!-- ENRICHED REVIEW BANNER -->
      <div class="review-banner enriched-banner" *ngIf="isEnrichedBannerVisible">
        <span class="banner-icon">🚀</span>
        <div class="banner-text">
          <strong>External Links Enriched:</strong> Added GitHub repository projects and technical skills to your form. Review the new entries below, then click <strong>Save Master Resume</strong> to update your database.
        </div>
        <button class="btn btn-sm btn-primary" (click)="saveMasterResume(); isEnrichedBannerVisible = false;">
          💾 Save Master Resume
        </button>
      </div>

      <!-- MASTER RESUME FORM -->
      <form [formGroup]="resumeForm" (ngSubmit)="saveMasterResume()" class="form-container">
        
        <!-- PERSONAL INFORMATION -->
        <div class="card-section" formGroupName="personalInfo">
          <div class="section-header-flex">
            <h3 class="section-heading">👤 Personal Information</h3>
            <button type="button" class="btn btn-sm btn-outline" (click)="onManualCheckLinks()">
              🔗 Scan External Links
            </button>
          </div>
          
          <div class="form-grid col-2">
            <div class="form-group">
              <label>Full Name *</label>
              <input type="text" formControlName="fullName" placeholder="John Developer" />
            </div>

            <div class="form-group">
              <label>Professional Title *</label>
              <input type="text" formControlName="professionalTitle" placeholder="Senior Full Stack & .NET Developer" />
            </div>

            <div class="form-group">
              <label>Email Address *</label>
              <input type="email" formControlName="email" placeholder="john.developer@example.com" />
            </div>

            <div class="form-group">
              <label>Phone Number</label>
              <input type="text" formControlName="phone" placeholder="+1 (555) 234-5678" />
            </div>

            <div class="form-group">
              <label>Location (City, State / Country)</label>
              <input type="text" formControlName="location" placeholder="Austin, TX" />
            </div>

            <div class="form-group">
              <label>LinkedIn URL</label>
              <input type="text" formControlName="linkedin" placeholder="https://linkedin.com/in/username" />
            </div>

            <div class="form-group">
              <label>GitHub URL</label>
              <input type="text" formControlName="github" placeholder="https://github.com/username" />
            </div>

            <div class="form-group col-span-2">
              <label>Portfolio / Personal Website</label>
              <input type="text" formControlName="portfolio" placeholder="https://johndeveloper.dev" />
            </div>
          </div>

          <div class="form-group full-width">
            <label>Master Executive Summary</label>
            <textarea formControlName="summary" rows="4" placeholder="Comprehensive summary of your career experience, core stack, and major domain strengths..."></textarea>
          </div>
        </div>

        <!-- PROFESSIONAL EXPERIENCE ARRAY -->
        <div class="card-section">
          <div class="section-header-flex">
            <h3 class="section-heading">💼 Professional Experience</h3>
            <button type="button" class="btn btn-sm btn-secondary" (click)="addExperience()">+ Add Experience</button>
          </div>

          <div formArrayName="professionalExperience" class="array-container">
            <div *ngFor="let expGroup of experienceControls.controls; let i = index" [formGroupName]="i" class="array-card">
              <div class="array-card-header">
                <h4>Entry #{{ i + 1 }}: {{ expGroup.get('company')?.value || 'New Position' }}</h4>
                <button type="button" class="btn-remove" (click)="removeExperience(i)">Remove</button>
              </div>

              <div class="form-grid col-3">
                <div class="form-group">
                  <label>Company Name *</label>
                  <input type="text" formControlName="company" />
                </div>
                <div class="form-group">
                  <label>Job Title / Role *</label>
                  <input type="text" formControlName="role" />
                </div>
                <div class="form-group">
                  <label>Location</label>
                  <input type="text" formControlName="location" />
                </div>
                <div class="form-group">
                  <label>Start Date</label>
                  <input type="text" formControlName="startDate" placeholder="YYYY-MM or Mon YYYY" />
                </div>
                <div class="form-group">
                  <label>End Date</label>
                  <input type="text" formControlName="endDate" placeholder="YYYY-MM or Present" />
                </div>
                <div class="form-group">
                  <label>Technologies Used (comma-separated)</label>
                  <input type="text" [value]="getCommaSeparated(expGroup.get('technologies')?.value)" (input)="setCommaSeparated(expGroup, 'technologies', $event)" />
                </div>
              </div>

              <div class="form-group full-width">
                <label>Responsibilities & Bullet Points (one per line)</label>
                <textarea [value]="getLinesText(expGroup.get('responsibilities')?.value)" (input)="setLinesText(expGroup, 'responsibilities', $event)" rows="4"></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- PROJECTS ARRAY -->
        <div class="card-section">
          <div class="section-header-flex">
            <h3 class="section-heading">🚀 Key Projects</h3>
            <button type="button" class="btn btn-sm btn-secondary" (click)="addProject()">+ Add Project</button>
          </div>

          <div formArrayName="projects" class="array-container">
            <div *ngFor="let projGroup of projectControls.controls; let i = index" [formGroupName]="i" class="array-card">
              <div class="array-card-header">
                <h4>Project #{{ i + 1 }}: {{ projGroup.get('name')?.value || 'New Project' }}</h4>
                <button type="button" class="btn-remove" (click)="removeProject(i)">Remove</button>
              </div>

              <div class="form-grid col-3">
                <div class="form-group">
                  <label>Project Name *</label>
                  <input type="text" formControlName="name" />
                </div>
                <div class="form-group">
                  <label>Your Role</label>
                  <input type="text" formControlName="role" />
                </div>
                <div class="form-group">
                  <label>Technologies Used (comma-separated)</label>
                  <input type="text" [value]="getCommaSeparated(projGroup.get('technologies')?.value)" (input)="setCommaSeparated(projGroup, 'technologies', $event)" />
                </div>
              </div>

              <div class="form-group full-width">
                <label>Project Description</label>
                <textarea formControlName="description" rows="2"></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- TECHNICAL SKILLS CATEGORIES -->
        <div class="card-section" formGroupName="skills">
          <h3 class="section-heading">🛠️ Categorized Skills Matrix</h3>

          <div class="form-grid col-2">
            <div class="form-group">
              <label>Programming Languages</label>
              <input type="text" [value]="getCommaSeparated(skillsGroup.get('programmingLanguages')?.value)" (input)="setSkillsCategory('programmingLanguages', $event)" placeholder="C#, TypeScript, JavaScript, SQL..." />
            </div>

            <div class="form-group">
              <label>Frameworks & Libraries</label>
              <input type="text" [value]="getCommaSeparated(skillsGroup.get('frameworks')?.value)" (input)="setSkillsCategory('frameworks', $event)" placeholder=".NET Core, ASP.NET Core, Angular..." />
            </div>

            <div class="form-group">
              <label>Frontend Development</label>
              <input type="text" [value]="getCommaSeparated(skillsGroup.get('frontend')?.value)" (input)="setSkillsCategory('frontend', $event)" placeholder="Angular 14+, RxJS, HTML5, SCSS..." />
            </div>

            <div class="form-group">
              <label>Backend & APIs</label>
              <input type="text" [value]="getCommaSeparated(skillsGroup.get('backend')?.value)" (input)="setSkillsCategory('backend', $event)" placeholder="C#, REST APIs, Entity Framework..." />
            </div>

            <div class="form-group">
              <label>Databases & Storage</label>
              <input type="text" [value]="getCommaSeparated(skillsGroup.get('databases')?.value)" (input)="setSkillsCategory('databases', $event)" placeholder="SQL Server, Redis..." />
            </div>

            <div class="form-group">
              <label>Cloud & Hosting</label>
              <input type="text" [value]="getCommaSeparated(skillsGroup.get('cloud')?.value)" (input)="setSkillsCategory('cloud', $event)" placeholder="Azure App Services, IIS..." />
            </div>

            <div class="form-group">
              <label>DevOps & Version Control</label>
              <input type="text" [value]="getCommaSeparated(skillsGroup.get('devops')?.value)" (input)="setSkillsCategory('devops', $event)" placeholder="Git, GitHub, Docker..." />
            </div>

            <div class="form-group">
              <label>AI & Machine Learning</label>
              <input type="text" [value]="getCommaSeparated(skillsGroup.get('aiMl')?.value)" (input)="setSkillsCategory('aiMl', $event)" placeholder="Groq API, OpenAI..." />
            </div>

            <div class="form-group col-span-2">
              <label>Tools & IDEs</label>
              <input type="text" [value]="getCommaSeparated(skillsGroup.get('tools')?.value)" (input)="setSkillsCategory('tools', $event)" placeholder="Visual Studio, VS Code, Postman, SSMS..." />
            </div>
          </div>
        </div>

        <!-- EDUCATION ARRAY -->
        <div class="card-section">
          <div class="section-header-flex">
            <h3 class="section-heading">🎓 Education</h3>
            <button type="button" class="btn btn-sm btn-secondary" (click)="addEducation()">+ Add Education</button>
          </div>

          <div formArrayName="education" class="array-container">
            <div *ngFor="let eduGroup of educationControls.controls; let i = index" [formGroupName]="i" class="array-card">
              <div class="array-card-header">
                <h4>Degree #{{ i + 1 }}</h4>
                <button type="button" class="btn-remove" (click)="removeEducation(i)">Remove</button>
              </div>

              <div class="form-grid col-3">
                <div class="form-group">
                  <label>Degree / Qualification *</label>
                  <input type="text" formControlName="degree" />
                </div>
                <div class="form-group">
                  <label>Institution / University *</label>
                  <input type="text" formControlName="institution" />
                </div>
                <div class="form-group">
                  <label>Location</label>
                  <input type="text" formControlName="location" />
                </div>
                <div class="form-group">
                  <label>Start Date</label>
                  <input type="text" formControlName="startDate" />
                </div>
                <div class="form-group">
                  <label>End Date</label>
                  <input type="text" formControlName="endDate" />
                </div>
                <div class="form-group">
                  <label>Grade / GPA</label>
                  <input type="text" formControlName="grade" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CERTIFICATIONS ARRAY -->
        <div class="card-section">
          <div class="section-header-flex">
            <h3 class="section-heading">📜 Certifications</h3>
            <button type="button" class="btn btn-sm btn-secondary" (click)="addCertification()">+ Add Certification</button>
          </div>

          <div formArrayName="certifications" class="array-container">
            <div *ngFor="let certGroup of certificationControls.controls; let i = index" [formGroupName]="i" class="array-card">
              <div class="array-card-header">
                <h4>Certification #{{ i + 1 }}</h4>
                <button type="button" class="btn-remove" (click)="removeCertification(i)">Remove</button>
              </div>

              <div class="form-grid col-3">
                <div class="form-group">
                  <label>Certification Name *</label>
                  <input type="text" formControlName="name" />
                </div>
                <div class="form-group">
                  <label>Issuer / Provider *</label>
                  <input type="text" formControlName="issuer" />
                </div>
                <div class="form-group">
                  <label>Date Received</label>
                  <input type="text" formControlName="date" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- BOTTOM SAVE BUTTON -->
        <div class="bottom-bar">
          <button type="submit" class="btn btn-primary btn-lg">
            💾 Save Master Resume Changes
          </button>
        </div>

      </form>

      <!-- CONFIRMATION MODAL -->
      <app-confirmation-dialog
        [isOpen]="isResetModalOpen"
        title="Reset Master Resume?"
        message="This will replace your current Master Resume data with default sample data. Are you sure you want to proceed?"
        confirmText="Reset to Sample Data"
        type="danger"
        (confirm)="confirmReset()"
        (cancel)="isResetModalOpen = false"
      ></app-confirmation-dialog>

      <!-- SAVE PROFILE MODAL -->
      <div class="modal-backdrop" *ngIf="showSaveProfileModal">
        <div class="modal-content card-section">
          <div class="modal-header">
            <h3>💾 Save Master Resume Profile</h3>
            <button class="btn-close-box" (click)="showSaveProfileModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group full-width">
              <label>Profile Name *</label>
              <input type="text" [(ngModel)]="newProfileName" placeholder="e.g. Senior Developer Master 2026" class="form-control" />
            </div>
            <div class="form-group full-width">
              <label>Description / Notes (Optional)</label>
              <input type="text" [(ngModel)]="newProfileDesc" placeholder="e.g. Tailored for US Remote roles" class="form-control" />
            </div>
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" [(ngModel)]="newProfileMakeDefault" />
                Set as Primary Default Profile (Auto-loaded on start)
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" (click)="showSaveProfileModal = false">Cancel</button>
            <button type="button" class="btn btn-primary" (click)="confirmSaveProfile()">Save Profile</button>
          </div>
        </div>
      </div>

      <!-- MANAGE LIBRARY MODAL -->
      <div class="modal-backdrop" *ngIf="showLibraryModal">
        <div class="modal-content modal-lg card-section">
          <div class="modal-header">
            <h3>📚 Saved Master Resumes Library</h3>
            <button class="btn-close-box" (click)="showLibraryModal = false">✕</button>
          </div>
          <div class="modal-body">
            <p class="modal-sub">Stored master profiles survive VPN drops and browser session resets.</p>
            
            <div class="profiles-grid" *ngIf="(storedProfiles$ | async) as profiles">
              <div class="profile-card" *ngFor="let p of profiles" [class.active-card]="p.id === (activeProfileId$ | async)">
                <div class="profile-card-header">
                  <div class="profile-title-block">
                    <span class="profile-icon">📄</span>
                    <h4>{{ p.name }}</h4>
                  </div>
                  <div>
                    <span class="badge-default" *ngIf="p.isDefault">Primary Default</span>
                    <span class="badge-active" *ngIf="p.id === (activeProfileId$ | async)">Active Now</span>
                  </div>
                </div>

                <p class="profile-desc" *ngIf="p.description">{{ p.description }}</p>
                <div class="profile-meta">
                  <span>Name: {{ p.data.personalInfo.fullName || 'N/A' }}</span> • 
                  <span>Updated: {{ p.updatedAt | date:'shortDate' }}</span>
                </div>

                <div class="profile-actions">
                  <button type="button" class="btn btn-primary btn-sm" [disabled]="p.id === (activeProfileId$ | async)" (click)="selectProfile(p.id)">
                    {{ p.id === (activeProfileId$ | async) ? 'Active' : '⚡ Load Profile' }}
                  </button>
                  <button type="button" class="btn btn-outline btn-sm" *ngIf="!p.isDefault" (click)="setDefaultProfile(p.id)">
                    ⭐ Set Default
                  </button>
                  <button type="button" class="btn btn-danger-outline btn-sm" *ngIf="profiles.length > 1" (click)="deleteProfile(p.id)">
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" (click)="showLibraryModal = false">Close</button>
          </div>
        </div>
      </div>

      <!-- FETCH EXTERNAL LINKS PROMPT MODAL -->
      <div class="modal-backdrop" *ngIf="showFetchLinksModal">
        <div class="modal-content card-section">
          <div class="modal-header">
            <h3>🔗 External Profiles Detected!</h3>
            <button class="btn-close-box" (click)="showFetchLinksModal = false">✕</button>
          </div>
          <div class="modal-body">
            <p class="modal-sub">We found the following external profile links in your resume data:</p>
            
            <div class="detected-links-list">
              <div class="detected-link-item" *ngIf="detectedLinks?.github">
                <span class="link-icon">🐙</span>
                <div>
                  <strong>GitHub Profile / Repos:</strong>
                  <a [href]="detectedLinks?.github" target="_blank" class="link-url">{{ detectedLinks?.github }}</a>
                </div>
              </div>

              <div class="detected-link-item" *ngIf="detectedLinks?.linkedin">
                <span class="link-icon">💼</span>
                <div>
                  <strong>LinkedIn Profile:</strong>
                  <a [href]="detectedLinks?.linkedin" target="_blank" class="link-url">{{ detectedLinks?.linkedin }}</a>
                </div>
              </div>

              <div class="detected-link-item" *ngIf="detectedLinks?.portfolio">
                <span class="link-icon">🌐</span>
                <div>
                  <strong>Portfolio Website:</strong>
                  <a [href]="detectedLinks?.portfolio" target="_blank" class="link-url">{{ detectedLinks?.portfolio }}</a>
                </div>
              </div>
            </div>

            <p class="modal-prompt-text">
              Would you like to fetch and enrich your Master Resume with top projects, repository details, and technical skills from these links?
            </p>

            <div class="fetching-indicator" *ngIf="isFetchingExternalData">
              <div class="spinner-sm"></div>
              <span>Fetching repository projects & profile skills...</span>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" [disabled]="isFetchingExternalData" (click)="showFetchLinksModal = false">
              No, Skip for Now
            </button>
            <button type="button" class="btn btn-purple" [disabled]="isFetchingExternalData" (click)="fetchExternalLinkData()">
              ✨ Yes, Fetch Data & Enrich Resume
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .page-container {
      padding: 28px;
      max-width: 1100px;
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
      flex-wrap: wrap;
      gap: 16px;
    }
    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: stretch;
        gap: 14px;
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
    .action-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    @media (max-width: 768px) {
      .action-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        width: 100%;
      }
      .action-buttons .btn {
        width: 100%;
        justify-content: center;
        text-align: center;
        padding: 10px 8px;
        box-sizing: border-box;
      }
    }
    @media (max-width: 480px) {
      .action-buttons {
        grid-template-columns: 1fr;
      }
    }
    .btn {
      padding: 9px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-primary { background: #6366f1; color: white; }
    .btn-primary:hover { background: #4f46e5; }
    .btn-purple { background: linear-gradient(135deg, #a855f7, #6366f1); color: white; }
    .btn-purple:hover { opacity: 0.9; }
    .btn-outline { background: var(--bg-card, #1e293b); border: 1px solid var(--border-color, rgba(255,255,255,0.15)); color: var(--text-main, #f8fafc); }
    .btn-outline:hover { background: rgba(255,255,255,0.08); }
    .btn-danger-outline { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; }
    .btn-danger-outline:hover { background: rgba(239, 68, 68, 0.2); }
    .btn-secondary { background: #334155; color: white; }
    .btn-secondary:hover { background: #475569; }
    .btn-sm { padding: 6px 12px; font-size: 12px; }
    .btn-lg { padding: 12px 28px; font-size: 15px; }
    .file-label { cursor: pointer; }

    /* IMPORT ACCUMULATION MODE BAR */
    .import-mode-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      background: rgba(0, 0, 0, 0.3);
      padding: 10px 14px;
      border-radius: 10px;
      flex-wrap: wrap;
    }
    .mode-label {
      font-size: 12px;
      font-weight: 700;
      color: #c084fc;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .mode-pill {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #94a3b8;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .mode-pill.active {
      background: #6366f1;
      color: white;
      border-color: #6366f1;
    }

    /* LIBRARY BAR STYLES */
    .library-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-card, #1e293b);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .library-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .library-badge-icon {
      font-size: 24px;
    }
    .library-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted, #94a3b8);
      font-weight: 600;
    }
    .library-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .profile-name {
      font-size: 16px;
      color: var(--text-main, #f8fafc);
    }
    .default-badge {
      background: rgba(99, 102, 241, 0.2);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.4);
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 600;
    }
    .library-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    /* MODAL STYLES */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
    }
    .modal-content {
      background: var(--bg-card, #1e293b);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
      border-radius: 16px;
      width: 100%;
      max-width: 520px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      padding: 24px;
    }
    .modal-lg {
      max-width: 750px;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      padding-bottom: 12px;
    }
    .modal-header h3 {
      margin: 0;
      font-size: 18px;
      color: var(--text-main, #f8fafc);
    }
    .modal-sub {
      font-size: 13px;
      color: var(--text-muted, #94a3b8);
      margin-top: 0;
      margin-bottom: 16px;
    }
    .modal-body {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
      padding-top: 14px;
      border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    }
    .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      cursor: pointer;
      color: var(--text-main, #f8fafc);
    }
    .form-control {
      width: 100%;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 10px 14px;
      color: white;
      font-size: 14px;
      box-sizing: border-box;
    }

    /* DETECTED LINKS STYLES */
    .detected-links-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      border-radius: 10px;
      padding: 12px 14px;
    }
    .detected-link-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
    }
    .link-icon { font-size: 18px; }
    .link-url {
      color: #818cf8;
      word-break: break-all;
      text-decoration: none;
    }
    .link-url:hover { text-decoration: underline; }
    .modal-prompt-text {
      font-size: 14px;
      color: var(--text-main, #f8fafc);
      margin: 12px 0 4px 0;
      line-height: 1.5;
    }
    .fetching-indicator {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #c084fc;
      font-size: 13px;
      margin-top: 10px;
    }
    .enriched-banner {
      background: rgba(168, 85, 247, 0.15);
      border-color: rgba(168, 85, 247, 0.4);
    }

    /* PROFILES GRID STYLES */
    .profiles-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .profile-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      border-radius: 10px;
      padding: 14px 16px;
      transition: all 0.2s ease;
    }
    .profile-card.active-card {
      border-color: #6366f1;
      background: rgba(99, 102, 241, 0.08);
    }
    .profile-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .profile-title-block {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .profile-title-block h4 {
      margin: 0;
      font-size: 15px;
      color: var(--text-main, #f8fafc);
    }
    .badge-default {
      background: rgba(168, 85, 247, 0.2);
      color: #c084fc;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: 600;
      margin-right: 6px;
    }
    .badge-active {
      background: rgba(34, 197, 94, 0.2);
      color: #4ade80;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: 600;
    }
    .profile-desc {
      font-size: 13px;
      color: var(--text-muted, #94a3b8);
      margin: 0 0 6px 0;
    }
    .profile-meta {
      font-size: 12px;
      color: var(--text-muted, #64748b);
      margin-bottom: 12px;
    }
    .profile-actions {
      display: flex;
      gap: 8px;
    }

    /* AI PARSE CARD STYLES */
    .ai-parse-card {
      background: linear-gradient(135deg, rgba(30, 27, 75, 0.95), rgba(15, 23, 42, 0.95));
      border: 1px solid rgba(168, 85, 247, 0.4);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
      position: relative;
    }
    @media (max-width: 768px) {
      .ai-parse-card {
        padding: 16px 12px;
        border-radius: 12px;
      }
    }
    .parse-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 18px;
    }
    .header-title {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .sparkle-icon { font-size: 24px; }
    .header-title h3 { margin: 0 0 2px 0; font-size: 18px; color: #ffffff; }
    .header-title p { margin: 0; font-size: 13px; color: #c084fc; }
    .btn-close-box { background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; }
    .parse-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 16px;
    }
    @media (max-width: 600px) {
      .parse-tabs {
        flex-direction: column;
        gap: 6px;
      }
    }
    .tab-pill {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      color: #94a3b8;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .tab-pill.active {
      background: #a855f7;
      color: white;
      border-color: #a855f7;
    }
    .file-drop-zone {
      border: 2px dashed rgba(168, 85, 247, 0.4);
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      background: rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .upload-icon { font-size: 32px; }
    .file-drop-zone p { margin: 0; font-size: 14px; color: #cbd5e1; }
    .pdf-input { display: none; }
    .selected-filename { font-size: 13px; color: #a855f7; font-weight: 600; }
    .raw-text-area {
      width: 100%;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #f8fafc;
      padding: 12px;
      font-family: inherit;
      font-size: 13px;
      resize: vertical;
      box-sizing: border-box;
    }
    .parse-action-row {
      display: flex;
      justify-content: flex-end;
      margin-top: 12px;
    }
    .parsing-status-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.85);
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #c084fc;
      font-weight: 600;
      font-size: 14px;
    }
    .spinner-sm {
      width: 24px;
      height: 24px;
      border: 3px solid rgba(168, 85, 247, 0.3);
      border-top-color: #a855f7;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .review-banner {
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 12px;
      padding: 14px 20px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .banner-icon { font-size: 20px; }
    .banner-text { font-size: 13px; color: #4ade80; flex: 1; }

    /* CARD SECTION STYLES */
    .card-section {
      background: var(--bg-card, #1e293b);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
    }
    @media (max-width: 768px) {
      .card-section {
        padding: 16px 12px;
        border-radius: 12px;
      }
    }
    .section-heading {
      font-size: 17px;
      font-weight: 700;
      margin: 0 0 16px 0;
      color: var(--text-main, #f8fafc);
    }
    .section-header-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .form-grid {
      display: grid;
      gap: 16px;
    }
    .col-2 { grid-template-columns: repeat(2, 1fr); }
    .col-3 { grid-template-columns: repeat(3, 1fr); }
    .col-span-2 { grid-column: span 2; }
    @media (max-width: 768px) {
      .col-2, .col-3 { grid-template-columns: 1fr; }
      .col-span-2 { grid-column: span 1; }
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group.full-width {
      grid-column: 1 / -1;
      margin-top: 6px;
    }
    .form-group label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted, #94a3b8);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .form-group input, .form-group textarea {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
      border-radius: 8px;
      padding: 10px 14px;
      color: var(--text-main, #f8fafc);
      font-size: 13.5px;
      font-family: inherit;
      box-sizing: border-box;
      width: 100%;
    }
    .form-group input:focus, .form-group textarea:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }

    .array-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .array-card {
      background: rgba(15, 23, 42, 0.4);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
      border-radius: 12px;
      padding: 16px;
    }
    .array-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      padding-bottom: 8px;
    }
    .array-card-header h4 {
      margin: 0;
      font-size: 14px;
      color: #6366f1;
      font-weight: 600;
    }
    .btn-remove {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: none;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
    }
    .btn-remove:hover { background: rgba(239, 68, 68, 0.3); }

    .bottom-bar {
      display: flex;
      justify-content: flex-end;
      margin-top: 12px;
    }
    @media (max-width: 768px) {
      .bottom-bar {
        justify-content: stretch;
      }
      .bottom-bar button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class MasterResumeComponent implements OnInit {
  resumeForm!: FormGroup;
  isResetModalOpen = false;

  // AI Parse state
  showAiParseBox = false;
  parseMode: 'pdf' | 'text' = 'pdf';
  autoFillMode: 'merge' | 'replace' = 'merge';
  rawResumeText = '';
  selectedPdfFileName = '';
  isParsing = false;
  parsingStatusMessage = '';
  isAutoFilled = false;

  // Saved Master Resume Library state
  storedProfiles$ = this.masterResumeService.storedProfiles$;
  activeProfileId$ = this.masterResumeService.activeProfileId$;
  showLibraryModal = false;
  showSaveProfileModal = false;
  newProfileName = '';
  newProfileDesc = '';
  newProfileMakeDefault = false;

  // External Links Detection & Enrichment State
  detectedLinks: DetectedLinks | null = null;
  showFetchLinksModal = false;
  isFetchingExternalData = false;
  isEnrichedBannerVisible = false;

  constructor(
    private fb: FormBuilder,
    public masterResumeService: MasterResumeService,
    private pdfExtractor: PdfTextExtractorService,
    private settingsService: SettingsService,
    private toastService: ToastService,
    private linkFetcher: ExternalLinkFetcherService
  ) {}

  ngOnInit(): void {
    this.initForm();
    const current = this.masterResumeService.getCurrentMasterResume();
    this.populateForm(current);
  }

  private initForm(): void {
    this.resumeForm = this.fb.group({
      personalInfo: this.fb.group({
        fullName: ['', Validators.required],
        professionalTitle: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        location: [''],
        linkedin: [''],
        github: [''],
        portfolio: [''],
        summary: ['']
      }),
      professionalExperience: this.fb.array([]),
      projects: this.fb.array([]),
      skills: this.fb.group({
        programmingLanguages: [[]],
        frameworks: [[]],
        frontend: [[]],
        backend: [[]],
        databases: [[]],
        cloud: [[]],
        devops: [[]],
        aiMl: [[]],
        tools: [[]],
        other: [[]]
      }),
      education: this.fb.array([]),
      certifications: this.fb.array([]),
      achievements: this.fb.array([]),
      internships: this.fb.array([]),
      publications: this.fb.array([]),
      additionalInformation: this.fb.array([])
    });
  }

  get experienceControls(): FormArray {
    return this.resumeForm.get('professionalExperience') as FormArray;
  }

  get projectControls(): FormArray {
    return this.resumeForm.get('projects') as FormArray;
  }

  get educationControls(): FormArray {
    return this.resumeForm.get('education') as FormArray;
  }

  get certificationControls(): FormArray {
    return this.resumeForm.get('certifications') as FormArray;
  }

  get skillsGroup(): FormGroup {
    return this.resumeForm.get('skills') as FormGroup;
  }

  private populateForm(data: MasterResume): void {
    this.resumeForm.get('personalInfo')?.patchValue(data.personalInfo || {});
    this.resumeForm.get('skills')?.patchValue(data.skills || {});

    // Experience
    this.experienceControls.clear();
    (data.professionalExperience || []).forEach(exp => {
      this.experienceControls.push(this.fb.group({
        id: [exp.id || Date.now().toString()],
        company: [exp.company || '', Validators.required],
        role: [exp.role || '', Validators.required],
        location: [exp.location || ''],
        startDate: [exp.startDate || ''],
        endDate: [exp.endDate || ''],
        currentlyWorking: [exp.currentlyWorking || false],
        description: [exp.description || ''],
        responsibilities: [exp.responsibilities || []],
        achievements: [exp.achievements || []],
        technologies: [exp.technologies || []]
      }));
    });

    // Projects
    this.projectControls.clear();
    (data.projects || []).forEach(proj => {
      this.projectControls.push(this.fb.group({
        id: [proj.id || Date.now().toString()],
        name: [proj.name || '', Validators.required],
        description: [proj.description || ''],
        role: [proj.role || ''],
        technologies: [proj.technologies || []],
        responsibilities: [proj.responsibilities || []],
        achievements: [proj.achievements || []],
        githubUrl: [proj.githubUrl || ''],
        liveUrl: [proj.liveUrl || '']
      }));
    });

    // Education
    this.educationControls.clear();
    (data.education || []).forEach(edu => {
      this.educationControls.push(this.fb.group({
        id: [edu.id || Date.now().toString()],
        degree: [edu.degree || '', Validators.required],
        institution: [edu.institution || '', Validators.required],
        location: [edu.location || ''],
        startDate: [edu.startDate || ''],
        endDate: [edu.endDate || ''],
        grade: [edu.grade || '']
      }));
    });

    // Certifications
    this.certificationControls.clear();
    (data.certifications || []).forEach(cert => {
      this.certificationControls.push(this.fb.group({
        id: [cert.id || Date.now().toString()],
        name: [cert.name || '', Validators.required],
        issuer: [cert.issuer || ''],
        date: [cert.date || ''],
        credentialUrl: [cert.credentialUrl || '']
      }));
    });
  }

  private applyParsedResult(parsedResume: MasterResume): void {
    if (this.autoFillMode === 'merge') {
      const currentVal = this.resumeForm.value as MasterResume;
      const merged = this.masterResumeService.mergeMasterResumes(currentVal, parsedResume);
      this.populateForm(merged);
      this.toastService.success('Resume Merged!', 'Merged new experiences, projects & skills into your Master Resume without deleting existing entries.');
    } else {
      this.populateForm(parsedResume);
      this.toastService.success('Form Replaced!', 'Replaced form fields with new parsed resume data.');
    }
    this.isAutoFilled = true;
    this.showAiParseBox = false;
    this.checkAndPromptExternalLinks(parsedResume);
  }

  // --- EXTERNAL LINKS DETECTION & ENRICHMENT METHODS ---
  checkAndPromptExternalLinks(data: MasterResume): void {
    const links = this.linkFetcher.detectLinksInResume(data);
    if (this.linkFetcher.hasValidLinks(links)) {
      this.detectedLinks = links;
      this.showFetchLinksModal = true;
    }
  }

  onManualCheckLinks(): void {
    const currentVal = this.resumeForm.value as MasterResume;
    const links = this.linkFetcher.detectLinksInResume(currentVal);
    if (this.linkFetcher.hasValidLinks(links)) {
      this.detectedLinks = links;
      this.showFetchLinksModal = true;
    } else {
      this.toastService.info('No Profile Links Found', 'No LinkedIn, GitHub, or Portfolio URLs detected in your personal info fields.');
    }
  }

  fetchExternalLinkData(): void {
    if (!this.detectedLinks) return;

    this.isFetchingExternalData = true;
    const currentVal = this.resumeForm.value as MasterResume;

    this.linkFetcher.enrichMasterResumeWithLinks(currentVal, this.detectedLinks).subscribe({
      next: (enrichedResume) => {
        this.isFetchingExternalData = false;
        this.showFetchLinksModal = false;
        this.populateForm(enrichedResume);
        this.isEnrichedBannerVisible = true;
        this.toastService.success('Enriched!', 'Fetched top repository projects and skills from external links. Review and click Save.');
      },
      error: (err) => {
        this.isFetchingExternalData = false;
        this.toastService.error('Fetch Error', 'Failed to fetch data from external links.');
      }
    });
  }

  // --- STORED MASTER RESUME LIBRARY METHODS ---
  getActiveProfileName(): string {
    const active = this.masterResumeService.getActiveProfile();
    return active ? active.name : 'Primary Master Resume';
  }

  loadFromFolderAsset(): void {
    this.masterResumeService.loadFromAssetFile().subscribe({
      next: (data) => {
        if (this.autoFillMode === 'merge') {
          const currentVal = this.resumeForm.value as MasterResume;
          const merged = this.masterResumeService.mergeMasterResumes(currentVal, data);
          this.populateForm(merged);
        } else {
          this.populateForm(data);
        }
        this.checkAndPromptExternalLinks(data);
      }
    });
  }

  openSaveProfileModal(): void {
    const count = this.masterResumeService.getStoredProfiles().length;
    this.newProfileName = `Master Resume Profile #${count + 1}`;
    this.newProfileDesc = '';
    this.newProfileMakeDefault = false;
    this.showSaveProfileModal = true;
  }

  confirmSaveProfile(): void {
    if (!this.newProfileName.trim()) {
      this.toastService.warning('Required', 'Please enter a profile name.');
      return;
    }
    const currentVal = this.resumeForm.value as MasterResume;
    this.masterResumeService.saveMasterResume(currentVal, false);
    this.masterResumeService.saveCurrentAsProfile(this.newProfileName.trim(), this.newProfileDesc.trim(), this.newProfileMakeDefault);
    this.showSaveProfileModal = false;
  }

  selectProfile(id: string): void {
    const success = this.masterResumeService.loadProfile(id);
    if (success) {
      const current = this.masterResumeService.getCurrentMasterResume();
      this.populateForm(current);
    }
  }

  deleteProfile(id: string): void {
    this.masterResumeService.deleteProfile(id);
    this.populateForm(this.masterResumeService.getCurrentMasterResume());
  }

  setDefaultProfile(id: string): void {
    this.masterResumeService.setDefaultProfile(id);
  }

  // --- AI PDF & TEXT PARSING ---
  async onPdfFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.selectedPdfFileName = file.name;

    const settings = this.settingsService.getSettings();
    if (!settings.groq.apiKey) {
      this.toastService.error('Groq Key Required', 'Please configure your Groq API Key in Settings first.');
      return;
    }

    this.isParsing = true;
    this.parsingStatusMessage = 'Extracting text content from PDF file...';

    try {
      const extractedText = await this.pdfExtractor.extractTextFromPdf(file);
      if (!extractedText || extractedText.length < 20) {
        throw new Error('Could not extract readable text from PDF. The file may be image-based or password protected.');
      }

      this.parsingStatusMessage = 'Structuring Master Resume fields with Groq AI...';
      this.masterResumeService.parseRawTextToMasterResume(extractedText).subscribe({
        next: (parsedResume) => {
          this.applyParsedResult(parsedResume);
        },
        error: (err) => {
          this.isParsing = false;
          this.toastService.error('AI Parsing Error', err.message);
        }
      });
    } catch (err: any) {
      this.isParsing = false;
      this.toastService.error('PDF Extraction Failed', err.message);
    }
  }

  parsePastedText(): void {
    if (!this.rawResumeText.trim()) return;

    const settings = this.settingsService.getSettings();
    if (!settings.groq.apiKey) {
      this.toastService.error('Groq Key Required', 'Please configure your Groq API Key in Settings first.');
      return;
    }

    this.isParsing = true;
    this.parsingStatusMessage = 'Structuring Master Resume fields with Groq AI...';

    this.masterResumeService.parseRawTextToMasterResume(this.rawResumeText).subscribe({
      next: (parsedResume) => {
        this.applyParsedResult(parsedResume);
      },
      error: (err) => {
        this.isParsing = false;
        this.toastService.error('AI Parsing Error', err.message);
      }
    });
  }

  addExperience(): void {
    this.experienceControls.insert(0, this.fb.group({
      id: ['exp-' + Date.now()],
      company: ['', Validators.required],
      role: ['', Validators.required],
      location: [''],
      startDate: [''],
      endDate: [''],
      currentlyWorking: [false],
      description: [''],
      responsibilities: [[]],
      achievements: [[]],
      technologies: [[]]
    }));
  }

  removeExperience(index: number): void {
    this.experienceControls.removeAt(index);
  }

  addProject(): void {
    this.projectControls.insert(0, this.fb.group({
      id: ['proj-' + Date.now()],
      name: ['', Validators.required],
      description: [''],
      role: [''],
      technologies: [[]],
      responsibilities: [[]],
      achievements: [[]],
      githubUrl: [''],
      liveUrl: ['']
    }));
  }

  removeProject(index: number): void {
    this.projectControls.removeAt(index);
  }

  addEducation(): void {
    this.educationControls.push(this.fb.group({
      id: ['edu-' + Date.now()],
      degree: ['', Validators.required],
      institution: ['', Validators.required],
      location: [''],
      startDate: [''],
      endDate: [''],
      grade: ['']
    }));
  }

  removeEducation(index: number): void {
    this.educationControls.removeAt(index);
  }

  addCertification(): void {
    this.certificationControls.push(this.fb.group({
      id: ['cert-' + Date.now()],
      name: ['', Validators.required],
      issuer: [''],
      date: [''],
      credentialUrl: ['']
    }));
  }

  removeCertification(index: number): void {
    this.certificationControls.removeAt(index);
  }

  // Helpers for array string conversion
  getCommaSeparated(val: any): string {
    if (Array.isArray(val)) return val.join(', ');
    return val || '';
  }

  setCommaSeparated(group: any, field: string, event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    const array = input.split(',').map(s => s.trim()).filter(s => s.length > 0);
    group.get(field)?.setValue(array);
  }

  setSkillsCategory(category: string, event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    const array = input.split(',').map(s => s.trim()).filter(s => s.length > 0);
    this.skillsGroup.get(category)?.setValue(array);
  }

  getLinesText(val: any): string {
    if (Array.isArray(val)) return val.join('\n');
    return val || '';
  }

  setLinesText(group: any, field: string, event: Event): void {
    const input = (event.target as HTMLTextAreaElement).value;
    const array = input.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    group.get(field)?.setValue(array);
  }

  saveMasterResume(): void {
    if (this.resumeForm.invalid) {
      this.toastService.warning('Validation Error', 'Please check required fields before saving.');
    }
    const val = this.resumeForm.value as MasterResume;
    this.masterResumeService.saveMasterResume(val);
    this.isAutoFilled = false;
    this.isEnrichedBannerVisible = false;
  }

  onExportJson(): void {
    this.masterResumeService.exportMasterResumeJson();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const content = e.target.result as string;
        try {
          const parsed = JSON.parse(content) as MasterResume;
          if (this.autoFillMode === 'merge') {
            const currentVal = this.resumeForm.value as MasterResume;
            const merged = this.masterResumeService.mergeMasterResumes(currentVal, parsed);
            this.populateForm(merged);
            this.toastService.success('JSON Merged!', 'Merged imported JSON into your Master Resume.');
          } else {
            const res = this.masterResumeService.importMasterResumeJson(content);
            if (res.success) {
              this.toastService.success('Imported', res.message);
              const current = this.masterResumeService.getCurrentMasterResume();
              this.populateForm(current);
            } else {
              this.toastService.error('Import Failed', res.message);
            }
          }
          this.checkAndPromptExternalLinks(parsed);
        } catch (err: any) {
          this.toastService.error('JSON Error', err.message || 'Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  }

  openResetConfirm(): void {
    this.isResetModalOpen = true;
  }

  confirmReset(): void {
    this.isResetModalOpen = false;
    this.masterResumeService.resetToSampleData();
    this.populateForm(this.masterResumeService.getCurrentMasterResume());
    this.isAutoFilled = false;
    this.isEnrichedBannerVisible = false;
  }
}
