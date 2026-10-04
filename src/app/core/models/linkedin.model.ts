export interface LinkedInExperience {
  role: string;
  company: string;
  duration?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  description?: string;
  bulletPoints: string[];
}

export interface LinkedInProfile {
  fullName: string;
  currentHeadline: string;
  location?: string;
  industry?: string;
  about: string;
  experiences: LinkedInExperience[];
  skills: string[];
  education?: string[];
  certifications?: string[];
  rawText?: string;
}

export interface LinkedInHeadlineOption {
  type: 'search_optimized' | 'value_proposition' | 'technical_authority';
  title: string;
  headline: string;
  charCount: number;
  explanation: string;
}

export interface LinkedInAboutOption {
  type: 'career_narrative' | 'punchy_executive';
  title: string;
  aboutText: string;
  hook: string;
  coreHighlights: string[];
  callToAction: string;
}

export interface LinkedInExperienceOptimization {
  company: string;
  role: string;
  originalBullets: string[];
  optimizedBullets: string[];
  masterResumeGapsFound: string[];
  impactExplanation: string;
}

export interface LinkedInSkillsOptimization {
  top5PinnedSkills: string[];
  missingHighValueSkills: string[];
  categorizedSkills: {
    category: string;
    skills: string[];
  }[];
  recommendedRemovalOrDeprioritize?: string[];
}

export interface LinkedInProfileAudit {
  overallScore: number;
  headlineScore: number;
  aboutScore: number;
  experienceScore: number;
  skillsScore: number;
  summaryAssessment: string;
  keyActionItems: string[];
}

export interface LinkedInOptimizationResult {
  audit: LinkedInProfileAudit;
  headlineOptions: LinkedInHeadlineOption[];
  aboutOptions: LinkedInAboutOption[];
  experienceOptimizations: LinkedInExperienceOptimization[];
  skillsOptimization: LinkedInSkillsOptimization;
  generatedAt: string;
}
