import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ResumeDraft } from '../models/draft.model';
import { GeneratedResume } from '../models/generated-resume.model';
import { ResumeTemplateType } from '../models/settings.model';
import { StorageService } from './storage.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class DraftService {
  private readonly DRAFTS_KEY = 'saved_resume_drafts';

  private draftsSubject = new BehaviorSubject<ResumeDraft[]>(this.loadDrafts());
  public drafts$: Observable<ResumeDraft[]> = this.draftsSubject.asObservable();

  constructor(
    private storageService: StorageService,
    private toastService: ToastService
  ) {}

  private loadDrafts(): ResumeDraft[] {
    const drafts = this.storageService.getItem<ResumeDraft[]>(this.DRAFTS_KEY);
    return Array.isArray(drafts) ? drafts : [];
  }

  getDrafts(): ResumeDraft[] {
    return this.draftsSubject.getValue();
  }

  getDraftById(id: string): ResumeDraft | undefined {
    return this.getDrafts().find(d => d.id === id);
  }

  saveDraft(
    jobTitle: string,
    companyName: string,
    resumeData: GeneratedResume,
    template: ResumeTemplateType,
    rawJobDescription?: string,
    existingDraftId?: string
  ): ResumeDraft {
    const drafts = this.getDrafts();
    const now = new Date().toISOString();

    let targetDraft: ResumeDraft;

    if (existingDraftId) {
      const idx = drafts.findIndex(d => d.id === existingDraftId);
      if (idx !== -1) {
        drafts[idx] = {
          ...drafts[idx],
          jobTitle: jobTitle || drafts[idx].jobTitle,
          companyName: companyName || drafts[idx].companyName,
          updatedAt: now,
          resumeData,
          template,
          rawJobDescription: rawJobDescription || drafts[idx].rawJobDescription
        };
        targetDraft = drafts[idx];
      } else {
        targetDraft = this.createNewDraftObj(jobTitle, companyName, resumeData, template, rawJobDescription);
        drafts.unshift(targetDraft);
      }
    } else {
      targetDraft = this.createNewDraftObj(jobTitle, companyName, resumeData, template, rawJobDescription);
      drafts.unshift(targetDraft);
    }

    this.storageService.setItem(this.DRAFTS_KEY, drafts);
    this.draftsSubject.next(drafts);
    this.toastService.success('Draft Saved', `Saved "${targetDraft.jobTitle}" draft to your library.`);
    return targetDraft;
  }

  private createNewDraftObj(
    jobTitle: string,
    companyName: string,
    resumeData: GeneratedResume,
    template: ResumeTemplateType,
    rawJobDescription?: string
  ): ResumeDraft {
    const now = new Date().toISOString();
    return {
      id: 'draft-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      jobTitle: jobTitle || resumeData.personalInfo.professionalTitle || 'Untitled Tailored Resume',
      companyName: companyName || 'Target Company',
      createdAt: now,
      updatedAt: now,
      resumeData,
      template,
      rawJobDescription
    };
  }

  renameDraft(id: string, newJobTitle: string, newCompanyName: string): void {
    const drafts = this.getDrafts();
    const idx = drafts.findIndex(d => d.id === id);
    if (idx !== -1) {
      drafts[idx].jobTitle = newJobTitle;
      drafts[idx].companyName = newCompanyName;
      drafts[idx].updatedAt = new Date().toISOString();
      this.storageService.setItem(this.DRAFTS_KEY, drafts);
      this.draftsSubject.next(drafts);
      this.toastService.success('Updated', 'Draft renamed successfully.');
    }
  }

  duplicateDraft(id: string): void {
    const draft = this.getDraftById(id);
    if (draft) {
      const copy = JSON.parse(JSON.stringify(draft));
      copy.id = 'draft-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      copy.jobTitle = `${draft.jobTitle} (Copy)`;
      copy.createdAt = new Date().toISOString();
      copy.updatedAt = new Date().toISOString();

      const drafts = [copy, ...this.getDrafts()];
      this.storageService.setItem(this.DRAFTS_KEY, drafts);
      this.draftsSubject.next(drafts);
      this.toastService.info('Duplicated', `Created duplicate of "${draft.jobTitle}".`);
    }
  }

  deleteDraft(id: string): void {
    const drafts = this.getDrafts().filter(d => d.id !== id);
    this.storageService.setItem(this.DRAFTS_KEY, drafts);
    this.draftsSubject.next(drafts);
    this.toastService.info('Deleted', 'Draft removed from library.');
  }
}
