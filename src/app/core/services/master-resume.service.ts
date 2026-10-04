import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { MasterResume, StoredMasterResume } from '../models/master-resume.model';
import { SAMPLE_MASTER_RESUME } from '../data/sample-master-resume';
import { StorageService } from './storage.service';
import { ToastService } from './toast.service';
import { GroqService } from './groq.service';
import { PromptService } from './prompt.service';
import { ResumeGeneratorService } from './resume-generator.service';

@Injectable({
  providedIn: 'root'
})
export class MasterResumeService {
  private readonly MASTER_RESUME_KEY = 'master_resume_data';
  private readonly STORED_PROFILES_KEY = 'stored_master_resumes_library';
  private readonly ACTIVE_PROFILE_ID_KEY = 'active_master_resume_id';

  private masterResumeSubject = new BehaviorSubject<MasterResume>(this.loadInitialData());
  public masterResume$: Observable<MasterResume> = this.masterResumeSubject.asObservable();

  private storedProfilesSubject = new BehaviorSubject<StoredMasterResume[]>(this.loadInitialProfiles());
  public storedProfiles$: Observable<StoredMasterResume[]> = this.storedProfilesSubject.asObservable();

  private activeProfileIdSubject = new BehaviorSubject<string | null>(this.storageService.getItem<string>(this.ACTIVE_PROFILE_ID_KEY));
  public activeProfileId$: Observable<string | null> = this.activeProfileIdSubject.asObservable();

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private toastService: ToastService,
    private groqService: GroqService,
    private promptService: PromptService,
    private generatorService: ResumeGeneratorService
  ) {
    if (this.storedProfilesSubject.getValue().length === 0) {
      this.initDefaultProfile();
    }
  }

  private loadInitialData(): MasterResume {
    const saved = this.storageService.getItem<MasterResume>(this.MASTER_RESUME_KEY);
    if (saved && saved.personalInfo) {
      return saved;
    }
    return JSON.parse(JSON.stringify(SAMPLE_MASTER_RESUME));
  }

  private loadInitialProfiles(): StoredMasterResume[] {
    const profiles = this.storageService.getItem<StoredMasterResume[]>(this.STORED_PROFILES_KEY);
    return Array.isArray(profiles) ? profiles : [];
  }

  private initDefaultProfile(): void {
    const current = this.loadInitialData();
    const defaultProfile: StoredMasterResume = {
      id: 'master-profile-default',
      name: 'Primary Master Resume',
      description: 'Default master resume stored in local library',
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: current
    };
    const profiles = [defaultProfile];
    this.storageService.setItem(this.STORED_PROFILES_KEY, profiles);
    this.storageService.setItem(this.ACTIVE_PROFILE_ID_KEY, defaultProfile.id);
    this.storedProfilesSubject.next(profiles);
    this.activeProfileIdSubject.next(defaultProfile.id);
  }

  getStoredProfiles(): StoredMasterResume[] {
    return this.storedProfilesSubject.getValue();
  }

  getActiveProfileId(): string | null {
    return this.activeProfileIdSubject.getValue();
  }

  getActiveProfile(): StoredMasterResume | undefined {
    const activeId = this.getActiveProfileId();
    if (!activeId) return undefined;
    return this.getStoredProfiles().find(p => p.id === activeId);
  }

  saveCurrentAsProfile(name: string, description?: string, makeDefault: boolean = false): StoredMasterResume {
    const profiles = [...this.getStoredProfiles()];
    const currentData = this.getCurrentMasterResume();
    const now = new Date().toISOString();

    if (makeDefault) {
      profiles.forEach(p => p.isDefault = false);
    }

    const newProfile: StoredMasterResume = {
      id: 'master-profile-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: name || 'Master Resume Profile',
      description: description || '',
      isDefault: makeDefault || (profiles.length === 0),
      createdAt: now,
      updatedAt: now,
      data: JSON.parse(JSON.stringify(currentData))
    };

    profiles.unshift(newProfile);
    this.storageService.setItem(this.STORED_PROFILES_KEY, profiles);
    this.storageService.setItem(this.ACTIVE_PROFILE_ID_KEY, newProfile.id);
    this.storedProfilesSubject.next(profiles);
    this.activeProfileIdSubject.next(newProfile.id);

    this.toastService.success('Saved to Library', `Saved profile "${newProfile.name}" to Master Resume library.`);
    return newProfile;
  }

  loadProfile(id: string): boolean {
    const profiles = this.getStoredProfiles();
    const found = profiles.find(p => p.id === id);
    if (!found) {
      this.toastService.error('Profile Not Found', 'Could not find the requested master resume profile.');
      return false;
    }

    this.saveMasterResume(JSON.parse(JSON.stringify(found.data)), false);
    this.storageService.setItem(this.ACTIVE_PROFILE_ID_KEY, id);
    this.activeProfileIdSubject.next(id);
    this.toastService.success('Loaded Profile', `Switched active master resume to "${found.name}".`);
    return true;
  }

  updateProfileData(id: string, updatedData: MasterResume): boolean {
    const profiles = [...this.getStoredProfiles()];
    const idx = profiles.findIndex(p => p.id === id);
    if (idx !== -1) {
      profiles[idx].data = JSON.parse(JSON.stringify(updatedData));
      profiles[idx].updatedAt = new Date().toISOString();
      this.storageService.setItem(this.STORED_PROFILES_KEY, profiles);
      this.storedProfilesSubject.next(profiles);
      return true;
    }
    return false;
  }

  deleteProfile(id: string): void {
    let profiles = this.getStoredProfiles().filter(p => p.id !== id);
    this.storageService.setItem(this.STORED_PROFILES_KEY, profiles);
    this.storedProfilesSubject.next(profiles);

    if (this.activeProfileIdSubject.getValue() === id) {
      if (profiles.length > 0) {
        this.loadProfile(profiles[0].id);
      } else {
        this.activeProfileIdSubject.next(null);
      }
    }
    this.toastService.info('Deleted', 'Master resume profile removed from library.');
  }

  setDefaultProfile(id: string): void {
    const profiles = [...this.getStoredProfiles()];
    profiles.forEach(p => p.isDefault = (p.id === id));
    this.storageService.setItem(this.STORED_PROFILES_KEY, profiles);
    this.storedProfilesSubject.next(profiles);
    this.toastService.success('Default Set', 'Set profile as your primary default master resume.');
  }

  loadFromAssetFile(): Observable<MasterResume> {
    return this.http.get<MasterResume>('assets/master-resumes/default-master-resume.json').pipe(
      tap(data => {
        if (data && data.personalInfo) {
          this.saveMasterResume(data, false);
          this.toastService.success('Asset Loaded', 'Restored Master Resume directly from /assets/master-resumes/ folder!');
        }
      }),
      catchError(err => {
        console.error('[MasterResumeService] Failed to load asset JSON:', err);
        this.toastService.error('Asset Load Error', 'Could not load asset file from assets/master-resumes/default-master-resume.json');
        return throwError(() => err);
      })
    );
  }

  getCurrentMasterResume(): MasterResume {
    return this.masterResumeSubject.getValue();
  }

  saveMasterResume(resume: MasterResume, showToast: boolean = true): boolean {
    resume.lastUpdated = new Date().toISOString();
    const success = this.storageService.setItem(this.MASTER_RESUME_KEY, resume);
    if (success) {
      this.masterResumeSubject.next(resume);
      const activeId = this.activeProfileIdSubject.getValue();
      if (activeId) {
        this.updateProfileData(activeId, resume);
      }
      if (showToast) {
        this.toastService.success('Saved', 'Master Resume updated successfully.');
      }
      return true;
    } else {
      if (showToast) {
        this.toastService.error('Storage Error', 'Failed to save Master Resume to local storage.');
      }
      return false;
    }
  }

  exportMasterResumeJson(): void {
    const data = this.getCurrentMasterResume();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Master_Resume_${data.personalInfo.fullName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    this.toastService.info('Exported', 'Master Resume downloaded as JSON.');
  }

  importMasterResumeJson(jsonContent: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonContent);
      const validation = this.validateMasterResumeSchema(parsed);
      if (!validation.valid) {
        return { success: false, message: `Invalid Master Resume format: ${validation.error}` };
      }

      this.saveMasterResume(parsed as MasterResume);
      return { success: true, message: 'Master Resume imported successfully!' };
    } catch (e: any) {
      return { success: false, message: `JSON Syntax Error: ${e.message || 'Invalid JSON file'}` };
    }
  }

  parseRawTextToMasterResume(rawText: string): Observable<MasterResume> {
    const systemPrompt = this.promptService.getMasterResumeParsingSystemPrompt();
    const userPrompt = this.promptService.getMasterResumeParsingUserPrompt(rawText);

    return this.groqService.createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]).pipe(
      map(rawResponse => {
        const parsed = this.generatorService.safeParseJson<MasterResume>(rawResponse);
        if (!parsed || !parsed.personalInfo) {
          throw new Error('AI could not parse structured resume fields from the provided text.');
        }
        const normalized = this.normalizeMasterResume(parsed);

        // Fallback scan rawText for explicit profile URLs AI might have left blank
        const extractedUrls = this.extractUrlsFromText(rawText);
        if (!normalized.personalInfo.linkedin && extractedUrls.linkedin) {
          normalized.personalInfo.linkedin = extractedUrls.linkedin;
        }
        if (!normalized.personalInfo.github && extractedUrls.github) {
          normalized.personalInfo.github = extractedUrls.github;
        }
        if (!normalized.personalInfo.portfolio && extractedUrls.portfolio) {
          normalized.personalInfo.portfolio = extractedUrls.portfolio;
        }

        return normalized;
      }),
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  resetToSampleData(): void {
    const sample = JSON.parse(JSON.stringify(SAMPLE_MASTER_RESUME));
    this.saveMasterResume(sample);
    this.toastService.info('Reset Complete', 'Master Resume has been reset to default sample data.');
  }

  isSampleMasterResume(resume: MasterResume): boolean {
    if (!resume || !resume.personalInfo) return true;
    const name = (resume.personalInfo.fullName || '').toLowerCase();
    const email = (resume.personalInfo.email || '').toLowerCase();
    const linkedin = (resume.personalInfo.linkedin || '').toLowerCase();
    return name.includes('john developer') || email.includes('john.developer@example.com') || linkedin.includes('johndeveloper-sample');
  }

  isSampleUrl(url: string): boolean {
    if (!url) return true;
    const lower = url.toLowerCase();
    return lower.includes('johndeveloper-sample') || lower.includes('johndeveloper.dev') || lower.includes('john.developer@example.com');
  }

  extractUrlsFromText(text: string): { linkedin?: string; github?: string; portfolio?: string } {
    const res: { linkedin?: string; github?: string; portfolio?: string } = {};
    if (!text) return res;

    const urlRegex = /(https?:\/\/[^\s,]+)/g;
    const matches = text.match(urlRegex) || [];

    matches.forEach(url => {
      const cleanUrl = url.replace(/[).;]*$/, '');
      if (cleanUrl.includes('linkedin.com/') && !res.linkedin) {
        res.linkedin = cleanUrl;
      } else if (cleanUrl.includes('github.com/') && !res.github) {
        res.github = cleanUrl;
      } else if (!cleanUrl.includes('linkedin.com') && !cleanUrl.includes('github.com') && !cleanUrl.includes('google.com') && !cleanUrl.includes('w3.org') && !res.portfolio) {
        res.portfolio = cleanUrl;
      }
    });

    return res;
  }

  mergeMasterResumes(existing: MasterResume, incoming: MasterResume): MasterResume {
    // If existing is default sample demo data, replace sample data completely with incoming real data!
    if (this.isSampleMasterResume(existing)) {
      const cleanIncoming = JSON.parse(JSON.stringify(incoming));
      if (cleanIncoming.personalInfo) {
        if (this.isSampleUrl(cleanIncoming.personalInfo.linkedin)) cleanIncoming.personalInfo.linkedin = '';
        if (this.isSampleUrl(cleanIncoming.personalInfo.github)) cleanIncoming.personalInfo.github = '';
        if (this.isSampleUrl(cleanIncoming.personalInfo.portfolio)) cleanIncoming.personalInfo.portfolio = '';
      }
      return cleanIncoming;
    }

    const merged: MasterResume = JSON.parse(JSON.stringify(existing || {}));

    // 1. Personal Info - update with incoming real details
    if (!merged.personalInfo) {
      merged.personalInfo = { ...(incoming.personalInfo || { fullName: '', professionalTitle: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '', summary: '' }) };
    } else if (incoming.personalInfo) {
      if (incoming.personalInfo.fullName && incoming.personalInfo.fullName !== 'Extracted Name') {
        merged.personalInfo.fullName = incoming.personalInfo.fullName;
      }
      if (incoming.personalInfo.professionalTitle) {
        merged.personalInfo.professionalTitle = incoming.personalInfo.professionalTitle;
      }
      if (incoming.personalInfo.email) merged.personalInfo.email = incoming.personalInfo.email;
      if (incoming.personalInfo.phone) merged.personalInfo.phone = incoming.personalInfo.phone;
      if (incoming.personalInfo.location) merged.personalInfo.location = incoming.personalInfo.location;

      // Update LinkedIn, GitHub, Portfolio if incoming provides a value OR if existing has a sample link
      if (incoming.personalInfo.linkedin && !this.isSampleUrl(incoming.personalInfo.linkedin)) {
        merged.personalInfo.linkedin = incoming.personalInfo.linkedin;
      } else if (this.isSampleUrl(merged.personalInfo.linkedin)) {
        merged.personalInfo.linkedin = (incoming.personalInfo.linkedin && !this.isSampleUrl(incoming.personalInfo.linkedin)) ? incoming.personalInfo.linkedin : '';
      }

      if (incoming.personalInfo.github && !this.isSampleUrl(incoming.personalInfo.github)) {
        merged.personalInfo.github = incoming.personalInfo.github;
      } else if (this.isSampleUrl(merged.personalInfo.github)) {
        merged.personalInfo.github = (incoming.personalInfo.github && !this.isSampleUrl(incoming.personalInfo.github)) ? incoming.personalInfo.github : '';
      }

      if (incoming.personalInfo.portfolio && !this.isSampleUrl(incoming.personalInfo.portfolio)) {
        merged.personalInfo.portfolio = incoming.personalInfo.portfolio;
      } else if (this.isSampleUrl(merged.personalInfo.portfolio)) {
        merged.personalInfo.portfolio = (incoming.personalInfo.portfolio && !this.isSampleUrl(incoming.personalInfo.portfolio)) ? incoming.personalInfo.portfolio : '';
      }

      if (incoming.personalInfo.summary) {
        if (!merged.personalInfo.summary || merged.personalInfo.summary.includes('Senior Software Engineer with 6+ years')) {
          merged.personalInfo.summary = incoming.personalInfo.summary;
        }
      }
    }

    // Strip any remaining sample URLs from merged.personalInfo
    if (this.isSampleUrl(merged.personalInfo.linkedin)) merged.personalInfo.linkedin = '';
    if (this.isSampleUrl(merged.personalInfo.github)) merged.personalInfo.github = '';
    if (this.isSampleUrl(merged.personalInfo.portfolio)) merged.personalInfo.portfolio = '';

    // 2. Professional Experience - Match or Append
    if (!Array.isArray(merged.professionalExperience)) merged.professionalExperience = [];
    if (Array.isArray(incoming.professionalExperience)) {
      incoming.professionalExperience.forEach(incExp => {
        const matchIndex = merged.professionalExperience.findIndex(exp =>
          (exp.company && incExp.company && exp.company.toLowerCase().trim() === incExp.company.toLowerCase().trim()) &&
          (exp.role && incExp.role && exp.role.toLowerCase().trim() === incExp.role.toLowerCase().trim())
        );

        if (matchIndex !== -1) {
          const targetExp = merged.professionalExperience[matchIndex];
          const existingBullets = new Set(targetExp.responsibilities || []);
          (incExp.responsibilities || []).forEach(b => {
            if (b && !existingBullets.has(b)) {
              if (!targetExp.responsibilities) targetExp.responsibilities = [];
              targetExp.responsibilities.push(b);
            }
          });

          const existingTech = new Set((targetExp.technologies || []).map(t => t.toLowerCase()));
          (incExp.technologies || []).forEach(t => {
            if (t && !existingTech.has(t.toLowerCase())) {
              if (!targetExp.technologies) targetExp.technologies = [];
              targetExp.technologies.push(t);
            }
          });

          const existingAch = new Set(targetExp.achievements || []);
          (incExp.achievements || []).forEach(a => {
            if (a && !existingAch.has(a)) {
              if (!targetExp.achievements) targetExp.achievements = [];
              targetExp.achievements.push(a);
            }
          });
        } else {
          merged.professionalExperience.push(JSON.parse(JSON.stringify(incExp)));
        }
      });
    }

    // 3. Projects - Match or Append
    if (!Array.isArray(merged.projects)) merged.projects = [];
    if (Array.isArray(incoming.projects)) {
      incoming.projects.forEach(incProj => {
        const matchIndex = merged.projects.findIndex(p =>
          p.name && incProj.name && p.name.toLowerCase().trim() === incProj.name.toLowerCase().trim()
        );

        if (matchIndex !== -1) {
          const targetProj = merged.projects[matchIndex];
          const existingTech = new Set((targetProj.technologies || []).map(t => t.toLowerCase()));
          (incProj.technologies || []).forEach(t => {
            if (t && !existingTech.has(t.toLowerCase())) {
              if (!targetProj.technologies) targetProj.technologies = [];
              targetProj.technologies.push(t);
            }
          });
          if (!targetProj.githubUrl && incProj.githubUrl) targetProj.githubUrl = incProj.githubUrl;
          if (!targetProj.liveUrl && incProj.liveUrl) targetProj.liveUrl = incProj.liveUrl;
        } else {
          merged.projects.push(JSON.parse(JSON.stringify(incProj)));
        }
      });
    }

    // 4. Skills Matrix - Category Union
    if (!merged.skills) {
      merged.skills = {
        programmingLanguages: [], frameworks: [], frontend: [], backend: [],
        databases: [], cloud: [], devops: [], aiMl: [], tools: [], other: []
      };
    }

    if (incoming.skills) {
      const categories: (keyof typeof merged.skills)[] = [
        'programmingLanguages', 'frameworks', 'frontend', 'backend',
        'databases', 'cloud', 'devops', 'aiMl', 'tools', 'other'
      ];

      categories.forEach(cat => {
        const existingList = merged.skills[cat] || [];
        const incomingList = incoming.skills[cat] || [];
        const set = new Set(existingList.map(s => s.toLowerCase()));

        incomingList.forEach(item => {
          if (item && !set.has(item.toLowerCase())) {
            existingList.push(item);
            set.add(item.toLowerCase());
          }
        });
        merged.skills[cat] = existingList;
      });
    }

    // 5. Education - Match or Append
    if (!Array.isArray(merged.education)) merged.education = [];
    if (Array.isArray(incoming.education)) {
      incoming.education.forEach(incEdu => {
        const exists = merged.education.some(edu =>
          edu.degree && incEdu.degree && edu.degree.toLowerCase().trim() === incEdu.degree.toLowerCase().trim()
        );
        if (!exists) {
          merged.education.push(JSON.parse(JSON.stringify(incEdu)));
        }
      });
    }

    // 6. Certifications - Match or Append
    if (!Array.isArray(merged.certifications)) merged.certifications = [];
    if (Array.isArray(incoming.certifications)) {
      incoming.certifications.forEach(incCert => {
        const exists = merged.certifications.some(c =>
          c.name && incCert.name && c.name.toLowerCase().trim() === incCert.name.toLowerCase().trim()
        );
        if (!exists) {
          merged.certifications.push(JSON.parse(JSON.stringify(incCert)));
        }
      });
    }

    merged.lastUpdated = new Date().toISOString();
    return merged;
  }

  private normalizeMasterResume(parsed: any): MasterResume {
    return {
      personalInfo: {
        fullName: parsed?.personalInfo?.fullName || 'Extracted Name',
        professionalTitle: parsed?.personalInfo?.professionalTitle || '',
        email: parsed?.personalInfo?.email || '',
        phone: parsed?.personalInfo?.phone || '',
        location: parsed?.personalInfo?.location || '',
        linkedin: parsed?.personalInfo?.linkedin || '',
        github: parsed?.personalInfo?.github || '',
        portfolio: parsed?.personalInfo?.portfolio || '',
        summary: parsed?.personalInfo?.summary || ''
      },
      professionalExperience: Array.isArray(parsed?.professionalExperience) ? parsed.professionalExperience.map((e: any, i: number) => ({
        id: e.id || `exp-${Date.now()}-${i}`,
        company: e.company || '',
        role: e.role || '',
        location: e.location || '',
        startDate: e.startDate || '',
        endDate: e.endDate || '',
        currentlyWorking: e.currentlyWorking || false,
        description: e.description || '',
        responsibilities: Array.isArray(e.responsibilities) ? e.responsibilities : [],
        achievements: Array.isArray(e.achievements) ? e.achievements : [],
        technologies: Array.isArray(e.technologies) ? e.technologies : []
      })) : [],
      projects: Array.isArray(parsed?.projects) ? parsed.projects.map((p: any, i: number) => ({
        id: p.id || `proj-${Date.now()}-${i}`,
        name: p.name || '',
        description: p.description || '',
        role: p.role || '',
        technologies: Array.isArray(p.technologies) ? p.technologies : [],
        responsibilities: Array.isArray(p.responsibilities) ? p.responsibilities : [],
        achievements: Array.isArray(p.achievements) ? p.achievements : [],
        githubUrl: p.githubUrl || '',
        liveUrl: p.liveUrl || ''
      })) : [],
      skills: {
        programmingLanguages: Array.isArray(parsed?.skills?.programmingLanguages) ? parsed.skills.programmingLanguages : [],
        frameworks: Array.isArray(parsed?.skills?.frameworks) ? parsed.skills.frameworks : [],
        frontend: Array.isArray(parsed?.skills?.frontend) ? parsed.skills.frontend : [],
        backend: Array.isArray(parsed?.skills?.backend) ? parsed.skills.backend : [],
        databases: Array.isArray(parsed?.skills?.databases) ? parsed.skills.databases : [],
        cloud: Array.isArray(parsed?.skills?.cloud) ? parsed.skills.cloud : [],
        devops: Array.isArray(parsed?.skills?.devops) ? parsed.skills.devops : [],
        aiMl: Array.isArray(parsed?.skills?.aiMl) ? parsed.skills.aiMl : [],
        tools: Array.isArray(parsed?.skills?.tools) ? parsed.skills.tools : [],
        other: Array.isArray(parsed?.skills?.other) ? parsed.skills.other : []
      },
      education: Array.isArray(parsed?.education) ? parsed.education.map((edu: any, i: number) => ({
        id: edu.id || `edu-${Date.now()}-${i}`,
        degree: edu.degree || '',
        institution: edu.institution || '',
        location: edu.location || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        grade: edu.grade || ''
      })) : [],
      certifications: Array.isArray(parsed?.certifications) ? parsed.certifications.map((c: any, i: number) => ({
        id: c.id || `cert-${Date.now()}-${i}`,
        name: c.name || '',
        issuer: c.issuer || '',
        date: c.date || '',
        credentialUrl: c.credentialUrl || ''
      })) : [],
      achievements: Array.isArray(parsed?.achievements) ? parsed.achievements.map((a: any, i: number) => ({
        id: a.id || `ach-${Date.now()}-${i}`,
        title: a.title || '',
        description: a.description || '',
        date: a.date || ''
      })) : [],
      internships: [],
      publications: [],
      additionalInformation: [],
      lastUpdated: new Date().toISOString()
    };
  }

  private validateMasterResumeSchema(obj: any): { valid: boolean; error?: string } {
    if (!obj || typeof obj !== 'object') {
      return { valid: false, error: 'File content is not an object.' };
    }
    if (!obj.personalInfo || typeof obj.personalInfo !== 'object') {
      return { valid: false, error: 'Missing or invalid "personalInfo" object.' };
    }
    if (!obj.personalInfo.fullName) {
      return { valid: false, error: '"personalInfo.fullName" is required.' };
    }
    if (!Array.isArray(obj.professionalExperience)) {
      return { valid: false, error: '"professionalExperience" must be an array.' };
    }
    if (!Array.isArray(obj.projects)) {
      return { valid: false, error: '"projects" must be an array.' };
    }
    if (!obj.skills || typeof obj.skills !== 'object') {
      return { valid: false, error: 'Missing or invalid "skills" object.' };
    }
    return { valid: true };
  }
}
