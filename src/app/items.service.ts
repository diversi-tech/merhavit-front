// import { Injectable } from '@angular/core';
// import { HttpParams } from '@angular/common/http';
// import { map, Observable } from 'rxjs';
// import { ApiService } from './api.service';
// import { Item } from './components/interfaces/item.model';

// @Injectable({
//   providedIn: 'root',
// })
// export class ItemsService {
//   public items: Item[] =[];
//   public page: number = 0;
//   public limit: number = 10;
//   public searchTerm: string = '';
//   public  typeFilter: string = '';
//   constructor(private apiService: ApiService) {}

//   getItems(page: number = this.page, limit: number = this.limit, searchTerm: string = this.searchTerm, typeFilter: string =this.typeFilter): Observable<Item []> {
//     let params = new HttpParams()
//       .set('page', page.toString())
//       .set('limit', limit.toString());
//      console.log("enter to get all")
//      if (searchTerm) {
//       params = params.set('searchTerm', searchTerm);
//      }
//      if (typeFilter) {
//       params = params.set('filterType', typeFilter);
//      }
  
//      console.log('Sending to server:', params.toString());
//      return this.apiService.Read(`/EducationalResource/getAll?${params.toString()}`);
//   }
  

//   getAllItems() {
//     console.log("enter to getAllItems in service")
//     return this.apiService.Read(`/EducationalResource/getAll?page=${this.page}&limit=${this.limit}`).pipe(
//       map((response: any) => {
//         // אם יש מפתח `data`, משתמשים בו, אחרת מערך ריק
//         return response.data || [];
//       })
//     );
//   }
  

 
//   searchItems(searchTerm: string = this.searchTerm): Observable<Item []> {
//     let params = new HttpParams()
//       .set('page',this. page.toString())
//       .set('limit',this. limit.toString()); 
//     if (searchTerm) {
//       params = params.set('searchTerm', searchTerm);
//     }
//     console.log('Sending to server:', params.toString());
//     return this.apiService.Read(`/EducationalResource/getAll?${params.toString()}`).pipe(
//       map((response: any) => {
//         this.items=response;
//         console.log("items in item.service.ts",this.items)
//         // אם יש מפתח `data`, משתמשים בו, אחרת מערך ריק
//         return response.data || [];
//       })
//     );
//   }
  
// }


import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
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

  constructor(private apiService: ApiService) {
    this.loadItems(); // קריאה לשרת בהתחלה
  }

  // קריאה לשרת על מנת לאתחל את items עם נתונים
  loadItems(): void {
    this.apiService.Read(`/EducationalResource/getAll?page=${this.page}&limit=${this.limit}`).subscribe({
      next: (response: any) => {
        this.items = response.data || []; // אתחול המערך בנתונים מהשרת
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
  
    return this.apiService.Read(`/EducationalResource/getAll?${params.toString()}`);
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
}
