export interface JobAnalysis {
  jobTitle: string;
  companyName?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  technologies: string[];
  responsibilities: string[];
  experienceRequirements: string[];
  educationRequirements: string[];
  keywords: string[];
  domainIndustry: string[];
  importantPhrases: string[];
}

export interface KeywordMatchResult {
  matchedKeywords: string[];
  missingKeywords: string[];
  relatedTerms: string[];
  matchPercentage: number;
}
