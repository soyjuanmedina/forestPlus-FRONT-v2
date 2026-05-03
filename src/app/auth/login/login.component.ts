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
  showResendButton = false;
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
        this.successMessage = '¡Tu correo ha sido verificado con éxito! Ahora puedes iniciar sesión.';
      }
    } );
  }

  onSubmit () {
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
          this.errorMessage = err.error?.message || 'Error en el login. Comprueba tus credenciales.';
          if ( err.status === 403 ) {
            this.showResendButton = true;
          }
        }
      } );
    }
  }

  onResendVerification () {
    this.authService.resendVerification( this.email ).subscribe( {
      next: ( res ) => {
        this.successMessage = 'Se ha enviado un nuevo enlace a tu correo.';
        this.errorMessage = null;
        this.showResendButton = false;
      },
      error: ( err ) => {
        this.errorMessage = err.error?.message || 'Error al reenviar el correo.';
      }
    } );
  }
}
