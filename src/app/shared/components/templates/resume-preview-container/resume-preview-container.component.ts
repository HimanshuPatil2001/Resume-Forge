import { Component, Input } from '@angular/core';
import { GeneratedResume } from '../../../../core/models/generated-resume.model';
import { ResumeTemplateType } from '../../../../core/models/settings.model';

@Component({
  selector: 'app-resume-preview-container',
  template: `
    <div class="preview-wrapper">
      <app-ats-minimal-template 
        *ngIf="template === 'ats-minimal'" 
        [resume]="resume"
      ></app-ats-minimal-template>

      <app-professional-template 
        *ngIf="template === 'professional'" 
        [resume]="resume"
      ></app-professional-template>

      <app-modern-template 
        *ngIf="template === 'modern'" 
        [resume]="resume"
      ></app-modern-template>
    </div>
  `,
  styles: [`
    .preview-wrapper {
      width: 100%;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }
  `]
})
export class ResumePreviewContainerComponent {
  @Input() resume: GeneratedResume | null = null;
  @Input() template: ResumeTemplateType = 'ats-minimal';
}
