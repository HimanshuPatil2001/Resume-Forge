import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MasterResumeComponent } from './features/master-resume/master-resume.component';
import { CreateResumeComponent } from './features/create-resume/create-resume.component';
import { ResumeEditorComponent } from './features/resume-editor/resume-editor.component';
import { DraftsComponent } from './features/drafts/drafts.component';
import { SettingsComponent } from './features/settings/settings.component';
import { LinkedInOptimizerComponent } from './features/linkedin-optimizer/linkedin-optimizer.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'master-resume', component: MasterResumeComponent },
  { path: 'create-resume', component: CreateResumeComponent },
  { path: 'linkedin-optimizer', component: LinkedInOptimizerComponent },
  { path: 'resume-editor', component: ResumeEditorComponent },
  { path: 'drafts', component: DraftsComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
