import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="confirm-modal-overlay" *ngIf="visible">
      <div class="confirm-modal-card animate-pop">
        <div class="confirm-icon">
          <i class="fas fa-question-circle"></i>
        </div>
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <div class="confirm-actions">
          <button class="btn btn-secondary" (click)="cancel.emit()">{{ 'COMMON.CANCEL' | translate }}</button>
          <button class="btn btn-danger" (click)="confirm.emit()">{{ 'COMMON.DELETE' | translate }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirm-modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.4);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.2s ease;
    }
    .confirm-modal-card {
      background: white;
      width: 90%;
      max-width: 400px;
      padding: 35px;
      border-radius: 24px;
      text-align: center;
      box-shadow: 0 20px 50px rgba(0,0,0,0.1);
    }
    .confirm-icon {
      font-size: 4rem;
      margin-bottom: 20px;
      color: #ff9f43;
    }
    h3 { margin-bottom: 10px; font-size: 1.5rem; color: var(--color-text-dark); }
    p { color: var(--color-text-light); margin-bottom: 30px; }
    
    .confirm-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
    }
    .confirm-actions button {
      min-width: 120px;
    }
    .btn-danger {
      background: #ff4757;
      color: white;
    }
    .btn-danger:hover {
      background: #ff6b81;
      transform: translateY(-2px);
    }
    
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-pop { animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    @keyframes pop {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class ConfirmModalComponent {
  @Input() visible = false;
  @Input() title = '';
  @Input() message = '';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
