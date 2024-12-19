import { Component } from '@angular/core';
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
  public firstName: string = ''; // משתנה לשם פרטי (אות ראשונה)

  constructor(private router: Router) {
    console.log('Token:', localStorage.getItem('access_token'));
  }

  ngOnInit(): void {
    this.extractUserDetailsFromToken(); // קריאה לפונקציה בעת טעינת הרכיב
  }

  // פענוח ה-JWT וקבלת האות הראשונה של השם
  extractUserDetailsFromToken(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const firstName = decodedToken.firstName || ''; // שים לב שהשדה הזה צריך להתאים לשם במבנה ה-token
        this.firstName = firstName.charAt(0).toUpperCase(); // קבלת האות הראשונה
        console.log('First Name Initial:',firstName);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    } else {
      console.error('Token not found in localStorage');
    }
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
}
