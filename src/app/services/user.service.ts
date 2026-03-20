import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data, { headers: this.getHeaders() }).pipe(
      tap((res: any) => {
        if (res.user) {
          this.authService.updateCurrentUser(res.user);
        }
      })
    );
  }

  changePassword(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/change-password`, data, { headers: this.getHeaders() });
  }

  updatePicture(userId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put(`${this.apiUrl}/${userId}/picture`, formData, { headers: this.getHeaders() }).pipe(
      tap((res: any) => {
        // Si el usuario actualizado es el actual, actualizamos authService
        const currentUser = this.authService.getCurrentUser();
        if (currentUser && currentUser.id === userId && res.picture) {
          currentUser.picture = res.picture;
          this.authService.updateCurrentUser(currentUser);
        }
      })
    );
  }
}
