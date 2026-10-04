import { Component, Input } from '@angular/core';
import { KeywordMatchResult } from '../../../core/models/job-analysis.model';

@Component({
  selector: 'app-keyword-match',
  template: `
    <div class="keyword-match-card" *ngIf="matchResult">
      <div class="card-header">
        <div class="header-title">
          <span class="icon">🔍</span>
          <h4>JD Keyword Alignment</h4>
        </div>
        <div class="percentage-badge" [ngClass]="getScoreClass(matchResult.matchPercentage)">
          {{ matchResult.matchPercentage }}% Keyword Match
        </div>
      </div>

      <p class="disclaimer">
        ℹ️ <strong>Transparent Comparison:</strong> Matches JD keywords directly against your Master Resume. "Missing" means not found in Master Resume.
      </p>

      <div class="keyword-columns">
        <div class="column matched">
          <h5>
            <span class="status-dot green"></span>
            Matched Keywords ({{ matchResult.matchedKeywords.length }})
          </h5>
          <div class="pills-container">
            <span class="pill matched-pill" *ngFor="let kw of matchResult.matchedKeywords">
              ✓ {{ kw }}
            </span>
            <span class="empty-text" *ngIf="matchResult.matchedKeywords.length === 0">None matched</span>
          </div>
        </div>

        <div class="column missing">
          <h5>
            <span class="status-dot red"></span>
            Missing from Master Resume ({{ matchResult.missingKeywords.length }})
          </h5>
          <div class="pills-container">
            <span class="pill missing-pill" *ngFor="let kw of matchResult.missingKeywords">
              ✕ {{ kw }}
            </span>
            <span class="empty-text" *ngIf="matchResult.missingKeywords.length === 0">All JD keywords matched!</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .keyword-match-card {
      background: var(--bg-card, #1e293b);
      border: 1px solid var(--border-color, rgba(255,255,255,0.08));
      border-radius: 14px;
      padding: 20px;
      color: var(--text-main, #f8fafc);
    }
    @media (max-width: 768px) {
      .keyword-match-card {
        padding: 14px 12px;
        border-radius: 12px;
      }
    }
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      flex-wrap: wrap;
      gap: 8px;
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .header-title .icon {
      font-size: 18px;
    }
    .header-title h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    .percentage-badge {
      font-size: 13px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 999px;
    }
    .percentage-badge.high { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .percentage-badge.medium { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .percentage-badge.low { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    .disclaimer {
      font-size: 12px;
      color: var(--text-muted, #94a3b8);
      margin: 0 0 16px 0;
      background: rgba(255,255,255,0.03);
      padding: 8px 12px;
      border-radius: 8px;
    }
    .keyword-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    @media (max-width: 640px) {
      .keyword-columns { grid-template-columns: 1fr; }
    }
    .column h5 {
      font-size: 13px;
      font-weight: 600;
      margin: 0 0 10px 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .status-dot.green { background: #10b981; }
    .status-dot.red { background: #ef4444; }
    .pills-container {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .pill {
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 500;
    }
    .matched-pill {
      background: rgba(16, 185, 129, 0.12);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
    .missing-pill {
      background: rgba(239, 68, 68, 0.12);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
    .empty-text {
      font-size: 12px;
      color: var(--text-muted, #64748b);
      font-style: italic;
    }
  `]
})
export class KeywordMatchComponent {
  @Input() matchResult: KeywordMatchResult | null = null;

  getScoreClass(percent: number): string {
    if (percent >= 70) return 'high';
    if (percent >= 45) return 'medium';
    return 'low';
  }
}
