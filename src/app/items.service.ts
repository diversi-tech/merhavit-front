import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Item } from './components/interfaces/item.model';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  public totalItems: number = 0; // תכונה חדשה למעקב אחרי מספר הנתונים
  public items: Item[] = [];
  private itemsSubject = new BehaviorSubject<Item[]>([]); // Subject לניהול הנתונים
  items$ = this.itemsSubject.asObservable(); // Observable שניתן להאזין לו
  private isFetching = false;
  public page: number = 0;
  public limit: number = 10;
  public searchTerm: string = '';
  public typeFilter: string = '';
  public title: string = '';
  public  author: string = '';
  public borrowed: string = '';
  public  publicationDate: string='';//אמור ליהיות מסוג date 
  public language: string = '';
  public subject: string = '';
  public ages: number = 0;
  public level: string = '';
  public createdBy: string = '';
  public isnew: string = '';
  public duration: number = 0;
  public ifArrIsEmty: boolean = false;
  private ifArrIsEmtySubject = new BehaviorSubject<boolean>(false); // BehaviorSubject
  public ifArrIsEmty$ = this.ifArrIsEmtySubject.asObservable(); // Observable
  private totalSubject = new BehaviorSubject<number>(0); // Subject לניהול המספר 
  totalItems$ = this.totalSubject.asObservable(); // Observable שניתן להאזין לו
  type: any;

  constructor(private apiService: ApiService) { }
  ngOnInit(): void {
    this.loadItems(); // קריאה לשרת בהתחלה
  }

  // קריאה לשרת על מנת לאתחל את items עם נתונים
  loadItems(): void {
    this.apiService
      .Read(`/EducationalResource/getAll?page=${this.page}&limit=${this.limit}`)
      .subscribe({
        next: (response: {data:any[],totalCount:number}) => {
          this.items = response.data || []; // אתחול המערך בנתונים מהשרת
          this.totalItems=response.totalCount
          console.log("!!!!!!!!!!!!!! "+this.totalItems);
          this.ifArrIsEmtySubject.next(this.items.length === 0); // עדכון הערך
        },
        error: (err) => {
          console.error('Error fetching items from server', err);
        },
      });
  }

  getItems(
    page: number = 0,
    limit: number = 10,
    searchTerm: string = this.searchTerm,
    typeFilter: string = this.typeFilter,
    title: string = this.title,
    author: string = this.author,
    borrowed: string = this.borrowed,
    publicationDate: string = this.publicationDate,//צריך לשנות את זה לdate
    language: string = this.language,
    subject: string = this.subject,
    ages: number = this.ages,
    level: string = this.level,
    createdBy: string = this.createdBy,
    isnew: string = this.isnew,
    duration: number = this.duration
  ): Observable<Item[]> {
    let params = new HttpParams()
      // .set('page', page.toString())
      // .set('limit', limit.toString());
    
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    if (typeFilter) {
      params = params.set('filterType', typeFilter);
    }
    if (title) {
      params = params.set('title', title);
    }
    if (author) {
      params = params.set('author', author);
    }
    if (borrowed) {
      params = params.set('borrowed', borrowed);
    }
    if (publicationDate) {
      params = params.set('publicationDate', publicationDate);
    }
    if (language) {
      params = params.set('language', language);
    }
    if (subject) {
      params = params.set('subject', subject);
    }
    if (ages) {
      params = params.set('ages', ages);
    }
    if (level) {
      params = params.set('level', level);
    }
    if (createdBy) {
      params = params.set('createdBy', createdBy);
    }
    if (isnew) {
      params = params.set('isnew', isnew);
    }
    if (duration) {
      params = params.set('duration', duration);
    }
    return this.apiService
      .Read(`/EducationalResource/getAll?page=${page}&limit=${limit}${params.toString()}`)
      .pipe(
        map((response: {data:any[],totalCount:number}) => {
          this.items = response.data || [];
          this.itemsSubject.next(this.items); // עדכון ה-BehaviorSubject
          this.totalItems=response.totalCount
          this.totalSubject.next(this.totalItems)
          console.log("items************** "+this.items);
          
          return this.items;
        })
      );
  }
 

  searchItems(searchTerm: string = this.searchTerm,page: number = 0,
    limit: number = 100): Observable<Item[]> {
    let params = new HttpParams()
      // .set('page', this.page.toString())
      // .set('limit', this.limit.toString());
    
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    return this.apiService
      .Read(`/EducationalResource/getAll?page=${page}&limit=${limit}&${params.toString()}`)
      .pipe(
        map((response: {data:any[],totalCount:number}) => {
          this.items = response.data || [];
          this.itemsSubject.next(this.items);
          this.totalItems = response.totalCount;  // עדכון של totalItems לפי התוצאות שסוננו
          this.totalSubject.next(this.totalItems)
          return this.items;
        })
      );
  }

  

  fetchItems(page: number = 0,
    limit: number = 100): void {
    this.isFetching = true;
    
  let params = new HttpParams()
    // .set('page', this.page.toString())
    // .set('limit', this.limit.toString());
    console.log("************",page,limit);

  if (this.searchTerm) {
    params = params.set('searchTerm', this.searchTerm);
  }
    console.log("type in service", this.typeFilter);

  if (this.typeFilter && this.typeFilter !== 'all') {
      
    params = params.set('filterType', this.typeFilter);
  }
    if (this.title) {
      params = params.set('title', this.title);
    }
    if (this.author) {
      params = params.set('author', this.author);
    }
    if (this.borrowed) {
      params = params.set('borrowed', this.borrowed);
    }
    if (this.publicationDate) {
      params = params.set('publicationDate', this.publicationDate);
    }
    if (this.language) {
      params = params.set('language', this.language);
    }
    if (this.subject) {
      params = params.set('subject', this.subject);
    }
    if (this.ages) {
      params = params.set('ages', this.ages);
    }
    if (this.level) {
      params = params.set('level', this.level);
    }
    if (this.createdBy) {
      params = params.set('createdBy', this.createdBy);
    }
    if (this.isnew) {
      params = params.set('isnew', this.isnew);
    }
    if (this.duration) {
      params = params.set('duration', this.duration);
    }
  
    console.log("URL with parameters:", `/EducationalResource/getAll?${params.toString()}`);
    console.log("params",params)
    console.log("params.toString",params.toString)
     this.apiService.Read(`/EducationalResource/getAll?page=${page}&limit=${limit}&${params.toString()}`)
     .subscribe(
      (response: {data:any[],totalCount:number}) => {
        this.items = response.data || [];
        this.itemsSubject.next(this.items); // עדכון ה-BehaviorSubject
        this.totalItems = response.totalCount;  // עדכון של totalItems לפי התוצאות שסוננו
        this.totalSubject.next(this.totalItems)
        console.log('items after favorites:', this.items);
        this.ifArrIsEmtySubject.next(this.items.length === 0); // עדכון הערך
        console.log('total items:--------', this.totalItems);
       
      },
      (error) => {
        console.error('Error fetching items:', error);
      
      }
    );
}
}

