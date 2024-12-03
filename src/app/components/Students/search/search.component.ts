import { Component } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  selectedFileType: string = 'all';
  
  // פונקציה לבחירת סוג הקובץ
  onFilterChange(event: any) {
    this.selectedFileType = event.target.value;
    console.log('סוג הקובץ שנבחר:', this.selectedFileType);
    // ניתן להוסיף כאן קריאה לפונקציה ב-Backend ב-NestJS
  }
}
