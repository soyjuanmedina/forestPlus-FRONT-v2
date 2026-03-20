import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StatusModalComponent } from '../../shared/status-modal/status-modal.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StatusModalComponent, TranslateModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';

  statusModal = {
    visible: false,
    type: 'error' as 'success' | 'error',
    title: '',
    message: ''
  };

  constructor(
    private authService: AuthService, 
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  showStatus(type: 'success' | 'error', title: string, message: string) {
    this.statusModal = { visible: true, type, title, message };
  }

  closeStatus() {
    this.statusModal.visible = false;
  }

  onSubmit() {
    if (this.name && this.email && this.password) {
      this.authService.register(this.name, this.email, this.password).subscribe({
        next: (res) => {
          console.log('Registro exitoso en el backend', res);
          
          this.router.navigate(['/verify-email']);
        },
        error: (err) => {
          console.error('Error registrando usuario', err);
          this.showStatus('error', 'Error en el registro', err.error?.message || 'No se pudo completar el registro.');
        }
      });
    }
  }
}
