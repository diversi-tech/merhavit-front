import { ItemsService } from '../../items.service';
import {
  EventEmitter,
  Component,
  OnInit,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router'; // ייבוא Router
import { filter } from 'rxjs/operators'; // ייבוא filter
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { debounceTime, distinctUntilChanged } from 'rxjs'; // אופרטורים לצמצום כמות הקריאות לשירות
import { ChangeDetectorRef } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SearchService } from '../../shared/search.service';
import { Item } from '../../item.inteface';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-top-icons',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
  ],
  templateUrl: './top-icons.component.html',
  styleUrl: './top-icons.component.css',
})
export class TopIconsComponent {
  @Output() search: EventEmitter<string | null> = new EventEmitter<
    string | null
  >();
  searchControl: FormControl = new FormControl('');
  typeControl: FormControl = new FormControl('');
  titleControl: FormControl = new FormControl('');
  authorControl: FormControl = new FormControl('');
  borrowedControl: FormControl = new FormControl('');
  publicationDateControl: FormControl = new FormControl('');
  languageControl: FormControl = new FormControl('');
  subjectControl: FormControl = new FormControl('');
  agesControl: FormControl = new FormControl('');
  levelControl: FormControl = new FormControl('');
  createdByControl: FormControl = new FormControl('');
  isnewControl: FormControl = new FormControl('');
  durationControl: FormControl = new FormControl('');
  // יצירת תיבת קלט עם ערך התחלתי ריק
  selectedFileType: string = 'all';
  showFilterOptions: boolean = false;
  showDetails: boolean = false;
  public userType: string = ''; // משתנה לשמירת סוג המשתמש
  public firstName: string = ''; // משתנה לשם פרטי (אות ראשונה)
  isUserManagementComponent = false;
  isSearchHistoryVisible: boolean = false;
  searchResults: any[] = [];
  userId: string = '';
  selectedFilter: string = '';
  searchTerm = '';
  typeFilter = '';
  items: Item[] = [];
  filters = {
    email: '',
    class: '',
    specialization: '',
    userType: '',
    firstName: '',
    lastName: '',
    idNumber: '',
    address: '',
    phone: '',
  };

  searchHistories: { [key: string]: string[] } = {}; // מילון לאחסון היסטוריות חיפוש

  constructor(
    private router: Router,
    private itemsService: ItemsService,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.extractUserDetailsFromToken(); // קריאה לפונקציה בעת טעינת הרכיב
    this.getUserTypeFromToken();
  }

  extractUserDetailsFromToken(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const decodedToken: any = jwtDecode(token);
          const firstName = decodedToken.firstName || ''; // שים לב שהשדה הזה צריך להתאים לשם במבנה ה-token
          this.firstName = firstName.charAt(0).toUpperCase(); // קבלת האות הראשונה
          console.log('First Name Initial:', firstName);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      } else {
        console.error('Token not found in localStorage');
      }
    } else {
      console.warn('localStorage is not available');
    }
  }

  getUserTypeFromToken(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const decodedToken: any = jwtDecode(token);
          this.userType = decodedToken.userType || '';
          console.log(this.userType);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    } else {
      console.error('localStorage is not available on the server.');
    }
  }
  // פונקציה לניווט לעמוד הראשי
  logout(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('access_token'); // הסרת ה-token
      this.router.navigate(['/welcome']); // ניווט לעמוד welcome
    } else {
    }
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: HTMLElement) {
    const dropdownContainer = document.querySelector(
      '.dropdown-container'
    ) as HTMLElement;
    const filterDetailsBox = document.querySelector(
      '.filter-details-box'
    ) as HTMLElement;

    // בדיקה אם הלחיצה הייתה מחוץ לאזור התפריט
    if (dropdownContainer && !dropdownContainer.contains(target)) {
      this.showFilterOptions = false;


      if (filterDetailsBox && !filterDetailsBox.contains(target) && !target.classList.contains('fa-filter')) {
        this.showDetails = false;
      }
      // איפוס השדות באובייקט filters
      this.resetFilters();
    }

    // בדיקה אם הלחיצה הייתה מחוץ לאזור הסינון
    if (
      filterDetailsBox &&
      !filterDetailsBox.contains(target) &&
      !target.classList.contains('fa-filter')
    ) {
      this.showDetails = false;
      this.resetFilters();
    }
  }

  // פונקציה לאיפוס השדות באובייקט filters
  resetFilters() {
    this.filters = {
      email: '',
      class: '',
      specialization: '',
      userType: '',
      firstName: '',
      lastName: '',
      idNumber: '',
      address: '',
      phone: '',
    };
    // this.onFilterChangeUsers();
  }
}
