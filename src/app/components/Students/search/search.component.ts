import { ItemsService } from './../../../items.service';
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
  searchResults: any[] = [];
  searchTerm = '';
  typeFilter = '';


  constructor(private router: Router, private itemsService: ItemsService) { }


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

  // onsearch(event: Event): void {
  //   const target = event.target as HTMLInputElement;
  //   this.searchTerm = target.value; // עדכון המשתנה ללא הצגה ב-HTML
  //   console.log(this.searchTerm); // להדפיס לקונסול אם את רוצה לראות את הערך
  //   this.itemsService.getItems(0, 10, this.searchTerm, this.typeFilter).subscribe({
  //     next: (response) => {
  //       console.log('Search results:', response);
  //       this.searchResults = Array.isArray(response) ? response : response.data || [];
  //     },
  //     error: (err) => {
  //       console.error('Error performing search:', err);
  //     },
  //   });
  // }


  onsearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value.trim(); // עדכון המשתנה במילת החיפוש

    // בדוק אם לא הוזן מונח חיפוש
    if (!this.searchTerm) {
      console.log('Search term is empty');
      this.searchResults = [];
      return;
    }

    // הדפסת פרמטרים למעקב
    console.log('Search term:', this.searchTerm);
    console.log('Type filter:', this.typeFilter);

    // קריאה לשירות החיפוש עם פרמטרי הסינון
    this.itemsService.getItems(0, 10, this.searchTerm, this.typeFilter).subscribe({
      next: (response: any) => {
        console.log('Raw response:', response);
        // אם התגובה מכילה מערך ב-data
        const filteredData = response.data.filter((item: any) => 
          item.title.includes(this.searchTerm) || item.description.includes(this.searchTerm)
        );
        this.searchResults = filteredData; // עדכון התוצאות במסך
        console.log('Filtered results:', this.searchResults);
      },
      error: (err: any) => {
        console.error('Error performing search:', err.message);
      },
    });
  }

  
}
