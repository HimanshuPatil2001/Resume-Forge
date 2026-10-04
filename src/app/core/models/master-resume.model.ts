export interface PersonalInfo {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  summary: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  role: string;
  technologies: string[];
  responsibilities: string[];
  achievements: string[];
  githubUrl: string;
  liveUrl: string;
}

export interface SkillsCategory {
  programmingLanguages: string[];
  frameworks: string[];
  frontend: string[];
  backend: string[];
  databases: string[];
  cloud: string[];
  devops: string[];
  aiMl: string[];
  tools: string[];
  other: string[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  grade: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialUrl: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
}

export interface Internship {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
  technologies: string[];
}

export interface Publication {
  id: string;
  title: string;
  publisher: string;
  date: string;
  url: string;
  description: string;
}

export interface AdditionalInfo {
  id: string;
  category: string;
  details: string;
}

export interface MasterResume {
  personalInfo: PersonalInfo;
  professionalExperience: Experience[];
  projects: Project[];
  skills: SkillsCategory;
  education: Education[];
  certifications: Certification[];
  achievements: Achievement[];
  internships: Internship[];
  publications: Publication[];
  additionalInformation: AdditionalInfo[];
  lastUpdated?: string;
}

export interface StoredMasterResume {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  data: MasterResume;
}

