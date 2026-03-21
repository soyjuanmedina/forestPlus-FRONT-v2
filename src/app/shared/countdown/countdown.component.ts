import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { TranslateModule } from '@ngx-translate/core';
import { LoopsService } from '../../services/loops.service';


@Component({
  selector: 'app-countdown',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  template: `
    <div class="countdown-overlay">
      <div class="countdown-card glass-card">
        <div class="logo-area">
          <img src="assets/logo_forestplus_color.png" alt="forest+" class="logo-anim">
        </div>
        
        <h2>{{ 'COUNTDOWN.TITLE' | translate }}</h2>
        <p class="subtitle">{{ 'COUNTDOWN.SUBTITLE' | translate }}</p>

        <div class="timer">
          <div class="time-unit">
            <span class="number">{{ remaining.days | number:'2.0' }}</span>
            <span class="label">{{ 'COUNTDOWN.DAYS' | translate }}</span>
          </div>
          <div class="timer-divider">:</div>
          <div class="time-unit">
            <span class="number">{{ remaining.hours | number:'2.0' }}</span>
            <span class="label">{{ 'COUNTDOWN.HOURS' | translate }}</span>
          </div>
          <div class="timer-divider">:</div>
          <div class="time-unit">
            <span class="number">{{ remaining.minutes | number:'2.0' }}</span>
            <span class="label">{{ 'COUNTDOWN.MINUTES' | translate }}</span>
          </div>
          <div class="timer-divider">:</div>
          <div class="time-unit">
            <span class="number">{{ remaining.seconds | number:'2.0' }}</span>
            <span class="label">{{ 'COUNTDOWN.SECONDS' | translate }}</span>
          </div>
        </div>

        <div class="access-info">
          <p *ngIf="!emailSubmitted">{{ 'COUNTDOWN.NOTIFY_ME' | translate }}</p>
          <div class="email-input" *ngIf="!emailSubmitted">
            <input type="email" [(ngModel)]="email" [placeholder]="'LOGIN.EMAIL' | translate">
            <button class="btn btn-primary" (click)="notifyMe()">{{ 'COUNTDOWN.BUTTON' | translate }}</button>
          </div>
          <div class="success-message" *ngIf="emailSubmitted">
            <i class="fa-solid fa-circle-check"></i>
            <p>{{ 'COUNTDOWN.SUCCESS_MSG' | translate }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .countdown-overlay {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: linear-gradient(135deg, #f8fcf9 0%, #e8f5e9 100%);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999;
      padding: 20px;
    }
    .countdown-card {
      max-width: 600px;
      width: 100%;
      text-align: center;
      padding: 3rem;
      border: 1px solid rgba(255,255,255,0.8);
      box-shadow: 0 20px 40px rgba(0,0,0,0.05);
    }
    .logo-area { margin-bottom: 2rem; }
    .logo-anim { height: 60px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1)); transition: transform 0.3s; }
    .logo-anim:hover { transform: scale(1.05); }
    h2 { font-size: 2rem; color: var(--color-text-dark); margin-bottom: 0.5rem; }
    .subtitle { color: var(--color-text-light); margin-bottom: 2.5rem; }
    .timer { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-bottom: 3rem; }
    .time-unit { display: flex; flex-direction: column; min-width: 80px; }
    .number { font-size: 3rem; font-weight: 800; color: var(--color-primary); line-height: 1; }
    .label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 2px; color: var(--color-text-light); margin-top: 0.5rem; }
    .timer-divider { font-size: 2rem; font-weight: 300; color: var(--color-border); margin-bottom: 1.5rem; }
    .access-info { border-top: 1px solid var(--color-border); padding-top: 2rem; }
    .email-input { display: flex; gap: 10px; max-width: 400px; margin: 15px auto 0; background: white; padding: 6px; border-radius: 50px; border: 1px solid var(--color-border); box-shadow: var(--shadow-sm); }
    .email-input input { border: none; padding: 0 20px; flex: 1; outline: none; background: transparent; }
    .success-message { display: flex; flex-direction: column; align-items: center; gap: 10px; color: var(--color-primary); font-weight: 600; padding: 1rem; }
    .success-message i { font-size: 2rem; }
  `]
})
export class CountdownComponent implements OnInit, OnDestroy {
  @Input() targetDate!: Date;
  remaining = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  email: string = '';
  emailSubmitted: boolean = false;
  private intervalId!: any;

  constructor(
    private cd: ChangeDetectorRef,
    private loopsService: LoopsService
  ) {}

  ngOnInit() {
    this.update();
    this.intervalId = setInterval(() => this.update(), 1000);
  }

  ngOnDestroy() { if (this.intervalId) clearInterval(this.intervalId); }

  private update() {
    const diff = Math.max(new Date(this.targetDate).getTime() - Date.now(), 0);
    this.remaining.days = Math.floor(diff / 86400000);
    this.remaining.hours = Math.floor((diff % 86400000) / 3600000);
    this.remaining.minutes = Math.floor((diff % 3600000) / 60000);
    this.remaining.seconds = Math.floor((diff % 60000) / 1000);
    this.cd.detectChanges();
  }

  notifyMe() {
    if (this.email && this.email.includes('@')) {
      this.loopsService.registerEmail(this.email).subscribe({
        next: (success) => {
          if (success) {
            console.log('Email registrado con éxito en el backend');
            this.emailSubmitted = true;
            this.cd.detectChanges();
          }
        },
        error: (err) => {
          console.error('Error al registrar email:', err);
          // Opcionalmente podrías añadir un mensaje de error aquí
        }
      });
    }
  }
}
