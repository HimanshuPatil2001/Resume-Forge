import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DraftService } from '../../core/services/draft.service';
import { ResumeDraft } from '../../core/models/draft.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-drafts',
  template: `
    <div class="page-container">
      
      <div class="page-header">
        <div>
          <h1 class="page-title">Saved Resumes Library</h1>
          <p class="page-subtitle">Manage, reopen, duplicate, or export your locally saved tailored resumes.</p>
        </div>
        <a routerLink="/create-resume" class="btn btn-primary">
          ✨ Tailor New Resume
        </a>
      </div>

      <!-- SEARCH BAR -->
      <div class="search-bar">
        <input 
          type="text" 
          [(ngModel)]="searchQuery" 
          placeholder="Search by job title or company name..." 
          class="search-input"
        />
      </div>

      <!-- DRAFTS LIST -->
      <div class="drafts-grid" *ngIf="(drafts$ | async) as drafts">
        
        <div class="empty-state" *ngIf="filterDrafts(drafts).length === 0">
          <div class="empty-icon">📂</div>
          <h3>No Drafts Found</h3>
          <p>Generate a tailored resume to save it here in your local library.</p>
        </div>

        <div class="draft-card" *ngFor="let draft of filterDrafts(drafts)">
          <div class="draft-card-header">
            <span class="template-badge">{{ draft.template }}</span>
            <span class="draft-date">Saved: {{ draft.updatedAt | date:'mediumDate' }}</span>
          </div>

          <h3 class="draft-title">{{ draft.jobTitle }}</h3>
          <div class="draft-company">{{ draft.companyName || 'Target Company' }}</div>

          <div class="draft-preview-summary">
            <span>Summary: {{ draft.resumeData.professionalSummary ? (draft.resumeData.professionalSummary.slice(0, 100) + '...') : 'No summary' }}</span>
          </div>

          <div class="draft-actions">
            <button class="btn btn-primary btn-sm" (click)="openDraft(draft)">
              ✏️ Open & Edit
            </button>
            
            <button class="btn btn-outline btn-sm" (click)="duplicateDraft(draft.id)">
              📋 Duplicate
            </button>

            <button class="btn btn-danger-outline btn-sm" (click)="promptDelete(draft)">
              🗑️ Delete
            </button>
          </div>
        </div>

      </div>

      <!-- CONFIRM DELETE MODAL -->
      <app-confirmation-dialog
        [isOpen]="isDeleteModalOpen"
        title="Delete Resume Draft?"
        [message]="'Are you sure you want to delete ' + (targetDeleteDraft?.jobTitle || 'this draft') + '?'"
        confirmText="Delete Draft"
        type="danger"
        (confirm)="confirmDelete()"
        (cancel)="isDeleteModalOpen = false"
      ></app-confirmation-dialog>

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
    .search-bar {
      margin-bottom: 24px;
    }
    .search-input {
      width: 100%;
      background: var(--bg-card, #1e293b);
      border: 1px solid var(--border-color, rgba(255,255,255,0.12));
      border-radius: 10px;
      padding: 12px 16px;
      color: var(--text-main, #f8fafc);
      font-size: 14px;
      box-sizing: border-box;
    }
    .search-input:focus {
      outline: none;
      border-color: #6366f1;
    }
    .drafts-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
    @media (max-width: 768px) {
      .drafts-grid { grid-template-columns: 1fr; gap: 14px; }
    }
    .draft-card {
      background: var(--bg-card, #1e293b);
      border: 1px solid var(--border-color, rgba(255,255,255,0.08));
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      color: var(--text-main, #f8fafc);
    }
    @media (max-width: 768px) {
      .draft-card {
        padding: 16px 14px;
        border-radius: 12px;
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
    .draft-title { font-size: 17px; font-weight: 600; margin: 0 0 4px 0; }
    .draft-company { font-size: 13px; color: var(--text-muted, #94a3b8); margin-bottom: 12px; }
    .draft-preview-summary {
      font-size: 12px;
      color: var(--text-muted, #cbd5e1);
      background: rgba(15, 23, 42, 0.5);
      padding: 10px 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      line-height: 1.4;
    }
    .draft-actions {
      margin-top: auto;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    @media (max-width: 600px) {
      .draft-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        width: 100%;
      }
      .draft-actions .btn-primary {
        grid-column: 1 / -1;
      }
      .draft-actions .btn {
        width: 100%;
        justify-content: center;
        text-align: center;
        box-sizing: border-box;
      }
    }
    .btn {
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }
    .btn-primary { background: #6366f1; color: white; }
    .btn-primary:hover { background: #4f46e5; }
    .btn-outline { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); color: var(--text-main, #f8fafc); }
    .btn-danger-outline { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; }
    .btn-sm { padding: 6px 12px; font-size: 12px; }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 48px;
      background: var(--bg-card, #1e293b);
      border-radius: 16px;
    }
    .empty-icon { font-size: 40px; margin-bottom: 12px; }
  `]
})
export class DraftsComponent implements OnInit {
  drafts$: Observable<ResumeDraft[]>;
  searchQuery = '';

  isDeleteModalOpen = false;
  targetDeleteDraft: ResumeDraft | null = null;

  constructor(
    private router: Router,
    private draftService: DraftService
  ) {
    this.drafts$ = this.draftService.drafts$;
  }

  ngOnInit(): void {}

  filterDrafts(drafts: ResumeDraft[]): ResumeDraft[] {
    if (!this.searchQuery.trim()) return drafts;
    const q = this.searchQuery.toLowerCase();
    return drafts.filter(d => 
      (d.jobTitle && d.jobTitle.toLowerCase().includes(q)) ||
      (d.companyName && d.companyName.toLowerCase().includes(q))
    );
  }

  openDraft(draft: ResumeDraft): void {
    this.router.navigate(['/resume-editor'], { queryParams: { draftId: draft.id } });
  }

  duplicateDraft(id: string): void {
    this.draftService.duplicateDraft(id);
  }

  promptDelete(draft: ResumeDraft): void {
    this.targetDeleteDraft = draft;
    this.isDeleteModalOpen = true;
  }

  confirmDelete(): void {
    if (this.targetDeleteDraft) {
      this.draftService.deleteDraft(this.targetDeleteDraft.id);
      this.targetDeleteDraft = null;
    }
    this.isDeleteModalOpen = false;
  }
}
