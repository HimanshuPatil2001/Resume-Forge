import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../core/services/settings.service';
import { MasterResumeService } from '../../core/services/master-resume.service';
import { LayoutService } from '../../core/services/layout.service';
import { AppTheme } from '../../core/models/settings.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-topbar',
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <!-- Mobile Hamburger Button -->
        <button class="hamburger-btn" (click)="toggleMobileMenu()" title="Open Navigation Menu">
          <span>☰</span>
        </button>

        <h2 class="app-title">ResumeForge <span class="ai-pill">AI</span></h2>
        <span class="sub-tag">Frontend Resume Engine</span>
      </div>

      <div class="topbar-right">
        <div class="master-status-badge" [class.ready]="hasMasterResume$ | async">
          <span class="badge-dot"></span>
          <span class="badge-text-full">Master Resume: {{ (hasMasterResume$ | async) ? 'Ready' : 'Incomplete' }}</span>
          <span class="badge-text-short">{{ (hasMasterResume$ | async) ? 'Master Ready' : 'Incomplete' }}</span>
        </div>

        <button class="theme-btn" (click)="toggleTheme()" [title]="'Switch to ' + (currentTheme === 'dark' ? 'Light' : 'Dark') + ' Mode'">
          <span *ngIf="currentTheme === 'dark'">☀️ <span class="theme-text">Light</span></span>
          <span *ngIf="currentTheme === 'light'">🌙 <span class="theme-text">Dark</span></span>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: 64px;
      background: var(--bg-topbar, #0f172a);
      border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.08));
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 90;
      box-sizing: border-box;
      width: 100%;
    }
    .topbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .hamburger-btn {
      display: none;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.06);
      border: 1px solid var(--border-color, rgba(255,255,255,0.12));
      color: var(--text-main, #f8fafc);
      width: 38px;
      height: 38px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 20px;
      transition: background 0.2s ease;
    }
    .hamburger-btn:hover {
      background: rgba(255,255,255,0.12);
    }
    .app-title {
      font-size: 18px;
      font-weight: 700;
      margin: 0;
      color: var(--text-main, #f8fafc);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .ai-pill {
      font-size: 10px;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: #ffffff;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 800;
    }
    .sub-tag {
      font-size: 11px;
      background: rgba(255,255,255,0.06);
      color: var(--text-muted, #94a3b8);
      padding: 3px 8px;
      border-radius: 6px;
    }
    .topbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .master-status-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 999px;
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
      white-space: nowrap;
    }
    .master-status-badge.ready {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      flex-shrink: 0;
    }
    .badge-text-short {
      display: none;
    }
    .theme-btn {
      background: var(--bg-hover, #1e293b);
      border: 1px solid var(--border-color, rgba(255,255,255,0.12));
      color: var(--text-main, #f8fafc);
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .theme-btn:hover {
      background: rgba(255,255,255,0.1);
    }

    /* RESPONSIVE TOPBAR */
    @media (max-width: 768px) {
      .topbar {
        padding: 0 14px;
        height: 58px;
      }
      .hamburger-btn {
        display: flex;
      }
      .sub-tag {
        display: none;
      }
      .badge-text-full {
        display: none;
      }
      .badge-text-short {
        display: inline;
      }
    }

    @media (max-width: 480px) {
      .topbar {
        padding: 0 10px;
      }
      .app-title {
        font-size: 15px;
      }
      .master-status-badge {
        padding: 5px 8px;
        font-size: 11px;
      }
      .theme-text {
        display: none;
      }
      .theme-btn {
        padding: 6px 10px;
        font-size: 14px;
      }
    }
  `]
})
export class TopbarComponent implements OnInit {
  currentTheme: AppTheme = 'dark';
  hasMasterResume$: Observable<boolean>;

  constructor(
    private settingsService: SettingsService,
    private masterResumeService: MasterResumeService,
    private layoutService: LayoutService
  ) {
    this.hasMasterResume$ = this.masterResumeService.masterResume$.pipe(
      map(m => !!(m && m.personalInfo && m.personalInfo.fullName && m.professionalExperience && m.professionalExperience.length > 0))
    );
  }

  ngOnInit(): void {
    this.settingsService.settings$.subscribe(s => {
      this.currentTheme = s.theme;
    });
  }

  toggleTheme(): void {
    this.settingsService.toggleTheme();
  }

  toggleMobileMenu(): void {
    this.layoutService.toggleMobileMenu();
  }
}
