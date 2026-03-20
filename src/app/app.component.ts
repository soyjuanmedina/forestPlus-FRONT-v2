import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'forest+';
  private userSub: Subscription | undefined;
  currentLang: string;

  constructor(
    public authService: AuthService, 
    private router: Router,
    private translate: TranslateService
  ) {
    this.currentLang = this.getCookie('lang') || 'es';
    this.translate.setDefaultLang('es');
    this.translate.use(this.currentLang);
  }

  private setCookie(name: string, value: string, days: number = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  private getCookie(name: string) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  ngOnInit() {
    this.userSub = this.authService.currentUser$.subscribe(user => {
      // Si estamos en la home ('/') y el usuario se loguea, redirigir a dashboard
      if (user && window.location.pathname === '/') {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  changeLang(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
    this.setCookie('lang', lang);
  }
}
