import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // מאפשר גישה לשירות בכל האפליקציה
})
export class SearchResultService {
  private apiUrl = 'http://localhost:4200/search-results'; // שנה לפי ה-URL של ה-API

  constructor(private http: HttpClient) {}

  getResources(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
