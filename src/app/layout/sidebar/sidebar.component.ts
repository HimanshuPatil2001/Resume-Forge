import { Component } from '@angular/core';
import { LayoutService } from '../../core/services/layout.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  template: `
    <!-- MOBILE BACKDROP -->
    <div 
      class="sidebar-backdrop" 
      *ngIf="isMobileOpen$ | async" 
      (click)="closeMobileMenu()"
    ></div>

    <aside 
      class="sidebar" 
      [class.collapsed]="isCollapsed"
      [class.mobile-open]="isMobileOpen$ | async"
    >
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">⚡</span>
          <span class="logo-text" *ngIf="!isCollapsed || (isMobileOpen$ | async)">ResumeForge <span class="ai-badge">AI</span></span>
        </div>
        
        <!-- Desktop Collapse Button -->
        <button class="toggle-btn" (click)="toggleCollapse()" title="Toggle Sidebar">
          <span>{{ isCollapsed ? '❯' : '❮' }}</span>
        </button>

        <!-- Mobile Close Drawer Button -->
        <button class="close-mobile-btn" (click)="closeMobileMenu()" title="Close Menu">
          ✕
        </button>
      </div>

      <nav class="nav-menu">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" (click)="onNavItemClick()">
          <span class="nav-icon">📊</span>
          <span class="nav-text" *ngIf="!isCollapsed || (isMobileOpen$ | async)">Dashboard</span>
        </a>

        <a routerLink="/master-resume" routerLinkActive="active" class="nav-item" (click)="onNavItemClick()">
          <span class="nav-icon">📁</span>
          <span class="nav-text" *ngIf="!isCollapsed || (isMobileOpen$ | async)">Master Resume</span>
        </a>

        <a routerLink="/create-resume" routerLinkActive="active" class="nav-item" (click)="onNavItemClick()">
          <span class="nav-icon">✨</span>
          <span class="nav-text" *ngIf="!isCollapsed || (isMobileOpen$ | async)">Create Resume</span>
        </a>

        <a routerLink="/linkedin-optimizer" routerLinkActive="active" class="nav-item" (click)="onNavItemClick()">
          <span class="nav-icon">🔗</span>
          <span class="nav-text" *ngIf="!isCollapsed || (isMobileOpen$ | async)">LinkedIn Optimizer</span>
        </a>

        <a routerLink="/drafts" routerLinkActive="active" class="nav-item" (click)="onNavItemClick()">
          <span class="nav-icon">📑</span>
          <span class="nav-text" *ngIf="!isCollapsed || (isMobileOpen$ | async)">Drafts Library</span>
        </a>

        <a routerLink="/settings" routerLinkActive="active" class="nav-item" (click)="onNavItemClick()">
          <span class="nav-icon">⚙️</span>
          <span class="nav-text" *ngIf="!isCollapsed || (isMobileOpen$ | async)">Settings</span>
        </a>
      </nav>

      <div class="sidebar-footer" *ngIf="!isCollapsed || (isMobileOpen$ | async)">
        <div class="footer-info">
          <span class="status-indicator"></span>
          <span>Groq AI Ready</span>
        </div>
        <div class="version">v1.0.0 (Frontend Only)</div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      height: 100vh;
      background: var(--bg-sidebar, #0f172a);
      border-right: 1px solid var(--border-color, rgba(255,255,255,0.08));
      display: flex;
      flex-direction: column;
      transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .sidebar.collapsed {
      width: 72px;
    }
    .sidebar-header {
      padding: 20px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 700;
      font-size: 17px;
      color: var(--text-main, #f8fafc);
    }
    .logo-icon {
      font-size: 20px;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .ai-badge {
      font-size: 10px;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: #ffffff;
      padding: 2px 6px;
      border-radius: 4px;
      vertical-align: middle;
      font-weight: 800;
    }
    .toggle-btn {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      color: var(--text-muted, #94a3b8);
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 12px;
    }
    .toggle-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
    
    .close-mobile-btn {
      display: none;
    }

    .nav-menu {
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
      overflow-y: auto;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 10px;
      color: var(--text-muted, #94a3b8);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .nav-item:hover {
      background: var(--bg-hover, rgba(255,255,255,0.05));
      color: var(--text-main, #f8fafc);
    }
    .nav-item.active {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2));
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.3);
      font-weight: 600;
    }
    .nav-icon {
      font-size: 18px;
      width: 24px;
      text-align: center;
    }
    .sidebar-footer {
      padding: 16px 18px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .footer-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #34d399;
      font-weight: 500;
      margin-bottom: 4px;
    }
    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }
    .version {
      font-size: 11px;
      color: var(--text-muted, #64748b);
    }

    .sidebar-backdrop {
      display: none;
    }

    /* MOBILE DRAWER STYLES */
    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        height: 100vh;
        width: 280px !important;
        max-width: 85vw;
        z-index: 1050;
        transform: translateX(-100%);
        box-shadow: none;
      }
      .sidebar.mobile-open {
        transform: translateX(0);
        box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);
      }
      .toggle-btn {
        display: none;
      }
      .close-mobile-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #f8fafc;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        font-size: 14px;
        cursor: pointer;
      }
      .close-mobile-btn:hover {
        background: rgba(255, 255, 255, 0.15);
      }
      .sidebar-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(4px);
        z-index: 1040;
        animation: fadeIn 0.2s ease-out;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    }
  `]
})
export class SidebarComponent {
  isCollapsed = false;
  isMobileOpen$: Observable<boolean>;

  constructor(private layoutService: LayoutService) {
    this.isMobileOpen$ = this.layoutService.isMobileMenuOpen$;
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  closeMobileMenu(): void {
    this.layoutService.closeMobileMenu();
  }

  onNavItemClick(): void {
    this.layoutService.closeMobileMenu();
  }
}
