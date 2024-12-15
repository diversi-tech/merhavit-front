import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemsListComponent } from '../../../show/show.component'

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule,ItemsListComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  showFilterOptions: boolean = false;
  showDetails: boolean = false;
  searchTerm: string = ''; // משתנה שמחזיק את הערך בשורת החיפוש
  selectedFileType: string = 'all'; // ברירת המחדל לסוג הקובץ
  resources: any[] = []; // כאן נשמור את התוצאות שמתקבלות מהשרת
  limit: number = 6; // מספר תוצאות לעמוד
  page: number = 0; // העמוד הנוכחי
  private apiUrl = 'http://localhost:3001/EducationalResource/getAll'; // כתובת ה-API שלך

  constructor(private http: HttpClient) { } // הכנסת HttpClient כדי לשלוח בקשות לשרת

   
  onSearch(): void {
    console.log('חיפוש מתבצע עם מילת חיפוש:', this.searchTerm);  // הודעת דיבוג
    const params: any = {
      limit: this.limit,
      page: this.page,
    };

    // הוספת הפרמטרים רק אם יש בהם ערך
    if (this.searchTerm) {
      params.searchTerm = this.searchTerm; // פרמטר חיפוש
    }

    if (this.selectedFileType !== 'all') {
      params.typeFilter = this.selectedFileType;
    }

    this.http.get<any[]>(this.apiUrl, { params }).subscribe({
      next: (data) => {
        console.log('תוצאות שהתקבלו:', data);
        this.resources = data; // עדכון רשימת התוצאות
      },
      error: (err) => {
        console.error('שגיאה בבקשה לשרת:', err);
      },
    });
  }


  onSelectFilter(fileType: string): void {
    this.selectedFileType = fileType;
    this.onSearch();
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


  toggleDetails() {
    this.showDetails = !this.showDetails;
  }


}
