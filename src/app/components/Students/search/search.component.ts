import { Component, HostListener } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // ייבוא Router
import { jwtDecode } from 'jwt-decode';

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
  isSearchHistoryVisible: boolean = false;
  searchQuery: string = ''; // משתנה למעקב אחר החיפוש
  public userType: string = ''; // משתנה לשמירת סוג המשתמש
  // רשימה מדומה של היסטוריית חיפושים
  mockSearchHistory: string[] = [
    'איך נוצר הר געש הסבר לילדים',
    'הר געש מתפרץ',
    'הר געש בישראל',
    'שמות של הרי געש',
    'הר געש רדום',
    'הר געש פעיל',
  ];

  constructor(private router: Router) {}
  
  // הצגת תיבת ההיסטוריה
  showSearchHistory() {
    this.isSearchHistoryVisible = true;
  }

  ngOnInit(): void {
     if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      // הקוד יפעל רק בצד הלקוח
      this.getUserTypeFromToken();
    } else {
      console.warn('Code is running on the server. Skipping token check.');
    } 
  
    hideSearchHistory() {
    setTimeout(() => {
      this.isSearchHistoryVisible = false;
    }, 200); // השהיה קטנה כדי לאפשר לחיצה על פריטים
  }

  onHistoryItemClick(item: string): void {
    // פעולה בעת לחיצה על היסטוריית החיפושים
    this.searchQuery = item; // מעדכן את שורת החיפוש עם הערך שנבחר
    console.log('Selected from history:', item);
  
    // אם יש צורך לבצע חיפוש מיידי
    // this.performSearch(item);
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
  toggleFilterOptions() {
    this.showFilterOptions = !this.showFilterOptions;
  }

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  onSelectFilter(option: string) {
    this.selectedFileType = option;
    this.showFilterOptions = false; // סוגר את התפריט לאחר הבחירה
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: HTMLElement) {
    const dropdownContainer = document.querySelector('.dropdown-container') as HTMLElement;
    const filterDetailsBox = document.querySelector('.filter-details-box') as HTMLElement;

    // בדיקה אם הלחיצה הייתה מחוץ לאזור התפריט או הסינון
    if (dropdownContainer && !dropdownContainer.contains(target)) {
      this.showFilterOptions = false;
    }

    if (filterDetailsBox && !filterDetailsBox.contains(target) && !target.classList.contains('fa-filter')) {
      this.showDetails = false;
    }
  }
 
}
