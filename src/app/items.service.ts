import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  constructor(private apiService: ApiService) {}
  getItems(page: number = 0, limit: number = 10, searchTerm: string = '', typeFilter: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
  
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    if (typeFilter) {
      params = params.set('filterType', typeFilter);
    }
  
    console.log('Sending to server:', params.toString());
    return this.apiService.Read(`/EducationalResource/getAll?${params.toString()}`);

  }
  
}
