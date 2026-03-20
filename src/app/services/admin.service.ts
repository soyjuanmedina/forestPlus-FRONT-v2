import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/api/admin';

  constructor(private http: HttpClient) { }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Usuarios
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`, { headers: this.getHeaders() });
  }

  createUser(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, data, { headers: this.getHeaders() });
  }

  updateUser(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, data, { headers: this.getHeaders() });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`, { headers: this.getHeaders() });
  }

  // Terrenos
  getLands(): Observable<any[]> {
    // Usamos el endpoint público de terrenos
    return this.http.get<any[]>('http://localhost:3000/api/forest/lands');
  }

  createLand(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/lands`, data, { headers: this.getHeaders() });
  }

  updateLand(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/lands/${id}`, data, { headers: this.getHeaders() });
  }

  deleteLand(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/lands/${id}`, { headers: this.getHeaders() });
  }

  // Especies de Árboles
  getTreeSpecies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tree-species`, { headers: this.getHeaders() });
  }

  createTreeSpecies(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/tree-species`, data, { headers: this.getHeaders() });
  }

  updateTreeSpecies(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/tree-species/${id}`, data, { headers: this.getHeaders() });
  }

  deleteTreeSpecies(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tree-species/${id}`, { headers: this.getHeaders() });
  }
}
