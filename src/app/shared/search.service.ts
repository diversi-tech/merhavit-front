import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private searchTermSubject = new BehaviorSubject<string>('all');
  private filterOptionSubject = new BehaviorSubject<string>('');

  searchTerm$ = this.searchTermSubject.asObservable();
  filterOption$ = this.filterOptionSubject.asObservable();

  setSearchTerm(term: string) {
    console.log('setSearchTerm', term);

    this.searchTermSubject.next(term);
  }

  setFilterOption(option: string) {
    this.filterOptionSubject.next(option);
  }
}
