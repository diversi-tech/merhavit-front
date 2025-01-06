

import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Item } from './components/interfaces/item.model';

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  public totalItems = 0
  public items: Item[] = [];
  public page: number = 0;
  public limit: number = 10;
  public searchTerm: string = '';
  public typeFilter: string = '';
  public title: string = '';
  public  author: string = '';
  public borrowed: string = '';
  public  publicationDate: string="01-01-2021";//אמור ליהיות מסוג date 
  public language: string = '';
  public subject: string = '';
  public ages: number = 0;
  public level: string = '';
  public createdBy: string = '';
  public isnew: string = '';
  public duration: number = 0;

  constructor(private apiService: ApiService) { }
  ngOnInit(): void {
    this.loadItems(); // קריאה לשרת בהתחלה
  }

  // קריאה לשרת על מנת לאתחל את items עם נתונים
  loadItems(): void {
    this.apiService
      .Read(`/EducationalResource/getAll?page=${this.page}&limit=${this.limit}`)
      .subscribe({
        next: (response: any) => {
          console.log("loadItems response", response)
          this.items = response.data || []; // אתחול המערך בנתונים מהשרת
        },
        error: (err) => {
          console.error('Error fetching items from server', err);
        },
      });
  }

  getItems(
    page: number = this.page,
    limit: number = this.limit,
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
      .set('page', page.toString())
      .set('limit', limit.toString());

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
      .Read(`/EducationalResource/getAll?${params.toString()}`)
      .pipe(
        map((response: any) => {
          this.items = response.data || [];
          console.log("getItems items", this.items)
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

    return this.apiService
      .Read(`/EducationalResource/getAll?${params.toString()}`)
      .pipe(
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

    if (this.typeFilter && this.typeFilter !== 'all') {
      // אם נבחר סוג סינון
      params = params.set('filterType', this.typeFilter);
    }

    this.apiService
      .Read(`/EducationalResource/getAll?${params.toString()}`)
      .subscribe(
        (response: { data: any, totalCount: number }) => {
          this.items = response.data || []; // מבטיח שהמערך יתעדכן רק אם יש נתונים
          console.log('items after favorites:', this.items);
          this.totalItems = response.totalCount
          console.log('total items:--------', this.totalItems);

        },
        (error) => {
          console.error('Error fetching items:', error); // לוג טעות אם יש בעיה בהבאת הנתונים
        }
      );
  }
}
