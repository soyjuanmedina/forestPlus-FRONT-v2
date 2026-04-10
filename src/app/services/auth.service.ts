import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { 
  AuthControllerService, 
  RegisterUserRequestDto, 
  AuthResponseDto, 
  UserResponseDto,
  ResendVerificationEmailRequestDto,
  MessageResponseDto
} from '../api';


@Injectable( {
  providedIn: 'root'
} )
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserResponseDto | null>( null );
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor ( private authApi: AuthControllerService ) {
    // Comprobar si hay sesión en localStorage al recargar (persistencia básica)
    const storedUser = localStorage.getItem( 'forestPlus_user' );
    if ( storedUser ) {
      this.currentUserSubject.next( JSON.parse( storedUser ) );
    }
  }

  register ( name: string, email: string, password: string ): Observable<UserResponseDto> {
    const dto: RegisterUserRequestDto = { name, email, password };
    return this.authApi.register( dto );
  }

  resendVerification ( email: string ): Observable<MessageResponseDto> {
    const dto: ResendVerificationEmailRequestDto = { email };
    return this.authApi.resendVerification( dto );
  }

  login ( email: string, password: string ): Observable<AuthResponseDto> {
    const dto: RegisterUserRequestDto = { email, password }; // El DTO se reutiliza según la API generada
    return this.authApi.login( dto ).pipe(
      tap( ( res: AuthResponseDto ) => {
        // Guardamos user y token en memoria/localStorage si login exitoso
        if ( res && res.token ) {
          localStorage.setItem( 'forestPlus_token', res.token );
          localStorage.setItem( 'forestPlus_user', JSON.stringify( res.user ) );
          this.currentUserSubject.next( res.user || null );
        }
      } )
    );
  }

  logout () {
    localStorage.removeItem( 'forestPlus_token' );
    localStorage.removeItem( 'forestPlus_user' );
    this.currentUserSubject.next( null );
  }

  isLoggedIn () {
    return this.currentUserSubject.value !== null;
  }

  getUserId () {
    return this.currentUserSubject.value?.id;
  }

  getRole () {
    return this.currentUserSubject.value?.role;
  }

  getCurrentUser () {
    return this.currentUserSubject.value;
  }

  updateCurrentUser ( user: UserResponseDto ) {
    localStorage.setItem( 'forestPlus_user', JSON.stringify( user ) );
    this.currentUserSubject.next( user );
  }

  verifyEmail ( uuid: string ): Observable<MessageResponseDto> {
    return this.authApi.verifyEmail( uuid );
  }
}
