import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-status-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="status-modal-overlay" *ngIf="visible">
      <div class="status-modal-card animate-pop">
        <div class="status-icon" [ngClass]="type">
          <i class="fas" [ngClass]="type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'"></i>
        </div>
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <button class="btn btn-primary w-100" (click)="close.emit()">{{ 'COMMON.OK' | translate }}</button>
      </div>
    </div>
  `,
  styles: [`
    .status-modal-overlay {
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
    .status-modal-card {
      background: white;
      width: 90%;
      max-width: 400px;
      padding: 35px;
      border-radius: 24px;
      text-align: center;
      box-shadow: 0 20px 50px rgba(0,0,0,0.1);
    }
    .status-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }
    .status-icon.success { color: var(--color-primary); }
    .status-icon.error { color: #ff4757; }
    h3 { margin-bottom: 10px; font-size: 1.5rem; }
    p { color: var(--color-text-light); margin-bottom: 25px; }
    .w-100 { width: 100%; }
    
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-pop { animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    @keyframes pop {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class StatusModalComponent {
  @Input() visible = false;
  @Input() type: 'success' | 'error' = 'success';
  @Input() title = '';
  @Input() message = '';
  @Output() close = new EventEmitter<void>();
}
