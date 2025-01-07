import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Item } from './components/interfaces/item.model';

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  public items: Item[] = [];
  public page: number = 0;
  public limit: number = 10;
  public searchTerm: string = '';
  public typeFilter: string = '';
  public ifArrIsEmty: boolean = false;
  private ifArrIsEmtySubject = new BehaviorSubject<boolean>(false); // BehaviorSubject
  public ifArrIsEmty$ = this.ifArrIsEmtySubject.asObservable(); // Observable

  constructor(private apiService: ApiService) {
    this.loadItems(); // קריאה לשרת בהתחלה
  }

  loadItems(): void {
    this.apiService.Read(`/EducationalResource/getAll?page=${this.page}&limit=${this.limit}`).subscribe({
      next: (response: any) => {
        this.items = response.data || [];
        this.ifArrIsEmtySubject.next(this.items.length === 0); // עדכון הערך
      },
      error: (err) => {
        console.error('Error fetching items from server', err);
      },
    });
  }

  getItems(page: number = this.page, limit: number = this.limit, searchTerm: string = this.searchTerm, typeFilter: string = this.typeFilter): Observable<Item[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    if (typeFilter) {
      params = params.set('filterType', typeFilter);
    }
  
    return this.apiService.Read(`/EducationalResource/getAll?${params.toString()}`).pipe(
      map((response: any) => {
        this.items = response.data || [];
        return this.items;
      })
    );
  }

  searchItems(searchTerm: string = this.searchTerm): Observable<Item[]> {
    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('limit', this.limit.toString());
    
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    
    return this.apiService.Read(`/EducationalResource/getAll?${params.toString()}`).pipe(
      map((response: any) => {
        this.items = response.data || [];
        return this.items;
      })
    );
  }

  fetchItems(): void {
    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('limit', this.limit.toString());
  
    if (this.searchTerm) {
      params = params.set('searchTerm', this.searchTerm);
    }
  
    if (this.typeFilter && this.typeFilter !== 'all') { // אם נבחר סוג סינון
      params = params.set('filterType', this.typeFilter);
    }
  
    this.apiService.Read(`/EducationalResource/getAll?${params.toString()}`).subscribe(
      (response: any) => {
        this.items = response.data || [];
        this.ifArrIsEmtySubject.next(this.items.length === 0); // עדכון הערך
      },
      (error) => {
        console.error('Error fetching items:', error);
      }
    );
  }
}
