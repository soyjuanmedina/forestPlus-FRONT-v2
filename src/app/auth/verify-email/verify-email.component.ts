import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { StatusModalComponent } from '../../shared/status-modal/status-modal.component';

@Component( {
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, StatusModalComponent],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css'
} )
export class VerifyEmailComponent {
  isLoading = true;
  verificationState: 'success' | 'error' | 'idle' = 'idle';
  message = '';
  resendEmailInput = '';
  statusModal = {
    visible: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: ''
  };

  constructor (
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService
  ) { }

  ngOnInit () {
    this.route.queryParamMap.subscribe( params => {
      const uuid = params.get( 'uuid' );
      if ( !uuid ) {
        this.isLoading = false;
        this.verificationState = 'idle';
        return;
      }

      this.isLoading = true;
      this.authService.verifyEmail( uuid ).subscribe( {
        next: ( res: any ) => {
          this.isLoading = false;
          this.verificationState = 'success';
          this.message = this.translate.instant( 'VERIFY_EMAIL.SUCCESS' );
          this.statusModal = {
            visible: true,
            type: 'success',
            title: this.translate.instant( 'VERIFY_EMAIL.TITLE' ),
            message: this.message
          };
          setTimeout( () => {
            this.statusModal.visible = false;
            this.router.navigate( ['/login'] );
          }, 1800 );
        },
        error: ( err ) => {
          this.isLoading = false;
          const errMsg = err.error?.message || this.translate.instant( 'VERIFY_EMAIL.ERROR' );
          this.showError( errMsg );
        }
      } );
    } );
  }

  resendEmail ( event: Event ) {
    event.preventDefault();
    const email = this.resendEmailInput || this.authService.getCurrentUser()?.email;
    if ( !email ) {
      this.statusModal = {
        visible: true,
        type: 'error',
        title: this.translate.instant( 'VERIFY_EMAIL.TITLE' ),
        message: 'Por favor, introduce tu email para reenviar.'
      };
      return;
    }

    this.authService.resendVerification( email ).subscribe( {
      next: () => {
        this.statusModal = {
          visible: true,
          type: 'success',
          title: this.translate.instant( 'VERIFY_EMAIL.TITLE' ),
          message: '📧 ' + this.translate.instant( 'VERIFY_EMAIL.SUCCESS_ALERT' )
        };
      },
      error: () => this.showError( this.translate.instant( 'VERIFY_EMAIL.ERROR' ) )
    } );
  }

  showError ( message: string ) {
    this.verificationState = 'error';
    this.statusModal = {
      visible: true,
      type: 'error',
      title: this.translate.instant( 'VERIFY_EMAIL.TITLE' ),
      message
    };
  }

  closeStatus () {
    this.statusModal.visible = false;
  }
}
