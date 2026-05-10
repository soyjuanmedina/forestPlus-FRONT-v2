import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { RequestAccessComponent } from '../../shared/request-access/request-access.component';

@Component( {
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, RequestAccessComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
} )
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  successMessage: string | null = null;
  errorMessage: string | null = null;
  errorAction: 'resend' | 'reset' | 'unlock' | null = null;
  features = environment.features;

  constructor (
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) { }

  ngOnInit () {
    // Si ya está logueado, ir directo al dashboard
    if ( this.authService.isLoggedIn() ) {
      this.router.navigate( ['/dashboard'] );
      return;
    }

    // Si viene del enlace de validación del backend '?verified=true'
    this.route.queryParams.subscribe( params => {
      if ( params['verified'] === 'true' ) {
        this.successMessage = 'VERIFIED_SUCCESS';
      }
      if ( params['unlocked'] === 'true' && params['uuid'] ) {
        this.authService.unlockAccount( params['uuid'] ).subscribe( {
          next: () => this.successMessage = 'UNLOCK_SUCCESS',
          error: () => this.errorMessage = 'UNLOCK_FAILED'
        } );
      }
    } );
  }

  onSubmit () {
    this.successMessage = null;
    this.errorMessage = null;
    this.errorAction = null;

    if ( this.email && this.password ) {
      this.authService.login( this.email, this.password ).subscribe( {
        next: ( res ) => {
          if ( res.user?.forcePasswordChange ) {
            this.router.navigate( ['/profile'], { queryParams: { mustChange: 'true' } } );
          } else {
            this.router.navigate( ['/dashboard'] );
          }
        },
        error: ( err ) => {
          console.error( err );
          this.errorMessage = err.error?.message || 'GENERIC_ERROR';
          
          if (this.errorMessage === 'WRONG_PASSWORD') {
            this.errorAction = 'reset';
          } else if (this.errorMessage === 'ACCOUNT_LOCKED') {
            this.errorAction = 'unlock';
          } else if (err.status === 403 || this.errorMessage === 'EMAIL_NOT_VERIFIED') {
            this.errorAction = 'resend';
          } else {
            this.errorAction = null;
          }
        }
      } );
    }
  }

  onResendVerification () {
    this.authService.resendVerification( this.email ).subscribe( {
      next: ( res ) => {
        this.successMessage = 'RESEND_SUCCESS';
        this.errorMessage = null;
        this.errorAction = null;
      },
      error: ( err ) => {
        this.errorMessage = err.error?.message || 'RESEND_ERROR';
      }
    } );
  }

  onResetPassword() {
    this.successMessage = null;
    this.errorMessage = null;

    if (!this.email) {
      this.errorMessage = 'EMAIL_REQUIRED';
      return;
    }
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.successMessage = 'RESET_INFO';
        this.errorMessage = null;
        this.errorAction = null;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'GENERIC_ERROR';
      }
    });
  }

  onUnlockAccount() {
    this.successMessage = null;
    this.errorMessage = null;

    if (!this.email) {
      this.errorMessage = 'EMAIL_REQUIRED';
      return;
    }
    this.authService.requestUnlock(this.email).subscribe({
      next: () => {
        this.successMessage = 'UNLOCK_INFO';
        this.errorMessage = null;
        this.errorAction = null;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'GENERIC_ERROR';
      }
    });
  }
}
