import { Component, Input } from '@angular/core';
import { GenerationProgress } from '../../../core/services/resume-generator.service';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="loading-overlay" *ngIf="progress && progress.status !== 'idle' && progress.status !== 'completed'">
      <div class="loading-card">
        
        <div *ngIf="progress.status !== 'error'" class="spinner-body">
          <div class="glow-ring">
            <div class="inner-circle">✦</div>
          </div>

          <h3 class="step-message">{{ progress.stepMessage }}</h3>
          
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" [style.width.%]="progress.percent"></div>
          </div>

          <div class="steps-indicator">
            <div class="step-pill" [class.active]="progress.status === 'analyzing'" [class.done]="progress.percent > 25">
              1. Job Analysis
            </div>
            <div class="step-pill" [class.active]="progress.status === 'matching'" [class.done]="progress.percent > 50">
              2. Experience Match
            </div>
            <div class="step-pill" [class.active]="progress.status === 'generating'" [class.done]="progress.percent > 85">
              3. AI Generation
            </div>
            <div class="step-pill" [class.active]="progress.status === 'validating'" [class.done]="progress.percent === 100">
              4. Validation
            </div>
          </div>

          <p class="subtext">Applying strict factual grounding rules with Groq AI...</p>
        </div>

        <div *ngIf="progress.status === 'error'" class="error-body">
          <div class="error-icon">⚠️</div>
          <h3>AI Processing Error</h3>
          <p class="error-msg">{{ progress.errorDetail || progress.stepMessage }}</p>

          <div class="expandable-panel" *ngIf="progress.rawResponse">
            <button class="btn-toggle" (click)="showRaw = !showRaw">
              {{ showRaw ? 'Hide' : 'Inspect' }} Raw AI Output
            </button>
            <pre *ngIf="showRaw" class="raw-box">{{ progress.rawResponse }}</pre>
          </div>

          <div class="actions">
            <button class="btn btn-primary" (click)="dismissError()">Dismiss & Try Again</button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      z-index: 9995;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      animation: fadeIn 0.3s ease;
    }
    .loading-card {
      background: #1e293b;
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 20px;
      padding: 36px 32px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.15);
      color: #f8fafc;
    }
    .glow-ring {
      width: 72px;
      height: 72px;
      margin: 0 auto 20px auto;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      padding: 4px;
      animation: pulseGlow 2s infinite ease-in-out;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .inner-circle {
      width: 100%;
      height: 100%;
      background: #0f172a;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      color: #a855f7;
    }
    @keyframes pulseGlow {
      0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
      50% { transform: scale(1.08); box-shadow: 0 0 35px rgba(168, 85, 247, 0.6); }
    }
    .step-message {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #f8fafc;
    }
    .progress-bar-wrap {
      width: 100%;
      height: 8px;
      background: #334155;
      border-radius: 999px;
      overflow: hidden;
      margin-bottom: 24px;
    }
    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #a855f7);
      border-radius: 999px;
      transition: width 0.4s ease;
    }
    .steps-indicator {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-bottom: 20px;
    }
    .step-pill {
      font-size: 12px;
      padding: 6px 10px;
      border-radius: 6px;
      background: #0f172a;
      color: #64748b;
      border: 1px solid rgba(255,255,255,0.05);
      transition: all 0.3s ease;
    }
    .step-pill.active {
      background: rgba(99, 102, 241, 0.2);
      color: #818cf8;
      border-color: #6366f1;
      font-weight: 600;
    }
    .step-pill.done {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border-color: rgba(16, 185, 129, 0.3);
    }
    .subtext {
      font-size: 13px;
      color: #94a3b8;
      margin: 0;
    }
    .error-icon {
      font-size: 44px;
      margin-bottom: 12px;
    }
    .error-msg {
      color: #f87171;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    .btn-toggle {
      background: #334155;
      border: none;
      color: #cbd5e1;
      font-size: 12px;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      margin-bottom: 12px;
    }
    .raw-box {
      max-height: 160px;
      overflow-y: auto;
      text-align: left;
      font-size: 11px;
      background: #0f172a;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #334155;
      color: #94a3b8;
      margin-bottom: 16px;
    }
    .btn-primary {
      background: #6366f1;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    }
    .btn-primary:hover {
      background: #4f46e5;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() progress: GenerationProgress | null = null;
  showRaw = false;

  dismissError(): void {
    if (this.progress) {
      this.progress.status = 'idle';
    }
  }
}
