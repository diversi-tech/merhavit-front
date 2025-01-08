import { ItemsService } from './../../../items.service';
import { EventEmitter, Component, OnInit, HostListener, Input, Output } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router'; // ייבוא Router
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
import { SearchService } from '../../../shared/search.service';
import { Item } from '../../../item.inteface';
import {MatDividerModule} from '@angular/material/divider';
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule,
    MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule,
    MatButtonModule, MatDividerModule, MatIconModule],
})
export class SearchComponent implements OnInit {
  @Output() search: EventEmitter<string | null> = new EventEmitter<string | null>();
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
    classId: '',
    assignedSeminaryId:'',
    specialization: '',
    userType: '',
    firstName: '',
    lastName: '',
    idNumber: '',
    address: '',
    phoneNumber: '',
  };
  searchHistories: { [key: string]: string[] } = {}; // מילון לאחסון היסטוריות חיפוש
  constructor(private router: Router, private itemsService: ItemsService, private searchService: SearchService, private cdr: ChangeDetectorRef, private route: ActivatedRoute) { }
  ngOnInit(): void {
    this.searchControl.valueChanges
    this.extractUserDetailsFromToken(); // קריאה לפונקציה בעת טעינת הרכיב
    this.checkIfUserManagementRoute(); // בדיקה אם הנתיב הוא user-management
    // האזנה לשינויים בנתיב
    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkIfUserManagementRoute(); // בדיקה מחדש בכל שינוי ניווט
      });
    this.getUserTypeFromToken();
    this.loadSearchHistory(); // טוען את היסטוריית החיפושים
    this.searchControl.valueChanges.subscribe(value => {
      this.searchControl.valueChanges
        .pipe(debounceTime(300), distinctUntilChanged()) // מצמצם קריאות
        .subscribe(() => {
          this.loadSearchHistory(); // עדכון תיבת ההיסטוריה לפי הערך החדש
        });
    });
  }
  onSearchChange(): void {
    if (this.isUserManagementComponent) {
      this.onSearchChangeUsers();
    }
    console.log('onSearchChange called with searchTerm:', this.searchTerm);
    if (this.searchControl.value === '' || this.searchControl.value === null) {
      console.log('Search term is empty, fetching all items...');
      this.itemsService.getItems().subscribe((items) => {
        this.items = items;
        console.log('Items fetched:', items);
      });
    }
  }
  // פענוח ה-JWT וקבלת האות הראשונה של השם
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
  onSearch(searchTerm: string = this.searchControl.value): void {
    this.searchControl.setValue(searchTerm);
    // לוקח את הערך שנכנס בשדה הקלט
    console.log("searchTerm", searchTerm);
    if (searchTerm) {
      this.updateSearchHistory(searchTerm); // עדכון היסטוריית חיפושים
      this.itemsService.searchItems(searchTerm).subscribe(
        (response) => {
          console.log('התקבלו התוצאות:', response);
          // כאן תוכל לעבד את התשובה ולבצע פעולה בהתאם (כמו עדכון רשימה)
        },
        (error) => {
          console.error('שגיאה בשרת:', error);
        }
      );
    } else {
      this.onExtraFilter();
    }
  }
  getUserIdFromToken(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const decodedToken: any = jwtDecode(token);
          // this.userType = decodedToken.userType || '';
          this.userId = decodedToken.idNumber || '';
          console.log('userId', this.userId);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    } else {
      console.warn('Code is running on the server. Skipping token check.');
    }
  }
  updateSearchHistory(searchTerm: string): void {
    // שליפת ה- userId מה-token
    this.getUserIdFromToken();
    if (!this.userId) {
      console.error('User ID not found. Unable to update search history.');
      return;
    }
    // שליפת היסטוריית כל המשתמשים מה-localStorage או יצירת אובייקט ריק
    const storedHistories: { [key: string]: string[] } = JSON.parse(localStorage.getItem('searchHistories') || '{}');
    // שליפת ההיסטוריה של המשתמש הנוכחי או יצירת רשימה ריקה
    const userHistory = storedHistories[this.userId] || [];
    // הסרת מופעים קודמים של החיפוש הנוכחי
    const updatedHistory = userHistory.filter(term => term !== searchTerm);
    // הוספת החיפוש הנוכחי לראש הרשימה
    updatedHistory.unshift(searchTerm);
    // הגבלת ההיסטוריה ל-7 חיפושים בלבד
    const trimmedHistory = updatedHistory.slice(0, 7);
    // עדכון ההיסטוריה של המשתמש הנוכחי ב-dictionary
    storedHistories[this.userId] = trimmedHistory;
    // שמירת היסטוריית כל המשתמשים ב-localStorage
    localStorage.setItem('searchHistories', JSON.stringify(storedHistories));
    // עדכון הרשימה המקומית (לדוגמה, לעדכון תצוגת היסטוריית החיפושים של המשתמש הנוכחי)
    this.searchResults = trimmedHistory;
  }
  // הצגת תיבת ההיסטוריה
  showSearchHistory() {
    this.isSearchHistoryVisible = true;
  }
  // הסתרת תיבת ההיסטוריה
  hideSearchHistory() {
    setTimeout(() => {
      this.isSearchHistoryVisible = false;
    }, 600); // השהיה קטנה כדי לאפשר לחיצה על פריטים
  }
  loadSearchHistory(): void {
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      // שליפת ה- userId מה-token
      this.getUserIdFromToken();
      if (!this.userId) {
        console.error('User ID not found. Unable to load search history.');
        return;
      }
      // שליפת היסטוריית כל המשתמשים מה-localStorage או יצירת אובייקט ריק
      const storedHistories: { [key: string]: string[] } = JSON.parse(localStorage.getItem('searchHistories') || '{}');
      // שליפת ההיסטוריה של המשתמש הנוכחי או יצירת רשימה ריקה
      const userHistory = storedHistories[this.userId] || [];
      const searchTerm = this.searchControl.value.toLowerCase(); // האותיות שנכתבו בשורת החיפוש
      if (searchTerm) {
        // סינון לפי הערך בשורת החיפוש
        this.searchResults = userHistory.filter((term: string) =>
          term.toLowerCase().includes(searchTerm)
        );
      } else {
        // הצגת כל ההיסטוריה אם אין ערך בשורת החיפוש
        this.searchResults = userHistory;
      }
    } else {
      console.error('localStorage is not available on the server.');
    }
  }
  private checkIfUserManagementRoute(): void {
    const currentUrl = this.router.url; // מקבל את ה-URL הנוכחי
    this.isUserManagementComponent = currentUrl.includes('/management/user');
  }
  // פונקציה להצגת אפשרויות
  toggleFilterOptions() {
    this.showFilterOptions = !this.showFilterOptions;
  }
  onSelectFilter(filterType: string): void {
    this.selectedFilter = filterType;
    this.selectedFileType = filterType;
    this.showFilterOptions = false;
    this.itemsService.typeFilter = filterType; // מעדכן את הסינון ב-service
    this.itemsService.searchTerm = this.searchControl.value;
    this.itemsService.type = this.typeControl.value;
    this.itemsService.title = this.titleControl.value;
    this.itemsService.borrowed = this.borrowedControl.value;
    this.itemsService.publicationDate = this.publicationDateControl.value;
    this.itemsService.language = this.languageControl.value;
    this.itemsService.subject = this.subjectControl.value;
    this.itemsService.ages = this.agesControl.value;
    this.itemsService.level = this.levelControl.value;
    this.itemsService.createdBy = this.createdByControl.value;
    this.itemsService.isnew = this.isnewControl.value;
    this.itemsService.duration = this.durationControl.value;
    this.itemsService.fetchItems(); // שולח את הבקשה לשרת עם הסינון החדש
  }
  // פונקציה לטיפול בשינוי סוג קובץ
  onFilterChange(event: any) {
    this.selectedFileType = event.target.value;
    console.log('סוג הקובץ שנבחר:', this.selectedFileType);
  }
  toggleDetails() {
    this.showDetails = !this.showDetails;
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
    }
  }
  // פונקציה לאיפוס השדות באובייקט filters
  resetFilters() {
    this.filters = {
      email: '',
      classId: '',
      assignedSeminaryId:'',
      specialization: '',
      userType: '',
      firstName: '',
      lastName: '',
      idNumber: '',
      address: '',
      phoneNumber: '',
    };
    this.onFilterChangeUsers();
  }
  onFilterChangeUsers() {
    // צור את מילת החיפוש מתוך כל השדות (אם הם מלאים)
    const filterText = Object.keys(this.filters) // מקבל את שמות השדות
      .filter((key) => this.filters[key as keyof typeof this.filters] !== '') // מסנן את השדות שאינם ריקים
      .map((key) => `${key}:${this.filters[key as keyof typeof this.filters]}`) // מצרף את שם השדה ואת הערך
      .join(' '); // מצרף את כל השדות לשורת חיפוש אחת
    // שולח את מילת החיפוש לשירות החיפוש
    console.log("filterText",filterText);
    
    this.searchService.setFilterOption(filterText);
  }
  onSearchChangeUsers() {
    this.searchService.setSearchTerm(this.searchTerm);
  }
  onExtraFilter() {
    console.log("in onExtraFilter")
    this.typeFilter = this.typeControl.value;
    this.itemsService.title = this.titleControl.value;
    this.itemsService.author = this.authorControl.value;
    this.itemsService.borrowed = this.borrowedControl.value;
    this.itemsService.publicationDate = this.publicationDateControl.value;
    this.itemsService.language = this.languageControl.value;
    this.itemsService.subject = this.subjectControl.value;
    this.itemsService.ages = this.agesControl.value;
    this.itemsService.level = this.levelControl.value;
    this.itemsService.createdBy = this.createdByControl.value;
    this.itemsService.isnew = this.isnewControl.value;
    this.itemsService.duration = this.durationControl.value;
    console.log('Type:', this.typeControl.value);
    console.log('Title:', this.titleControl.value);
    this.itemsService.fetchItems()
  }
  onClear(){
    this.selectedFileType = 'all';
    this.selectedFilter='all';
    this.itemsService.typeFilter = '';
    this.searchControl.setValue('');
    this.typeControl.setValue('');
    this.borrowedControl.setValue('');
    this.languageControl.setValue('');
    this.subjectControl.setValue('');
    this.durationControl.setValue('');
    this.titleControl.setValue('');
    this.createdByControl.setValue('');
    this.publicationDateControl.setValue('');
    this.levelControl.setValue('');
    this.isnewControl.setValue('');
    this.itemsService.getItems().subscribe((items) => {
      this.items = items;
      console.log('Items fetched:', items);
    });
  }
}