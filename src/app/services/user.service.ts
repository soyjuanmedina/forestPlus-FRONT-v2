import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { 
  UserControllerService, 
  UserResponseDto, 
  RegisterUserRequestDto,
  ResetPasswordRequestDto,
  AuthControllerService
} from '../api';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private userApi: UserControllerService,
    private authApi: AuthControllerService,
    private authService: AuthService
  ) { }

  updateProfile(data: RegisterUserRequestDto): Observable<UserResponseDto> {
    const userId = this.authService.getUserId();
    if (!userId) throw new Error('Usuario no identificado');
    
    return this.userApi.updateUser(userId, data).pipe(
      tap((user: UserResponseDto) => {
        this.authService.updateCurrentUser(user);
      })
    );
  }

  changePassword(data: ResetPasswordRequestDto): Observable<any> {
    const token = localStorage.getItem('forestPlus_token');
    return this.authApi.resetPassword(token || '', data);
  }

  updatePicture(userId: number, pictureBase64: string): Observable<UserResponseDto> {
    return this.userApi.updateUserPicture(userId, { picture: pictureBase64 }).pipe(
      tap((user: UserResponseDto) => {
        const currentUser = this.authService.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
          this.authService.updateCurrentUser(user);
        }
      })
    );
  }
}
