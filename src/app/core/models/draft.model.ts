import { GeneratedResume } from './generated-resume.model';
import { ResumeTemplateType } from './settings.model';

export interface ResumeDraft {
  id: string;
  jobTitle: string;
  companyName: string;
  createdAt: string;
  updatedAt: string;
  resumeData: GeneratedResume;
  template: ResumeTemplateType;
  rawJobDescription?: string;
}
