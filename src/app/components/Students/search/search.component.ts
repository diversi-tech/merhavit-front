import { Component, HostListener } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router'; // ייבוא Router
import { jwtDecode } from 'jwt-decode';
import { filter } from 'rxjs/operators'; // ייבוא filter
import { SearchService } from '../../../shared/search.service';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
})
export class SearchComponent {
  selectedFileType: string = 'all';
  showFilterOptions: boolean = false;
  showDetails: boolean = false;
  public userType: string = ''; // משתנה לשמירת סוג המשתמש
  public firstName: string = ''; // משתנה לשם פרטי (אות ראשונה)
  isUserManagementComponent = false;
  searchTerm: string = '';
  // filterOption: string = 'all';
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
  constructor(private router: Router,private route: ActivatedRoute,private searchService: SearchService) {}

  ngOnInit(): void {
    this.extractUserDetailsFromToken(); // קריאה לפונקציה בעת טעינת הרכיב
    this.checkIfUserManagementRoute(); // בדיקה אם הנתיב הוא user-management
      // האזנה לשינויים בנתיב
      this.router.events.pipe(filter((event:any) => event instanceof NavigationEnd)).subscribe(() => {
        this.checkIfUserManagementRoute(); // בדיקה מחדש בכל שינוי ניווט
      });

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
  private checkIfUserManagementRoute(): void {
    const currentUrl = this.router.url; // מקבל את ה-URL הנוכחי
    this.isUserManagementComponent = currentUrl.includes('/user-management');
  }

  // פונקציה להצגת אפשרויות
  toggleFilterOptions() {
    this.showFilterOptions = !this.showFilterOptions;
  }

  // פונקציה לטיפול בשינוי סוג קובץ
  onFilterChange(event: any) {
    this.selectedFileType = event.target.value;
    console.log('סוג הקובץ שנבחר:', this.selectedFileType);
  }

  onSelectFilter(filter: string) {
    this.selectedFileType = filter;
    this.showFilterOptions = false; // סגור את הרשימה
    console.log('סוג הקובץ שנבחר:', filter);
  }

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  getUserTypeFromToken(): void {
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
  }

  // פונקציה לניווט לעמוד הראשי
  logout(): void {
    localStorage.removeItem('access_token'); // הסרת ה-token
    this.router.navigate(['/welcome']); // ניווט לעמוד welcome
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
    this.resetFilters()
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
  this.onFilterChangeUsers();
}


  onFilterChangeUsers() {
    console.log('onSearchChange', this.filters);
  
    // צור את מילת החיפוש מתוך כל השדות (אם הם מלאים)
    const filterText = Object.keys(this.filters) // מקבל את שמות השדות
      .filter((key) => this.filters[key as keyof typeof this.filters] !== '') // מסנן את השדות שאינם ריקים
      .map((key) => `${key}:${this.filters[key as keyof typeof this.filters]}`) // מצרף את שם השדה ואת הערך
      .join(' '); // מצרף את כל השדות לשורת חיפוש אחת
  
    // שולח את מילת החיפוש לשירות החיפוש
    this.searchService.setFilterOption(filterText);
  }
  onSearchChange(){
    if(this.isUserManagementComponent){
      this.onSearchChangeUsers()
    }

  }
  

  onSearchChangeUsers() {
    this.searchService.setSearchTerm(this.searchTerm);
  }
}
