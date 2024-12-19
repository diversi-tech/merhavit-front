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
  public userType: string = ''; // משתנה לשמירת סוג המשתמש

  constructor(private router: Router) {}


  ngOnInit(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      // הקוד יפעל רק בצד הלקוח
      this.getUserTypeFromToken();
    } else {
      console.warn('Code is running on the server. Skipping token check.');
    }
  }


  // פונקציה לטיפול בשינוי סוג קובץ
  onFilterChange(event: any) {
    this.selectedFileType = event.target.value;
    console.log('סוג הקובץ שנבחר:', this.selectedFileType);
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
