import { JobAnalysis } from './job-analysis.model';

export interface SourceMapping {
  targetField: string;
  sourceSection: string;
  sourceId?: string;
  sourceText?: string;
}

export interface GeneratedExperience {
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  bulletPoints: string[];
  sourceMappings?: SourceMapping[];
}

export interface GeneratedProject {
  name: string;
  description: string;
  technologies: string[];
  bulletPoints: string[];
  sourceMappings?: SourceMapping[];
}

export interface GeneratedEducation {
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  grade?: string;
}

export interface GeneratedCertification {
  name: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
}

export interface GeneratedAchievement {
  title: string;
  description: string;
  date?: string;
}

export interface GeneratedResume {
  personalInfo: {
    fullName: string;
    professionalTitle: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  professionalSummary: string;
  skills: {
    languagesAndFrameworks: string[];
    technicalSkills: string[];
    toolsAndTechnologies: string[];
    coreCompetencies: string[];
  };
  experience: GeneratedExperience[];
  projects: GeneratedProject[];
  education: GeneratedEducation[];
  certifications: GeneratedCertification[];
  achievements: GeneratedAchievement[];
  jobAnalysis?: JobAnalysis;
  generationOptions?: {
    jobTitle?: string;
    companyName?: string;
    resumeStyle?: string;
    targetLength?: string;
    focusArea?: string;
    generatedAt?: string;
  };
}
