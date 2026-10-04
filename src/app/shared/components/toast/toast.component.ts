import { Component, OnInit } from '@angular/core';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toast',
  template: `
    <div class="toast-container">
      <div 
        *ngFor="let toast of toasts$ | async" 
        class="toast-card" 
        [ngClass]="toast.type"
      >
        <div class="toast-icon">
          <span *ngIf="toast.type === 'success'">✓</span>
          <span *ngIf="toast.type === 'error'">✕</span>
          <span *ngIf="toast.type === 'warning'">⚠</span>
          <span *ngIf="toast.type === 'info'">ℹ</span>
        </div>
        <div class="toast-content">
          <div class="toast-title">{{ toast.title }}</div>
          <div class="toast-message">{{ toast.message }}</div>
        </div>
        <button class="toast-close" (click)="dismiss(toast.id)">✕</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 380px;
      width: calc(100vw - 48px);
      pointer-events: none;
    }
    .toast-card {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      backdrop-filter: blur(8px);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      animation: slideIn 0.3s ease-out;
      border: 1px solid rgba(255,255,255,0.1);
    }
    @keyframes slideIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .toast-card.success {
      background: rgba(16, 185, 129, 0.95);
      color: #ffffff;
    }
    .toast-card.error {
      background: rgba(239, 68, 68, 0.95);
      color: #ffffff;
    }
    .toast-card.warning {
      background: rgba(245, 158, 11, 0.95);
      color: #ffffff;
    }
    .toast-card.info {
      background: rgba(59, 130, 246, 0.95);
      color: #ffffff;
    }
    .toast-icon {
      font-weight: bold;
      font-size: 16px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(255,255,255,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .toast-content {
      flex: 1;
    }
    .toast-title {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 2px;
    }
    .toast-message {
      font-size: 13px;
      opacity: 0.92;
      line-height: 1.4;
    }
    .toast-close {
      background: transparent;
      border: none;
      color: inherit;
      opacity: 0.7;
      cursor: pointer;
      font-size: 14px;
      padding: 2px 4px;
    }
    .toast-close:hover {
      opacity: 1;
    }
  `]
})
export class ToastComponent implements OnInit {
  toasts$: Observable<ToastMessage[]>;

  constructor(private toastService: ToastService) {
    this.toasts$ = this.toastService.toasts$;
  }

  ngOnInit(): void {}

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}
