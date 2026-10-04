import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirmation-dialog',
  template: `
    <div class="modal-backdrop" *ngIf="isOpen" (click)="onCancel()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="icon-wrap" [ngClass]="type">
            <span *ngIf="type === 'danger'">⚠️</span>
            <span *ngIf="type === 'warning'">⚡</span>
            <span *ngIf="type === 'info'">ℹ️</span>
          </div>
          <h3>{{ title }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ message }}</p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" (click)="onCancel()">{{ cancelText }}</button>
          <button class="btn" [ngClass]="'btn-' + type" (click)="onConfirm()">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(4px);
      z-index: 9990;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      animation: fadeIn 0.2s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .modal-card {
      background: var(--bg-card, #1e293b);
      border: 1px solid var(--border-color, rgba(255,255,255,0.1));
      border-radius: 14px;
      padding: 24px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      color: var(--text-main, #f8fafc);
    }
    .modal-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 12px;
    }
    .icon-wrap {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    .icon-wrap.danger { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
    .icon-wrap.warning { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .icon-wrap.info { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
    h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }
    .modal-body p {
      font-size: 14px;
      color: var(--text-muted, #94a3b8);
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .btn {
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }
    .btn-secondary {
      background: var(--bg-hover, #334155);
      color: var(--text-main, #f8fafc);
    }
    .btn-secondary:hover { background: #475569; }
    .btn-danger {
      background: #ef4444;
      color: #ffffff;
    }
    .btn-danger:hover { background: #dc2626; }
    .btn-warning {
      background: #f59e0b;
      color: #ffffff;
    }
    .btn-warning:hover { background: #d97706; }
    .btn-info {
      background: #6366f1;
      color: #ffffff;
    }
    .btn-info:hover { background: #4f46e5; }
  `]
})
export class ConfirmationDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() type: 'danger' | 'warning' | 'info' = 'warning';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
