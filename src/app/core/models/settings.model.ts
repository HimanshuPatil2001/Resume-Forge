export type ResumeTemplateType = 'ats-minimal' | 'professional' | 'modern';
export type AppTheme = 'dark' | 'light';

export interface GroqConfig {
  provider: 'groq';
  apiKey: string;
  model: string;
  temperature: number;
  baseUrl: string;
}

export interface AppSettings {
  groq: GroqConfig;
  theme: AppTheme;
  defaultTemplate: ResumeTemplateType;
  defaultStyle: 'ATS Friendly' | 'Professional' | 'Modern' | 'Minimal';
  defaultLength: '1 Page' | '2 Pages' | 'Auto';
  defaultFocus: 'Balanced' | 'Technical' | 'Experience' | 'Projects';
}
