import { ItemsService } from './../../../items.service';
import { Component, HostListener, Input } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router'; // ייבוא Router
import { filter } from 'rxjs/operators'; // ייבוא filter
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
    public firstName: string = ''; // משתנה לשם פרטי (אות ראשונה)
  isUserManagementComponent = false;
  // searchResults: any[] = [];
  items:Item[]=[];
  searchTerm = '';
  typeFilter = '';


  constructor(private router: Router, private itemsService: ItemsService, private cdr: ChangeDetectorRef,private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.searchControl.valueChanges
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
    const currentUrl = this.router.url; // מקבל את ה-URL הנוכחי
//   console.log('Type filter:', this.typeFilter);

//       const filteredData = response.data.filter((item: any) => 
//         item.title.includes(query) || item.description.includes(query) || item.author.includes(query)
//         || item.level.includes(query) || item.language.includes(query) || item.createdBy.includes(query)
//       );
//       this.items = filteredData;
//       console.log('Filtered results:', this.items);
//       this.cdr.detectChanges(); // הוספת רענון
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

 private checkIfUserManagementRoute(): void {
    const currentUrl = this.router.url; // מקבל את ה-URL הנוכחי
    this.isUserManagementComponent = currentUrl.includes('/user-management');
  }

  // פונקציה להצגת אפשרויות
  toggleFilterOptions() {
    this.showFilterOptions = !this.showFilterOptions;



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

    console.log("enter to onSelectFilter in service")
  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: HTMLElement) {
    const dropdownContainer = document.querySelector(
      '.dropdown-container'
    ) as HTMLElement;
    const filterDetailsBox = document.querySelector(
      '.filter-details-box'
    ) as HTMLElement;

    // בדיקה אם הלחיצה הייתה מחוץ לאזור התפריט או הסינון
    if (dropdownContainer && !dropdownContainer.contains(target)) {
      this.showFilterOptions = false;
    }

    if (
      filterDetailsBox &&
      !filterDetailsBox.contains(target) &&
      !target.classList.contains('fa-filter')
    ) {
      this.showDetails = false;
    }
  }
 
}
