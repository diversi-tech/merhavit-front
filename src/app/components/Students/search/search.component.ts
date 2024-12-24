import { ItemsService } from './../../../items.service';
import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // ייבוא Router
import { jwtDecode } from 'jwt-decode';
import { Item } from '../../interfaces/item.model';
import { debounceTime, distinctUntilChanged } from 'rxjs'; // אופרטורים לצמצום כמות הקריאות לשירות
import { ChangeDetectorRef } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule,
    MatFormFieldModule,MatInputModule,MatIconModule,MatButtonModule,],
})
export class SearchComponent implements OnInit {
  @Output() search: EventEmitter<string | null> = new EventEmitter<string | null>(); 
  searchControl: FormControl = new FormControl(''); 
  // יצירת תיבת קלט עם ערך התחלתי ריק

  selectedFileType: string = 'all';
  showFilterOptions: boolean = false;
  showDetails: boolean = false;
  public userType: string = ''; // משתנה לשמירת סוג המשתמש
  // searchResults: any[] = [];
  items:Item[]=[];
  searchTerm = '';
  typeFilter = '';


  constructor(private router: Router, private itemsService: ItemsService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.searchControl.valueChanges
  }
  
  onSearch(): void {
    const searchTerm = this.searchControl.value;  // לוקח את הערך שנכנס בשדה הקלט
     console.log("searchTerm",searchTerm)
    if (searchTerm) {
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
      console.log('לא הוזנה מילה לחיפוש');
    }
  }
// performSearch(query: string): void {
//   console.log("enter to performSearch in service")
//   console.log('Search term:', query);
//   console.log('Type filter:', this.typeFilter);

//   this.itemsService.getItems(0, 10, query, this.typeFilter).subscribe({
//     next: (response: any) => {
//       console.log('Raw response:', response);
//       const filteredData = response.data.filter((item: any) => 
//         item.title.includes(query) || item.description.includes(query) || item.author.includes(query)
//         || item.level.includes(query) || item.language.includes(query) || item.createdBy.includes(query)
//       );
//       this.items = filteredData;
//       console.log('Filtered results:', this.items);
//       this.cdr.detectChanges(); // הוספת רענון
//     }, 
//     error: (err: any) => {
//       console.error('Error performing search:', err.message);
//     },
//   });}


  
  // פונקציה לטיפול בשינוי סוג קובץ
  onFilterChange(event: any) {
    console.log("enter to onFilterChange in service")
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
    console.log("enter to onSelectFilter in service")
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
