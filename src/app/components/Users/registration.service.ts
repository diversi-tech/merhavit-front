import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',// השירות יהיה זמין בכל האפליקציה
})
export class RegistrationService {
  private apiUrl = 'http://localhost:3000/users';// כתובת ה-API

  constructor(private http: HttpClient) {}

  getOptions(): Observable<{ specialties: string[]; seminaries: string[]; classRoles: string[] }> {
    return this.http.get<{ specialties: string[]; seminaries: string[]; classRoles: string[] }>(
      `${this.apiUrl}/options`
    );
  }

  registerStudent(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }
}
