import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { MasterResume } from '../models/master-resume.model';
import { GeneratedResume } from '../models/generated-resume.model';
import { JobAnalysis, KeywordMatchResult } from '../models/job-analysis.model';
import { GroqService } from './groq.service';
import { PromptService, GenerationOptions } from './prompt.service';
import { ToastService } from './toast.service';

export interface GenerationProgress {
  status: 'idle' | 'analyzing' | 'matching' | 'generating' | 'validating' | 'completed' | 'error';
  stepMessage: string;
  percent: number;
  errorDetail?: string;
  rawResponse?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResumeGeneratorService {

  private progressSubject = new BehaviorSubject<GenerationProgress>({
    status: 'idle',
    stepMessage: 'Ready',
    percent: 0
  });

  public progress$: Observable<GenerationProgress> = this.progressSubject.asObservable();

  private activeGeneratedResumeSubject = new BehaviorSubject<GeneratedResume | null>(null);
  public activeGeneratedResume$: Observable<GeneratedResume | null> = this.activeGeneratedResumeSubject.asObservable();

  private activeJobAnalysisSubject = new BehaviorSubject<JobAnalysis | null>(null);
  public activeJobAnalysis$: Observable<JobAnalysis | null> = this.activeJobAnalysisSubject.asObservable();

  constructor(
    private groqService: GroqService,
    private promptService: PromptService,
    private toastService: ToastService
  ) {}

  getProgress(): GenerationProgress {
    return this.progressSubject.getValue();
  }

  setActiveGeneratedResume(resume: GeneratedResume | null): void {
    this.activeGeneratedResumeSubject.next(resume);
  }

  getActiveGeneratedResume(): GeneratedResume | null {
    return this.activeGeneratedResumeSubject.getValue();
  }

  analyzeJobDescription(jobDescription: string): Observable<JobAnalysis> {
    this.updateProgress('analyzing', 'Analyzing Job Description with Groq AI...', 25);

    const systemPrompt = this.promptService.getJobAnalysisSystemPrompt();
    const userPrompt = this.promptService.getJobAnalysisUserPrompt(jobDescription);

    return this.groqService.createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]).pipe(
      map(rawResponse => {
        const parsed = this.safeParseJson<JobAnalysis>(rawResponse);
        if (!parsed) {
          throw new Error('Failed to parse structured Job Analysis JSON from AI response.');
        }
        this.activeJobAnalysisSubject.next(parsed);
        this.updateProgress('completed', 'Job Description analyzed successfully!', 100);
        this.toastService.success('Analysis Complete', 'Extracted job requirements and keywords.');
        return parsed;
      }),
      catchError(err => {
        this.updateProgress('error', 'Job Analysis failed.', 0, err.message);
        this.toastService.error('Analysis Error', err.message);
        return throwError(() => err);
      })
    );
  }

  generateTailoredResume(
    masterResume: MasterResume,
    jobDescription: string,
    options?: GenerationOptions
  ): Observable<GeneratedResume> {
    this.updateProgress('analyzing', 'Extracting Job Requirements...', 20);

    const systemPrompt = this.promptService.getResumeGenerationSystemPrompt();
    const userPrompt = this.promptService.getResumeGenerationUserPrompt(masterResume, jobDescription, options);

    return this.groqService.createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]).pipe(
      tap(() => this.updateProgress('generating', 'Generating factually grounded resume...', 70)),
      map(rawResponse => {
        this.updateProgress('validating', 'Validating AI response structure...', 90);

        const parsed = this.safeParseJson<GeneratedResume>(rawResponse);
        if (!parsed) {
          this.updateProgress('error', 'AI returned invalid JSON format.', 0, 'Response parsing error', rawResponse);
          throw new Error('AI returned an invalid JSON response format. Please try generating again.');
        }

        const validated = this.ensureResumeStructure(parsed, masterResume, options);
        this.activeGeneratedResumeSubject.next(validated);
        this.updateProgress('completed', 'Resume generated successfully!', 100);
        this.toastService.success('Resume Generated', 'Tailored resume is ready for review.');
        return validated;
      }),
      catchError(err => {
        this.updateProgress('error', 'Resume generation failed.', 0, err.message);
        this.toastService.error('Generation Failed', err.message);
        return throwError(() => err);
      })
    );
  }

  /**
   * Safely parses JSON string, stripping markdown code fences if present.
   */
  public safeParseJson<T>(raw: string): T | null {
    if (!raw) return null;
    let sanitized = raw.trim();

    // Strip markdown fences: ```json ... ``` or ``` ... ```
    if (sanitized.startsWith('```')) {
      sanitized = sanitized.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
    }

    // Try direct parse
    try {
      return JSON.parse(sanitized) as T;
    } catch (e) {
      // Try finding first '{' and last '}'
      const firstBrace = sanitized.indexOf('{');
      const lastBrace = sanitized.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const extracted = sanitized.substring(firstBrace, lastBrace + 1);
        try {
          return JSON.parse(extracted) as T;
        } catch (innerErr) {
          console.error('[ResumeGeneratorService] JSON extract parse error:', innerErr);
        }
      }
      console.error('[ResumeGeneratorService] JSON parse error:', e, 'Raw:', raw);
      return null;
    }
  }

  private ensureResumeStructure(parsed: any, master: MasterResume, options?: GenerationOptions): GeneratedResume {
    return {
      personalInfo: {
        fullName: parsed?.personalInfo?.fullName || master.personalInfo.fullName,
        professionalTitle: parsed?.personalInfo?.professionalTitle || master.personalInfo.professionalTitle,
        email: parsed?.personalInfo?.email || master.personalInfo.email,
        phone: parsed?.personalInfo?.phone || master.personalInfo.phone,
        location: parsed?.personalInfo?.location || master.personalInfo.location,
        linkedin: parsed?.personalInfo?.linkedin || master.personalInfo.linkedin,
        github: parsed?.personalInfo?.github || master.personalInfo.github,
        portfolio: parsed?.personalInfo?.portfolio || master.personalInfo.portfolio
      },
      professionalSummary: parsed?.professionalSummary || master.personalInfo.summary || '',
      skills: {
        languagesAndFrameworks: parsed?.skills?.languagesAndFrameworks || master.skills.programmingLanguages || [],
        technicalSkills: parsed?.skills?.technicalSkills || master.skills.frameworks || [],
        toolsAndTechnologies: parsed?.skills?.toolsAndTechnologies || master.skills.tools || [],
        coreCompetencies: parsed?.skills?.coreCompetencies || master.skills.other || []
      },
      experience: Array.isArray(parsed?.experience) ? parsed.experience : master.professionalExperience.map(e => ({
        company: e.company,
        role: e.role,
        location: e.location,
        startDate: e.startDate,
        endDate: e.endDate,
        bulletPoints: e.responsibilities
      })),
      projects: Array.isArray(parsed?.projects) ? parsed.projects : master.projects.map(p => ({
        name: p.name,
        description: p.description,
        technologies: p.technologies,
        bulletPoints: p.responsibilities
      })),
      education: Array.isArray(parsed?.education) ? parsed.education : master.education,
      certifications: Array.isArray(parsed?.certifications) ? parsed.certifications : master.certifications,
      achievements: Array.isArray(parsed?.achievements) ? parsed.achievements : master.achievements,
      jobAnalysis: this.activeJobAnalysisSubject.getValue() || undefined,
      generationOptions: {
        jobTitle: options?.jobTitle,
        companyName: options?.companyName,
        resumeStyle: options?.resumeStyle,
        targetLength: options?.targetLength,
        focusArea: options?.focusArea,
        generatedAt: new Date().toISOString()
      }
    };
  }

  calculateKeywordMatch(jobAnalysis: JobAnalysis | null, masterResume: MasterResume): KeywordMatchResult {
    if (!jobAnalysis || !jobAnalysis.keywords) {
      return { matchedKeywords: [], missingKeywords: [], relatedTerms: [], matchPercentage: 0 };
    }

    const masterText = [
      masterResume.personalInfo.summary,
      ...masterResume.professionalExperience.flatMap(e => [e.company, e.role, e.description, ...e.responsibilities, ...e.technologies, ...e.achievements]),
      ...masterResume.projects.flatMap(p => [p.name, p.description, ...p.technologies, ...p.responsibilities]),
      ...Object.values(masterResume.skills).flat(),
      ...masterResume.education.map(ed => ed.degree + ' ' + ed.institution),
      ...masterResume.certifications.map(c => c.name)
    ].join(' ').toLowerCase();

    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    jobAnalysis.keywords.forEach(kw => {
      if (!kw) return;
      const cleanKw = kw.toLowerCase().trim();
      if (masterText.includes(cleanKw)) {
        matchedKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    });

    const total = matchedKeywords.length + missingKeywords.length;
    const matchPercentage = total > 0 ? Math.round((matchedKeywords.length / total) * 100) : 0;

    return {
      matchedKeywords,
      missingKeywords,
      relatedTerms: jobAnalysis.technologies || [],
      matchPercentage
    };
  }

  private updateProgress(
    status: GenerationProgress['status'],
    stepMessage: string,
    percent: number,
    errorDetail?: string,
    rawResponse?: string
  ): void {
    this.progressSubject.next({
      status,
      stepMessage,
      percent,
      errorDetail,
      rawResponse
    });
  }
}
