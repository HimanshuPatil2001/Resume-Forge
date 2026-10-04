import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { GroqService } from './groq.service';
import { PromptService } from './prompt.service';
import { ResumeGeneratorService } from './resume-generator.service';
import { ToastService } from './toast.service';
import { MasterResume } from '../models/master-resume.model';
import {
  LinkedInProfile,
  LinkedInOptimizationResult
} from '../models/linkedin.model';
import { SAMPLE_LINKEDIN_PROFILE } from '../data/sample-linkedin-profile';

@Injectable({
  providedIn: 'root'
})
export class LinkedInOptimizerService {
  private activeProfileSubject = new BehaviorSubject<LinkedInProfile | null>(null);
  public activeProfile$: Observable<LinkedInProfile | null> = this.activeProfileSubject.asObservable();

  private activeResultSubject = new BehaviorSubject<LinkedInOptimizationResult | null>(null);
  public activeResult$: Observable<LinkedInOptimizationResult | null> = this.activeResultSubject.asObservable();

  private isParsingSubject = new BehaviorSubject<boolean>(false);
  public isParsing$: Observable<boolean> = this.isParsingSubject.asObservable();

  private isOptimizingSubject = new BehaviorSubject<boolean>(false);
  public isOptimizing$: Observable<boolean> = this.isOptimizingSubject.asObservable();

  constructor(
    private groqService: GroqService,
    private promptService: PromptService,
    private generatorService: ResumeGeneratorService,
    private toastService: ToastService
  ) {}

  getActiveProfile(): LinkedInProfile | null {
    return this.activeProfileSubject.getValue();
  }

  setActiveProfile(profile: LinkedInProfile | null): void {
    this.activeProfileSubject.next(profile);
  }

  getActiveResult(): LinkedInOptimizationResult | null {
    return this.activeResultSubject.getValue();
  }

  setSampleProfile(): void {
    const sample = JSON.parse(JSON.stringify(SAMPLE_LINKEDIN_PROFILE));
    this.activeProfileSubject.next(sample);
    this.activeResultSubject.next(null);
    this.toastService.info('Sample Loaded', 'Loaded sample LinkedIn profile for demo.');
  }

  parseLinkedInProfile(rawText: string): Observable<LinkedInProfile> {
    if (!rawText || !rawText.trim()) {
      return throwError(() => new Error('LinkedIn text is empty.'));
    }

    this.isParsingSubject.next(true);

    const systemPrompt = this.promptService.getLinkedInProfileParsingSystemPrompt();
    const userPrompt = this.promptService.getLinkedInProfileParsingUserPrompt(rawText);

    return this.groqService.createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]).pipe(
      map(rawResponse => {
        const parsed = this.generatorService.safeParseJson<LinkedInProfile>(rawResponse);
        if (!parsed || !parsed.fullName) {
          throw new Error('AI could not extract structured LinkedIn profile from provided text. Please ensure you copied your profile page text.');
        }

        const normalized: LinkedInProfile = {
          fullName: parsed.fullName || 'LinkedIn User',
          currentHeadline: parsed.currentHeadline || '',
          location: parsed.location || '',
          industry: parsed.industry || '',
          about: parsed.about || '',
          experiences: Array.isArray(parsed.experiences) ? parsed.experiences.map(e => ({
            role: e.role || '',
            company: e.company || '',
            duration: e.duration || '',
            startDate: e.startDate || '',
            endDate: e.endDate || '',
            location: e.location || '',
            description: e.description || '',
            bulletPoints: Array.isArray(e.bulletPoints) ? e.bulletPoints : (e.description ? [e.description] : [])
          })) : [],
          skills: Array.isArray(parsed.skills) ? parsed.skills : [],
          education: Array.isArray(parsed.education) ? parsed.education : [],
          certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
          rawText: rawText
        };

        this.activeProfileSubject.next(normalized);
        this.activeResultSubject.next(null);
        this.toastService.success('LinkedIn Extracted', `Successfully parsed profile for ${normalized.fullName}.`);
        return normalized;
      }),
      tap({
        next: () => this.isParsingSubject.next(false),
        error: (err) => {
          this.isParsingSubject.next(false);
          this.toastService.error('Extraction Error', err.message);
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  optimizeLinkedIn(
    linkedInProfile: LinkedInProfile,
    masterResume: MasterResume
  ): Observable<LinkedInOptimizationResult> {
    this.isOptimizingSubject.next(true);

    const systemPrompt = this.promptService.getLinkedInOptimizationSystemPrompt();
    const userPrompt = this.promptService.getLinkedInOptimizationUserPrompt(linkedInProfile, masterResume);

    return this.groqService.createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]).pipe(
      map(rawResponse => {
        const parsed = this.generatorService.safeParseJson<LinkedInOptimizationResult>(rawResponse);
        if (!parsed || !parsed.audit || !parsed.headlineOptions) {
          throw new Error('AI returned an invalid optimization format. Please try running optimization again.');
        }

        const result: LinkedInOptimizationResult = {
          audit: {
            overallScore: parsed.audit.overallScore ?? 75,
            headlineScore: parsed.audit.headlineScore ?? 70,
            aboutScore: parsed.audit.aboutScore ?? 70,
            experienceScore: parsed.audit.experienceScore ?? 75,
            skillsScore: parsed.audit.skillsScore ?? 70,
            summaryAssessment: parsed.audit.summaryAssessment || 'Profile reviewed against Master Resume.',
            keyActionItems: Array.isArray(parsed.audit.keyActionItems) ? parsed.audit.keyActionItems : []
          },
          headlineOptions: Array.isArray(parsed.headlineOptions) ? parsed.headlineOptions.map(h => ({
            type: h.type || 'search_optimized',
            title: h.title || 'Headline Option',
            headline: h.headline || '',
            charCount: (h.headline || '').length,
            explanation: h.explanation || ''
          })) : [],
          aboutOptions: Array.isArray(parsed.aboutOptions) ? parsed.aboutOptions : [],
          experienceOptimizations: Array.isArray(parsed.experienceOptimizations) ? parsed.experienceOptimizations : [],
          skillsOptimization: {
            top5PinnedSkills: Array.isArray(parsed.skillsOptimization?.top5PinnedSkills) ? parsed.skillsOptimization.top5PinnedSkills : [],
            missingHighValueSkills: Array.isArray(parsed.skillsOptimization?.missingHighValueSkills) ? parsed.skillsOptimization.missingHighValueSkills : [],
            categorizedSkills: Array.isArray(parsed.skillsOptimization?.categorizedSkills) ? parsed.skillsOptimization.categorizedSkills : [],
            recommendedRemovalOrDeprioritize: parsed.skillsOptimization?.recommendedRemovalOrDeprioritize || []
          },
          generatedAt: new Date().toISOString()
        };

        this.activeResultSubject.next(result);
        this.toastService.success('LinkedIn Optimized!', 'Generated recruiter headlines, story-driven About, and experience upgrades.');
        return result;
      }),
      tap({
        next: () => this.isOptimizingSubject.next(false),
        error: (err) => {
          this.isOptimizingSubject.next(false);
          this.toastService.error('Optimization Failed', err.message);
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  mergeLinkedInIntoMasterResume(profile: LinkedInProfile, currentMaster: MasterResume): MasterResume {
    const updated: MasterResume = JSON.parse(JSON.stringify(currentMaster));

    // Fill in personal info if missing
    if (!updated.personalInfo.fullName && profile.fullName) {
      updated.personalInfo.fullName = profile.fullName;
    }
    if (!updated.personalInfo.professionalTitle && profile.currentHeadline) {
      updated.personalInfo.professionalTitle = profile.currentHeadline;
    }
    if (!updated.personalInfo.summary && profile.about) {
      updated.personalInfo.summary = profile.about;
    }
    if (!updated.personalInfo.location && profile.location) {
      updated.personalInfo.location = profile.location;
    }

    // Merge skills: add any LinkedIn skills that aren't already in other category
    if (profile.skills && profile.skills.length > 0) {
      const existingAllSkills = new Set(
        Object.values(updated.skills).flat().map(s => s.toLowerCase().trim())
      );
      profile.skills.forEach(skill => {
        if (skill && !existingAllSkills.has(skill.toLowerCase().trim())) {
          updated.skills.other.push(skill);
          existingAllSkills.add(skill.toLowerCase().trim());
        }
      });
    }

    // Merge experiences if candidate has no experience in master resume
    if (updated.professionalExperience.length === 0 && profile.experiences.length > 0) {
      profile.experiences.forEach((exp, idx) => {
        updated.professionalExperience.push({
          id: `exp-${Date.now()}-${idx}`,
          company: exp.company,
          role: exp.role,
          location: exp.location || '',
          startDate: exp.startDate || exp.duration || '',
          endDate: exp.endDate || '',
          currentlyWorking: (exp.endDate || exp.duration || '').toLowerCase().includes('present'),
          description: exp.description || '',
          responsibilities: exp.bulletPoints || [],
          achievements: [],
          technologies: []
        });
      });
    }

    updated.lastUpdated = new Date().toISOString();
    return updated;
  }

  clear(): void {
    this.activeProfileSubject.next(null);
    this.activeResultSubject.next(null);
  }
}
