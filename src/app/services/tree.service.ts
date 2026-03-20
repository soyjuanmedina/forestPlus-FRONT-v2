import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TreeService {
  private apiUrl = 'http://localhost:3000/api/forest';

  constructor(private http: HttpClient) { }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getMyTrees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-trees`, { headers: this.getHeaders() });
  }

  getLands(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/lands`, { headers: this.getHeaders() });
  }

  getLand(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/lands/${id}`, { headers: this.getHeaders() });
  }

  getTreeSpecies(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:3000/api/tree-species`, { headers: this.getHeaders() });
  }

  getTreeSpeciesById(id: number): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/api/tree-species/${id}`, { headers: this.getHeaders() });
  }
}
