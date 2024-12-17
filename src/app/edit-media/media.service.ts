import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Media } from './edit-media.component';

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  private apiUrl = 'http://localhost:3000/media';

  constructor(private http: HttpClient) {}

  getMediaById(id: string): Observable<Media> {
    return this.http.get<Media>(`${this.apiUrl}/${id}`);
  }

  updateMedia(id: string, media: Partial<Media>): Observable<Media> {
    return this.http.patch<Media>(`${this.apiUrl}/${id}`, media);
  }
}
