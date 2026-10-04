import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Layout
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { TopbarComponent } from './layout/topbar/topbar.component';

// Shared Components
import { ToastComponent } from './shared/components/toast/toast.component';
import { ConfirmationDialogComponent } from './shared/components/confirmation-dialog/confirmation-dialog.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { KeywordMatchComponent } from './shared/components/keyword-match/keyword-match.component';
import { JobAnalysisCardComponent } from './shared/components/job-analysis-card/job-analysis-card.component';

// Templates
import { AtsMinimalTemplateComponent } from './shared/components/templates/ats-minimal/ats-minimal.component';
import { ProfessionalTemplateComponent } from './shared/components/templates/professional/professional.component';
import { ModernTemplateComponent } from './shared/components/templates/modern/modern.component';
import { ResumePreviewContainerComponent } from './shared/components/templates/resume-preview-container/resume-preview-container.component';

// Features
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MasterResumeComponent } from './features/master-resume/master-resume.component';
import { CreateResumeComponent } from './features/create-resume/create-resume.component';
import { ResumeEditorComponent } from './features/resume-editor/resume-editor.component';
import { DraftsComponent } from './features/drafts/drafts.component';
import { SettingsComponent } from './features/settings/settings.component';
import { LinkedInOptimizerComponent } from './features/linkedin-optimizer/linkedin-optimizer.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    TopbarComponent,
    ToastComponent,
    ConfirmationDialogComponent,
    LoadingSpinnerComponent,
    KeywordMatchComponent,
    JobAnalysisCardComponent,
    AtsMinimalTemplateComponent,
    ProfessionalTemplateComponent,
    ModernTemplateComponent,
    ResumePreviewContainerComponent,
    DashboardComponent,
    MasterResumeComponent,
    CreateResumeComponent,
    ResumeEditorComponent,
    DraftsComponent,
    SettingsComponent,
    LinkedInOptimizerComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
