import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LoopsService } from '../../services/loops.service';

@Component( {
  selector: 'app-request-access',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  template: `
    <div class="request-access-container">
      <p class="info-text">{{ 'LOGIN.REQUEST_ACCESS_INFO' | translate }}</p>
      
      <div class="email-input-group" *ngIf="!emailSubmitted">
        <input 
          type="email" 
          [(ngModel)]="email" 
          [placeholder]="'LOGIN.EMAIL_PLACEHOLDER' | translate"
          class="form-control">
        <button class="btn-request" (click)="sendRequest()">
          {{ 'LOGIN.REQUEST_BUTTON' | translate }}
        </button>
      </div>

      <div class="success-alert" *ngIf="emailSubmitted">
        <i class="fa-solid fa-circle-check"></i>
        <span>{{ 'LOGIN.REQUEST_SUCCESS' | translate }}</span>
      </div>
    </div>
  `,
  styles: [`
    .request-access-container { margin-top: 2rem; padding: 1.5rem; border-radius: 12px; background: #f9f9f9; border: 1px solid #eee; }
    .info-text { font-size: 0.9rem; color: #666; margin-bottom: 1rem; text-align: center; }
    .email-input-group { display: flex; gap: 8px; }
    .form-control { flex: 1; padding: 10px 15px; border-radius: 8px; border: 1px solid #ddd; outline: none; }
    .btn-request { background: var(--color-primary, #2e7d32); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: opacity 0.2s; }
    .btn-request:hover { opacity: 0.9; }
    .success-alert { color: #2e7d32; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 500; }
  `]
} )
export class RequestAccessComponent {
  email: string = '';
  emailSubmitted: boolean = false;

  constructor (
    private cd: ChangeDetectorRef,
    private loopsService: LoopsService
  ) { }

  sendRequest () {
    if ( this.email && this.email.includes( '@' ) ) {
      this.loopsService.registerEmail( this.email ).subscribe( {
        next: ( success ) => {
          if ( success ) {
            this.emailSubmitted = true;
            this.cd.detectChanges();
          }
        },
        error: ( err ) => console.error( 'Error al solicitar acceso:', err )
      } );
    }
  }
}