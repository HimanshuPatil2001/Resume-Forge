import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../core/services/settings.service';
import { GroqService } from '../../core/services/groq.service';
import { ToastService } from '../../core/services/toast.service';
import { AppSettings, ResumeTemplateType, AppTheme } from '../../core/models/settings.model';

@Component({
  selector: 'app-settings',
  template: `
    <div class="page-container">
      
      <div class="page-header">
        <div>
          <h1 class="page-title">Application & AI Settings</h1>
          <p class="page-subtitle">Configure Groq API keys, model parameters, default templates, and UI theme.</p>
        </div>

        <button class="btn btn-primary" (click)="saveSettings()">
          💾 Save Settings
        </button>
      </div>

      <div class="settings-grid">
        
        <!-- GROQ AI CONFIGURATION -->
        <div class="card-section">
          <div class="section-header-icon">
            <span class="icon">🤖</span>
            <div>
              <h3>Groq AI Configuration</h3>
              <p>Configure your personal Groq API credentials for high-speed resume generation.</p>
            </div>
          </div>

          <div *ngIf="envStatus.apiKey || envStatus.model" class="docker-env-banner">
            🐳 <strong>Docker Environment Injected:</strong> 
            Loaded configuration from container environment variables 
            <span *ngIf="envStatus.apiKey">(API Key set)</span>
            <span *ngIf="envStatus.model">(Model: {{ settings.groq.model }})</span>.
          </div>

          <div class="security-alert">
            🔒 <strong>Privacy & Security Note:</strong> This is a client-side frontend application. 
            Your API key is stored in browser <code>localStorage</code> and accessed directly from client code. 
            Do not host this app publicly with a production secret key.
          </div>

          <div class="form-group">
            <label>Groq API Key *</label>
            <div class="input-with-btn">
              <input 
                [type]="showApiKey ? 'text' : 'password'" 
                [(ngModel)]="settings.groq.apiKey" 
                placeholder="gsk_..." 
              />
              <button class="btn-toggle" (click)="showApiKey = !showApiKey">
                {{ showApiKey ? 'Hide' : 'Show' }}
              </button>
            </div>
          </div>

          <div class="form-grid col-2">
            <div class="form-group">
              <label>AI Model</label>
              <select [(ngModel)]="settings.groq.model">
                <option value="openai/gpt-oss-120b">openai/gpt-oss-120b (Recommended Default)</option>
                <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
                <option value="openai/gpt-oss-20b">openai/gpt-oss-20b</option>
                <option value="llama3-70b-8192">llama3-70b-8192</option>
                <option value="llama3-8b-8192">llama3-8b-8192 (Fastest)</option>
                <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
              </select>
            </div>

            <div class="form-group">
              <label>Temperature (Creativity): {{ settings.groq.temperature }}</label>
              <input 
                type="range" 
                min="0.0" 
                max="0.8" 
                step="0.05" 
                [(ngModel)]="settings.groq.temperature" 
              />
              <span class="range-hint">0.1 - 0.2 recommended for max factual precision</span>
            </div>
          </div>

          <div class="form-group">
            <label>Groq API Base URL</label>
            <input type="text" [(ngModel)]="settings.groq.baseUrl" placeholder="https://api.groq.com/openai/v1" />
          </div>

          <div class="btn-test-row">
            <button 
              class="btn btn-secondary" 
              [disabled]="isTestingConnection" 
              (click)="testConnection()"
            >
              {{ isTestingConnection ? 'Testing Connection...' : '⚡ Test API Connection' }}
            </button>
          </div>
        </div>

        <!-- APPLICATION PREFERENCES -->
        <div class="card-section">
          <div class="section-header-icon">
            <span class="icon">🎨</span>
            <div>
              <h3>User Interface & Defaults</h3>
              <p>Set default theme, template style, and tailoring preferences.</p>
            </div>
          </div>

          <div class="form-grid col-2">
            <div class="form-group">
              <label>UI Theme</label>
              <select [(ngModel)]="settings.theme" (change)="onThemeChange()">
                <option value="dark">🌙 Dark Theme (SaaS)</option>
                <option value="light">☀️ Light Theme</option>
              </select>
            </div>

            <div class="form-group">
              <label>Default Resume Template</label>
              <select [(ngModel)]="settings.defaultTemplate">
                <option value="ats-minimal">ATS Minimal (Single Column)</option>
                <option value="professional">Professional (Executive Divider)</option>
                <option value="modern">Modern (Contemporary Header)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Default Presentation Style</label>
              <select [(ngModel)]="settings.defaultStyle">
                <option value="ATS Friendly">ATS Friendly</option>
                <option value="Professional">Professional</option>
                <option value="Modern">Modern</option>
                <option value="Minimal">Minimal</option>
              </select>
            </div>

            <div class="form-group">
              <label>Default Resume Target Length</label>
              <select [(ngModel)]="settings.defaultLength">
                <option value="1 Page">1 Page</option>
                <option value="2 Pages">2 Pages</option>
                <option value="Auto">Auto</option>
              </select>
            </div>
          </div>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .page-container {
      padding: 28px;
      max-width: 1000px;
      margin: 0 auto;
      box-sizing: border-box;
      width: 100%;
    }
    @media (max-width: 768px) {
      .page-container {
        padding: 16px 12px;
      }
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }
    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }
      .page-header .btn {
        width: 100%;
        justify-content: center;
        text-align: center;
        box-sizing: border-box;
      }
    }
    .page-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 4px 0;
      color: var(--text-main, #f8fafc);
    }
    .page-subtitle {
      font-size: 14px;
      color: var(--text-muted, #94a3b8);
      margin: 0;
    }
    .settings-grid {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .card-section {
      background: var(--bg-card, #1e293b);
      border: 1px solid var(--border-color, rgba(255,255,255,0.08));
      border-radius: 16px;
      padding: 24px;
      color: var(--text-main, #f8fafc);
    }
    @media (max-width: 768px) {
      .card-section {
        padding: 16px 14px;
        border-radius: 12px;
      }
    }
    .section-header-icon {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .section-header-icon .icon { font-size: 28px; }
    .section-header-icon h3 { margin: 0 0 4px 0; font-size: 18px; }
    .section-header-icon p { margin: 0; font-size: 13px; color: var(--text-muted, #94a3b8); }

    .docker-env-banner {
      background: rgba(14, 165, 233, 0.12);
      border: 1px solid rgba(14, 165, 233, 0.3);
      color: #38bdf8;
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 13px;
      line-height: 1.4;
      margin-bottom: 16px;
    }
    .security-alert {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fbbf24;
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 13px;
      line-height: 1.4;
      margin-bottom: 20px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 16px;
    }
    .form-group label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted, #94a3b8);
      text-transform: uppercase;
    }
    .form-group input, .form-group select {
      background: var(--bg-main, #0f172a);
      border: 1px solid var(--border-color, rgba(255,255,255,0.12));
      border-radius: 8px;
      padding: 10px 12px;
      color: var(--text-main, #f8fafc);
      font-size: 14px;
      box-sizing: border-box;
      width: 100%;
    }
    .input-with-btn {
      display: flex;
      gap: 8px;
    }
    .input-with-btn input { flex: 1; }
    .btn-toggle {
      background: #334155;
      border: none;
      color: white;
      padding: 0 14px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
    }
    .form-grid {
      display: grid;
      gap: 16px;
    }
    .form-grid.col-2 { grid-template-columns: 1fr 1fr; }
    @media (max-width: 640px) {
      .form-grid.col-2 { grid-template-columns: 1fr; }
    }
    .range-hint {
      font-size: 11px;
      color: var(--text-muted, #64748b);
    }
    .btn-test-row {
      margin-top: 12px;
    }
    @media (max-width: 768px) {
      .btn-test-row .btn {
        width: 100%;
        justify-content: center;
      }
    }
    .btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .btn-primary { background: #6366f1; color: white; }
    .btn-primary:hover { background: #4f46e5; }
    .btn-secondary { background: #334155; color: white; }
    .btn-secondary:hover { background: #475569; }
  `]
})
export class SettingsComponent implements OnInit {
  settings!: AppSettings;
  showApiKey = false;
  isTestingConnection = false;
  envStatus = { apiKey: false, model: false, baseUrl: false };

  constructor(
    private settingsService: SettingsService,
    private groqService: GroqService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.settings = JSON.parse(JSON.stringify(this.settingsService.getSettings()));
    this.envStatus = this.settingsService.isEnvConfigured();
  }

  saveSettings(): void {
    this.settingsService.saveSettings(this.settings);
  }

  onThemeChange(): void {
    this.saveSettings();
  }

  testConnection(): void {
    if (!this.settings.groq.apiKey) {
      this.toastService.warning('Missing Key', 'Please enter a Groq API Key first.');
      return;
    }

    this.isTestingConnection = true;
    this.groqService.testConnection(this.settings.groq).subscribe({
      next: (success) => {
        this.isTestingConnection = false;
        if (success) {
          this.toastService.success('Connection Successful', 'Groq API connection test succeeded!');
        }
      },
      error: (err) => {
        this.isTestingConnection = false;
        this.toastService.error('Connection Failed', err.message);
      }
    });
  }
}
