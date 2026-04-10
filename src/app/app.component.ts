import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { Subscription, filter } from 'rxjs';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { environment } from '../environments/environment';
import { CountdownComponent } from './shared/countdown/countdown.component';

@Component( {
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, TranslateModule, CountdownComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
} )
export class AppComponent {
  title = 'forest+';
  private userSub: Subscription | undefined;
  currentLang: string;
  showCountdown: boolean = false;
  showEnvBanner: boolean = false;
  envName: string = environment.name || 'development';
  envColor: string = (environment as any).envColor || '#ff9800';
  launchDate: Date = new Date(environment.launchDate);
  sidebarCollapsed: boolean = true;

  constructor (
    public authService: AuthService,
    public router: Router,
    private translate: TranslateService
  ) {
    this.currentLang = this.getCookie( 'lang' ) || 'es';
    this.translate.setDefaultLang( 'es' );
    this.translate.use( this.currentLang );
  }

  private setCookie ( name: string, value: string, days: number = 365 ) {
    const date = new Date();
    date.setTime( date.getTime() + ( days * 24 * 60 * 60 * 1000 ) );
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + ( value || "" ) + expires + "; path=/";
  }

  private getCookie ( name: string ) {
    const nameEQ = name + "=";
    const ca = document.cookie.split( ';' );
    for ( let i = 0; i < ca.length; i++ ) {
      let c = ca[i];
      while ( c.charAt( 0 ) == ' ' ) c = c.substring( 1, c.length );
      if ( c.indexOf( nameEQ ) == 0 ) return c.substring( nameEQ.length, c.length );
    }
    return null;
  }

  ngOnInit () {
    // Escuchar cambios de ruta para actualizar el countdown
    this.router.events.pipe(
      filter( event => event instanceof NavigationEnd )
    ).subscribe( () => {
      this.checkLaunch();
    } );

    this.checkLaunch();
    this.userSub = this.authService.currentUser$.subscribe( user => {
      // Si estamos en la home ('/') y el usuario se loguea, redirigir a dashboard
      if ( user && window.location.pathname === '/' ) {
        this.router.navigate( ['/dashboard'] );
      }
    } );
  }

  ngOnDestroy () {
    if ( this.userSub ) {
      this.userSub.unsubscribe();
    }
  }

  logout () {
    this.authService.logout();
    this.router.navigate( ['/'] );
  }

  changeLang ( lang: string ) {
    this.currentLang = lang;
    this.translate.use( lang );
    this.setCookie( 'lang', lang );
  }

  handleAvatarError ( user: any ) {
    if ( user ) {
      user.picture = '';
    }
  }

  private checkLaunch() {
    const isPending = Date.now() < this.launchDate.getTime();
    
    // Check if we are on login, register or related auth pages
    // Using includes to catch variants if any, but specifically targeting /login and /register
    const isAuthPage = this.router.url.includes('/login') || this.router.url.includes('/register');

    // Mostramos countdown solo si es fecha futura Y estamos en una página de autenticación.
    // Esto permite que el componente Home (landing) sea accesible siempre.
    this.showCountdown = isPending && isAuthPage;
    
    // El banner se muestra en cualquier entorno que no sea producción
    this.showEnvBanner = !environment.production;
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
