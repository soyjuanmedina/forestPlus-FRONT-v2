import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader, provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter( routes, withHashLocation() ),
    provideHttpClient( withInterceptors( [authInterceptor] ) ),
    provideTranslateHttpLoader( {
      prefix: './assets/i18n/',
      suffix: '.json'
    } ),
    importProvidersFrom(
      TranslateModule.forRoot( {
        loader: {
          provide: TranslateLoader,
          useClass: TranslateHttpLoader
        },
        defaultLanguage: 'es'
      } )
    )
  ]
};
