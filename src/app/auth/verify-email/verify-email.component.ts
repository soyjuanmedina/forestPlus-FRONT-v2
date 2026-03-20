import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterModule, TranslateModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css'
})
export class VerifyEmailComponent {

  resendEmail(event: Event) {
    event.preventDefault();
    // Aquí llamaríamos al AuthService para reenviar el correo
    alert('Correo reenviado. Por favor revisa tu bandeja de entrada.');
  }

}
