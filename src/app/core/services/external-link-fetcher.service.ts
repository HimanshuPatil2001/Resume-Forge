import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MasterResume, Project } from '../models/master-resume.model';

export interface DetectedLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  otherUrls: string[];
}

export interface GitHubRepo {
  name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  topics?: string[];
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExternalLinkFetcherService {

  constructor(
    private http: HttpClient
  ) {}

  isSampleUrl(url: string): boolean {
    if (!url) return true;
    const lower = url.toLowerCase();
    return lower.includes('johndeveloper-sample') || lower.includes('johndeveloper.dev') || lower.includes('john.developer@example.com');
  }

  detectLinksInResume(resume: MasterResume): DetectedLinks {
    const links: DetectedLinks = {
      otherUrls: []
    };

    if (resume.personalInfo?.linkedin && resume.personalInfo.linkedin.trim() && !this.isSampleUrl(resume.personalInfo.linkedin)) {
      links.linkedin = resume.personalInfo.linkedin.trim();
    }
    if (resume.personalInfo?.github && resume.personalInfo.github.trim() && !this.isSampleUrl(resume.personalInfo.github)) {
      links.github = resume.personalInfo.github.trim();
    }
    if (resume.personalInfo?.portfolio && resume.personalInfo.portfolio.trim() && !this.isSampleUrl(resume.personalInfo.portfolio)) {
      links.portfolio = resume.personalInfo.portfolio.trim();
    }

    const textToScan = [
      resume.personalInfo?.summary || '',
      ...(resume.projects || []).map(p => `${p.githubUrl || ''} ${p.liveUrl || ''}`)
    ].join(' ');

    const urlRegex = /(https?:\/\/[^\s,]+)/g;
    const matches = textToScan.match(urlRegex) || [];
    
    matches.forEach(url => {
      const cleanUrl = url.replace(/[).;]*$/, '');
      if (this.isSampleUrl(cleanUrl)) return;

      if (cleanUrl.includes('github.com') && !links.github) {
        links.github = cleanUrl;
      } else if (cleanUrl.includes('linkedin.com') && !links.linkedin) {
        links.linkedin = cleanUrl;
      } else if (!links.portfolio && !cleanUrl.includes('github.com') && !cleanUrl.includes('linkedin.com') && !cleanUrl.includes('google.com') && !cleanUrl.includes('w3.org')) {
        if (!links.otherUrls.includes(cleanUrl)) {
          links.otherUrls.push(cleanUrl);
        }
      }
    });

    return links;
  }

  hasValidLinks(links: DetectedLinks): boolean {
    return !!(links.github || links.linkedin || links.portfolio || (links.otherUrls && links.otherUrls.length > 0));
  }

  fetchGitHubRepos(githubUrl: string): Observable<Project[]> {
    if (this.isSampleUrl(githubUrl)) return of([]);

    const cleaned = githubUrl.replace(/\/$/, '');
    const parts = cleaned.split('github.com/');
    if (parts.length < 2) {
      return of([]);
    }
    
    const username = parts[1].split('/')[0];
    if (!username || username === 'johndeveloper-sample') return of([]);

    const apiUrl = `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`;

    return this.http.get<GitHubRepo[]>(apiUrl).pipe(
      map(repos => {
        if (!Array.isArray(repos)) return [];

        return repos
          .filter(r => !r.description || !r.description.toLowerCase().includes('forked from'))
          .slice(0, 5)
          .map((repo, i) => {
            const formattedName = repo.name
              .replace(/[-_]/g, ' ')
              .replace(/\b\w/g, char => char.toUpperCase());

            return {
              id: `github-proj-${Date.now()}-${i}`,
              name: formattedName,
              description: repo.description || `Public GitHub repository (${repo.stargazers_count} stars).`,
              role: 'Author / Creator',
              technologies: repo.language ? [repo.language] : [],
              responsibilities: [
                `Developed and maintained GitHub open-source repository ${repo.name}.`,
                `Implemented project features using ${repo.language || 'modern web technologies'}.`
              ],
              achievements: repo.stargazers_count > 0 ? [`Earned ${repo.stargazers_count} GitHub stars.`] : [],
              githubUrl: repo.html_url,
              liveUrl: ''
            };
          });
      }),
      catchError(err => {
        console.warn('[ExternalLinkFetcherService] GitHub API fetch notice:', err);
        return of([]);
      })
    );
  }

  enrichMasterResumeWithLinks(resume: MasterResume, links: DetectedLinks): Observable<MasterResume> {
    const updatedResume: MasterResume = JSON.parse(JSON.stringify(resume));
    const tasks: Observable<any>[] = [];

    if (links.github && !this.isSampleUrl(links.github)) {
      tasks.push(
        this.fetchGitHubRepos(links.github).pipe(
          map(githubProjects => {
            if (githubProjects.length > 0) {
              if (!updatedResume.projects) updatedResume.projects = [];
              const existingNames = new Set(updatedResume.projects.map(p => p.name.toLowerCase()));

              githubProjects.forEach(gp => {
                if (!existingNames.has(gp.name.toLowerCase())) {
                  updatedResume.projects.unshift(gp);
                  if (!updatedResume.skills) {
                    updatedResume.skills = {
                      programmingLanguages: [],
                      frameworks: [],
                      frontend: [],
                      backend: [],
                      databases: [],
                      cloud: [],
                      devops: [],
                      aiMl: [],
                      tools: [],
                      other: []
                    };
                  }
                  gp.technologies.forEach(tech => {
                    if (tech && !updatedResume.skills.programmingLanguages.includes(tech)) {
                      updatedResume.skills.programmingLanguages.push(tech);
                    }
                  });
                }
              });
            }
          })
        )
      );
    }

    if (tasks.length === 0) {
      return of(updatedResume);
    }

    return forkJoin(tasks).pipe(
      map(() => updatedResume),
      catchError(() => of(updatedResume))
    );
  }
}
