import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  contactData = {
    name: '',
    email: '',
    message: ''
  };
  sendingContact = false;
  contactSuccess = false;
  contactError = false;

  constructor(private http: HttpClient) {}

  submitContact() {
    this.sendingContact = true;
    this.contactSuccess = false;
    this.contactError = false;

    this.http.post('http://localhost:3000/api/contact', this.contactData).subscribe({
      next: () => {
        this.sendingContact = false;
        this.contactSuccess = true;
        this.contactData = { name: '', email: '', message: '' }; // reset
        setTimeout(() => this.contactSuccess = false, 5000);
      },
      error: () => {
        this.sendingContact = false;
        this.contactError = true;
        setTimeout(() => this.contactError = false, 5000);
      }
    });
  }
}
