import { ItemsService } from './../../../items.service';
import {  EventEmitter,Component,OnInit, HostListener, Input,Output } from '@angular/core';
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
  isSearchHistoryVisible: boolean = false;
  searchResults:any[]=[];
 selectedFilter: string = ''; 
  searchTerm = '';
  typeFilter = '';
items:Item[]=[];
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
 

 
  constructor(private router: Router, private itemsService: ItemsService,private searchService:SearchService, private cdr: ChangeDetectorRef,private route: ActivatedRoute) { }


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
        this.searchControl.valueChanges.subscribe(value => {
        if (!value?.trim()) {
          console.log('The searchControl is empty or contains only whitespace');
        } else {
          console.log('The searchControl has a value:', value);
        }
      });
    
     this.getUserTypeFromToken();

      this.loadSearchHistory(); // טוען את היסטוריית החיפושים
  
      this.searchControl.valueChanges.subscribe(value => {
        if (!value?.trim()) {
          console.log('The searchControl is empty or contains only whitespace');
        } else {
          console.log('The searchControl has a value:', value);
        }
      });
  }



  onSearchChange(): void {
    if (this.isUserManagementComponent) {
     this.onSearchChangeUsers();}
    console.log('onSearchChange called with searchTerm:', this.searchTerm);
    if (this.searchControl.value === '' || this.searchControl.value === null) {
    //if (this.searchTerm === '') {
      console.log('Search term is empty, fetching all items...');
      this.itemsService.getItems().subscribe((items) => {
        this.items = items;
        console.log('Items fetched:', items);
      });
    }}

  
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

  

  onSearch(searchTerm:string = this.searchControl.value): void {
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
      console.log('לא הוזנה מילה לחיפוש');
    }
  }

  updateSearchHistory(searchTerm: string): void {
    // טוען את ההיסטוריה הקיימת מה-localStorage
    const storedHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      // מסיר חיפושים כפולים
    const updatedHistory = storedHistory.filter((term: string) => term !== searchTerm);
      // מוסיף את החיפוש הנוכחי לראש הרשימה
    updatedHistory.unshift(searchTerm);
      // שומר רק עד 7 חיפושים
    if (updatedHistory.length > 7) {
      updatedHistory.pop();   }
      // מעדכן את ה-localStorage
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      // מעדכן את הרשימה המקומית
    this.searchResults = updatedHistory;
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
      const storedHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const searchTerm = this.searchControl.value.toLowerCase(); // האותיות שנכתבו בשורת החיפוש
    
      if (searchTerm) {
        // סינון לפי הערך בשורת החיפוש
        this.searchResults = storedHistory.filter((term: string) =>
          term.toLowerCase().includes(searchTerm)
        );
      } else {
        // הצגת כל ההיסטוריה אם אין ערך בשורת החיפוש
        this.searchResults = storedHistory; }    } else {
      console.error('localStorage is not available on the server.');
    }
    
  }


  
  //onSearch(): void {
    //const searchTerm = this.searchControl.value;  
//     console.log("searchTerm",searchTerm)
  //  if (searchTerm) {
    //  this.itemsService.searchItems(searchTerm).subscribe(
      //  (response) => {
        //  this.items=response;
          //console.log('התקבלו התוצאות:', response);
//        },
  //      (error) => {
    //      console.error('שגיאה בשרת:', error);
      //  }
//      );
  //  } else {
    //  alert('לא הוזנה מילה לחיפוש')
//      console.log('לא הוזנה מילה לחיפוש');
  //  }
  //}
  
  
  



 private checkIfUserManagementRoute(): void {
    const currentUrl = this.router.url; // מקבל את ה-URL הנוכחי
    this.isUserManagementComponent = currentUrl.includes('/user-management');
  }

  // פונקציה להצגת אפשרויות
  toggleFilterOptions() {
    this.showFilterOptions = !this.showFilterOptions;
  }


  onSelectFilter(filterType: string): void {
    this.selectedFilter = filterType;
    this.selectedFileType = filterType;
    this.showFilterOptions = false;
    console.log('סוג הקובץ שנבחר:', filterType);
    this.itemsService.typeFilter = filterType; // מעדכן את הסינון ב-service
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
      this.resetFilters();
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
    // צור את מילת החיפוש מתוך כל השדות (אם הם מלאים)
    const filterText = Object.keys(this.filters) // מקבל את שמות השדות
      .filter((key) => this.filters[key as keyof typeof this.filters] !== '') // מסנן את השדות שאינם ריקים
      .map((key) => `${key}:${this.filters[key as keyof typeof this.filters]}`) // מצרף את שם השדה ואת הערך
      .join(' '); // מצרף את כל השדות לשורת חיפוש אחת

    // שולח את מילת החיפוש לשירות החיפוש
    this.searchService.setFilterOption(filterText);
  }
 // onSearchChange() {
   // if (this.isUserManagementComponent) {
     // this.onSearchChangeUsers();
   // }
 // }

  onSearchChangeUsers() {
    this.searchService.setSearchTerm(this.searchTerm);
  }



}


