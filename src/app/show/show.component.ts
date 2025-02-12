import {
  Component,
  Injectable,
  OnInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../api.service';
import { jwtDecode } from 'jwt-decode';
import {
  RouterModule,
  Router,
  ActivatedRoute,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Item } from '../components/interfaces/item.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ItemsService } from '../items.service';
import { MatDialog } from '@angular/material/dialog';
import { ChangeDetectorRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { PageEvent } from '@angular/material/paginator';
// import { ChangeDetectionStrategy } from '@angular/core';
import { ConfirmDialogComponent1 } from '../confirm-dialog-delete/confirm-dialog.component';

import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';
import { catchError, Subscription, switchMap, takeUntil } from 'rxjs';
import { Subject, combineLatest, of } from 'rxjs';


@Component({
  selector: 'app-items-list',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatSnackBarModule,
    MatCardModule,
    MatIconModule,
    // RouterOutlet,
    MatPaginatorModule,
  ],
})
export class ItemsListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private refresh$ = new Subject<void>();
  public items: Item[] = []; //מערך המוצרים של הספריה

  public totalItems: number = 0; // תכונה חדשה למעקב אחרי מספר הנתונים
  public userType: string = ''; // משתנה לשמירת סוג המשתמש
  public showNoDataMessage: boolean = false; // משתנה לשליטה בהצגת ההודעה
  public favorites: { itemId: string }[] = [];
  itemsFromServer: any[] = []; // משתנה לשמירת כל הפריטים שהתקבלו מהשרת
  public allItems: Item[] = []; // מערך המכיל את כל הפריטים
  private itemsInterval: any;
  public page: number = 0;
  public limit: number = 10;
  public typeFilter: string = 'all';
  public searchTerm: string = '';
  public ifArrIsEmty: boolean = false;
  private subscription: Subscription = new Subscription();
  viewMode: 'list' | 'grid' = 'list'; // ברירת המחדל היא כרטיסיות

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private apiService: ApiService,
    private router: Router,
    private ro: Router,
    private itemsService: ItemsService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.getUserTypeFromToken();
    this.itemsService.page = 0;
    this.itemsService.limit = 10;

    this.itemsService.fetchItems(this.itemsService.page, this.itemsService.limit); // שליחת בקשה לשרת עם הסינון החדש
     // ביצוע הבדיקה בטעינת הדף
     this.subscription = this.itemsService.ifArrIsEmty$.subscribe((isEmpty) => {
      this.ifArrIsEmty = isEmpty;
      this.showNoDataMessage = isEmpty; // קיצור לוגיקה
      this.defultViewMode();
    });
    // קריאה לשרת כשמשתנה פרמטר
    this.route.queryParams // האזנה לפרמטרים ב-URL
      .pipe(
        switchMap((params) => {
          takeUntil(this.destroy$);
          const type = params['type'] || '';
          if (this.itemsService.typeFilter !== type) {
            this.itemsService.typeFilter = type; // עדכון סוג הסינון בשירות
            this.itemsService.page = 0; // התחלה מחדש
            this.itemsService.getItems(
              this.itemsService.page,
              this.itemsService.limit,
              '',
              type
            );
          }
          //return this.itemsService.items$; // האזנה לזרם הנתונים
          return combineLatest([
            this.itemsService.items$,
            this.itemsService.totalItems$,
          ]);
        }),
        catchError((err) => {
          console.error('Error fetching items:', err);
          return of([]); // במקרה של טעות
        })
      )
      .subscribe(([items, totalItems]) => {
        this.items = items;
        this.totalItems = totalItems;

        this.cdr.detectChanges();
      });
    await this.initializeData();
  }

  async initializeData() {
    try {
      console.log('items before favorites:', this.items);

      await this.loadFavorites();
      this.updateFavoriteStatus();
    } catch (error) {
      console.error('Error initializing data:', error);
    }
    console.log('items after favorites:', this.items);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  defultViewMode() {
    if (this.itemsService.typeFilter || this.typeFilter != 'all') {
      this.viewMode = 'grid'; // שינוי תצוגה לרשימה כאשר הסוג הוא 'all'
    } else {
      this.viewMode = 'list'; // שינוי תצוגה לגריד כאשר הסוג שונה מ-'all'
    }
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid'; // שינוי תצוגה
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
      console.warn('Code is running on the server. Skipping token check.');
    }
  }

  resetPaginator(): void {
    if (this.paginator) {
      this.paginator.pageIndex = this.page;
      this.paginator.pageSize = this.limit;
    }
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex;
    this.limit = event.pageSize;
    this.itemsService.fetchItems(this.page, this.limit)
    this.updateFavoriteStatus();
  }

  async getItems(
    page: number = 0,
    limit: number = 10,
    searchTerm: string = '',
    typeFilter: string = ''
  ): Promise<void> {
    this.searchTerm = searchTerm;
    this.typeFilter = typeFilter;

    this.showNoDataMessage = false;
    const url = `/EducationalResource/getAll?page=${page}&limit=${limit}`;
    console.log(`Requesting URL: ${url}`);
    return new Promise((resolve, reject) => {
      this.apiService.Read(url).subscribe({
        next: (response: { data: any[]; totalCount: number }) => {
          console.log('API Response: ', response);

          if (Array.isArray(response)) {
            this.itemsFromServer = response.data;
            this.totalItems = response.totalCount; // משתמשים ב-totalCount מהשרת

            console.log('Items received from server:', this.itemsFromServer);

            // מבצע סינון לפי סוג
            this.filterItemsByType(searchTerm, typeFilter);
          } else {
            this.itemsFromServer = response.data;
            this.filterItemsByType(searchTerm, typeFilter);
          }

          resolve();
        },
        error: (err) => {
          console.error('Error fetching items', err);
          this.showNoDataMessage = true;
          this.totalItems = 0; // משתמשים ב-totalCount מהשרת
          reject(err);
        },
      });
    });
  }

  filterItemsByType(searchTerm: string = '', typeFilter: string = ''): void {
    let filteredItems = [...this.itemsFromServer];

    console.log('Before filtering:', filteredItems);
    console.log('Search term:', searchTerm);
    console.log('Type filter:', typeFilter);

    // סינון לפי חיפוש (searchTerm)
    if (searchTerm) {
      filteredItems = filteredItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('After search term filtering:', filteredItems);
    }

    // סינון לפי סוג (typeFilter)
    if (typeFilter) {
      filteredItems = filteredItems.filter((item) => item.type === typeFilter);
      console.log('After type filter:', filteredItems);
    }

    this.items = filteredItems;
    console.log('Final filtered items:', this.items);
    // this.totalItems=this.items.length
  }

  async editItem(item1: Item) {
    this.router.navigate(['/upload-resource', item1._id], {
      queryParams: { additionalParam: 'edit' },
    });
  }

  deleteResource(itemToDelete: Item) {
    console.log('Delete item: ', itemToDelete);
    // הוסף כאן את הלוגיקה למחיקת משתמש

    const dialogRef = this.dialog.open(ConfirmDialogComponent1);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.apiService
          .Delete(`/EducationalResource/${itemToDelete._id}`, {})
          .subscribe({
            next: (response) => {
              // פעולה במידה והמחיקה הצליחה
              console.log('Item deleted successfully:', response);
              // הצגת הודעת הצלחה למשתמש
              this.snackBar.open('הפריט נמחק בהצלחה', 'סגור', {
                duration: 3000,
                panelClass: ['custom-snack-bar'], // הוספת הכיתה המותאמת אישית
              });
              // ניתן לעדכן את ה-UI או להוריד את הפריט מהרשימה המקומית
              this.items = this.items.filter(
                (item) => item._id !== itemToDelete._id
              );
              this.items = this.items; // עדכון הפריטים המוצגים
              this.totalItems--; // עדכון מספר הנתונים לאחר מחיקה
            },
            error: (err) => {
              // טיפול במקרה של שגיאה
              console.error('Error deleting item:', err);
              this.snackBar.open('בעיה במחיקת הפריט , נסה שוב', 'Close', {
                duration: 3000,
                panelClass: ['custom-snack-bar'], // הוספת הכיתה המותאמת אישית
              });
            },
            complete: () => {
              // פעולה כאשר הקריאה הסתיימה (אופציונלי)
              console.log('Delete request completed.');
              this.removeFromFavorites(itemToDelete)
              
             
                const query = `/borrowRequests/delete-by-resource/${itemToDelete._id}`;
                console.log('Deleting borrow request with URL:', `delete-by-resource/${itemToDelete._id}`);

                this.apiService.Delete(query, {}).subscribe({
                    next: (response) => {
                        // פעולה במידה והמחיקה הצליחה                        console.log('Borrow request deleted successfully:', response);
                    },
                    error: (err) => {
                        // טיפול במקרה של שגיאה
                        console.error('Error deleting borrow request:', err);
                    },
                });
            },
          });
      }
    });
  }

  downloadResource(item: Item): void {
    if (!item._id) {
      console.error('Item ID is missing.');
      this._snackBar.open('לא ניתן להוריד את הקובץ. חסר ID', 'סגור', {
        duration: 3000,
        panelClass: ['error-snackbar'],
        direction: 'rtl',
      });
      return;
    }
    if (!item.filePath) {
      console.error('File path is missing.');
      this._snackBar.open('לא ניתן להוריד את הקובץ. חסר ניתוב', 'סגור', {
        duration: 3000,
        panelClass: ['error-snackbar'],
        direction: 'rtl',
      });
      return;
    }
    this.apiService
      .Read(
        `/EducationalResource/presigned-url?filePath=${encodeURIComponent(
          item.filePath
        )}`
      )
      .subscribe({
        next: (response) => {
          const presignedUrl = response.url;
          if (response && response.url) {
            const downloadLink = document.createElement('a');
            downloadLink.href = response.url;
            downloadLink.download = item.title; // אפשר להוסיף כאן סיומת אם יש צורך
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
          } else {
            console.error('Invalid response for download URL.');
            this._snackBar.open(
              'לא ניתן להוריד את הקובץ. אנא נסה שוב.',
              'סגור',
              {
                duration: 3000,
                panelClass: ['error-snackbar'],
                direction: 'rtl',
              }
            );
          }
        },
        error: (err) => {
          console.error('Error fetching presigned URL:', err);
          this._snackBar.open('שגיאה בהורדת הקובץ. אנא נסה שוב.', 'סגור', {
            duration: 3000,
            panelClass: ['error-snackbar'],
            direction: 'rtl',
          });
        },
      });
  }
  updateItems(items: Item[]): void {
    this.items = items;
  }
  getFileNameFromPath(filePath: string): string {
    return filePath.split('/').pop() || 'downloaded-file';
  }
  addToFavorites(item: Item): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('User is not logged in.');
        this._snackBar.open('עליך להתחבר כדי להוסיף למועדפים.', 'סגור', {
          duration: 2000,
          panelClass: ['my-custom-snackbar'],
          direction: 'rtl',
        });
        return;
      }
      try {
        const decodedToken: any = jwtDecode(token);
        const userId = decodedToken.idNumber;
        const isAlreadyFavorite = this.favorites.some(
          (fav) => fav.itemId === item._id
        );

        if (isAlreadyFavorite) {
          console.log('Item is already in favorites');
          this._snackBar.open('הפריט כבר נמצא במועדפים.', 'סגור', {
            duration: 2000,
            panelClass: ['my-custom-snackbar'],
            direction: 'rtl',
          });
          item.isFavorite = true;
          return;
        }
        const requestData = {
          userId: userId,
          itemId: item._id,
        };
        this.apiService.Post('/favorites/add', requestData).subscribe({
          next: (response) => {
            console.log('Item added to favorites:', response);
            this.favorites.push({ itemId: item._id });
            console.log('this.favorites', this.favorites);

            item.isFavorite = true;
            this._snackBar.open('הפריט נוסף למועדפים ', 'סגור', {
              duration: 2000,
              panelClass: ['my-custom-snackbar'],
              direction: 'rtl',
            });
          },
          error: (err) => {
            console.error('Error adding item to favorites:', err);
            this._snackBar.open(
              'שגיאה בהוספת הפריט למועדפים. אנא נסה שוב.',
              'סגור',
              {
                duration: 3000,
                panelClass: ['error-snackbar'],
                direction: 'rtl',
              }
            );
          },
        });
      } catch (error) {
        this._snackBar.open(
          'שגיאה בהוספת הפריט למועדפים. אנא נסה שוב.',
          'סגור',
          {
            duration: 3000,
            panelClass: ['error-snackbar'],
            direction: 'rtl',
          }
        );
        console.error('Error decoding token:', error);
        this._snackBar.open('שגיאה באימות המשתמש. נסה להתחבר שנית.', 'סגור', {
          duration: 3000,
          panelClass: ['error-snackbar'],
          direction: 'rtl',
        });
      }
    }
  }
  getFileExtension(filePath: string): string | null {
    const match = filePath.match(/\.[0-9a-z]+$/i);
    return match ? match[0] : null;
  }
  //הוספת לוגיקת דפדוף
  currentPage: number = 0;
  nextPage() {
    this.currentPage++;
    // this.getItems(this.currentPage);
    // this.updateFavoriteStatus();
    this.getItems(this.currentPage).then(() => this.updateFavoriteStatus());
  }
  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.getItems(this.currentPage).then(() => this.updateFavoriteStatus());
      // this.updateFavoriteStatus();
    }
  }
  navigateToItemPage(item: Item): void {
    if (item && item._id) {
      this.router.navigate(['/item-page', item._id]); // וודא שהשימוש הוא ב _id
    } else {
      console.error('Item ID is undefined or invalid');
    }
  }
  async loadFavorites(): Promise<void> {
    console.log('fffffffffffffffffffffffffffffff');

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
        const decodedToken: any = jwtDecode(token);
        const userId = decodedToken.idNumber;
        return new Promise((resolve, reject) => {
          this.apiService.Read(`/favorites/user/${userId}`).subscribe({
            next: (response) => {
              this.favorites = response.favorites || [];
              resolve();
              console.log('this.favorites', this.favorites);
            },
            error: (err) => {
              console.error('Error fetching favorites:', err);
              reject(err);
            },
          });
        });
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    }
  }
  updateFavoriteStatus(): void {
    this.items.forEach((item) => {
      const isFavorite = this.favorites.some((fav) => fav.itemId === item._id);
      item.isFavorite = isFavorite;
    });
    console.log('this.items', this.items);
  }
  toggleFavorite(item: Item): void {
    if (!item.isFavorite) {
      this.addToFavorites(item);
    } else {
      this.removeFromFavorites(item);
    }
  }
  removeFromFavorites(item: Item): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
        const decodedToken: any = jwtDecode(token);
        const userId = decodedToken.idNumber;
        // פתיחת דיאלוג אישור
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          width: '350px',
        });
        // המתנה לתשובת המשתמש
        dialogRef.afterClosed().subscribe((result) => {
          console.log('User decision:', result); // לוג לבדיקת ערך result

          if (result) {
            // אם המשתמש אישר, המשך להסרה
            this.apiService
              .Delete('/favorites/remove', { userId: userId, itemId: item._id })
              .subscribe({
                next: (response) => {
                  console.log('Item removed from favorites:', response);
                  // הסרת הפריט ממערך המועדפים המקומי לאחר הצלחה
                  this.favorites = this.favorites.filter(
                    (fav) => fav.itemId !== item._id
                  );
                  item.isFavorite = false;
                  this._snackBar.open('הפריט הוסר מהמועדפים !', 'סגור', {
                    duration: 2000,
                    panelClass: ['my-custom-snackbar'],
                    direction: 'rtl',
                  });
                },
                error: (err) => {
                  console.error('Error removing item from favorites:', err);
                },
              });
          } else {
            console.log('המשתמש ביטל את הפעולה');
          }
        });
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }
  
  getPageSizeOptions(): number[] {
    this.resetPaginator()

    const options = [5, 10, 15, 20];
    return options.filter(option => option <= this.totalItems);
    
  }

  isNewItem(item: Item): boolean {
    const currentDate = new Date();
    const publicationDate = new Date(item.publicationDate);
    const differenceInTime = currentDate.getTime() - publicationDate.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24); // המרה לימים

    return differenceInDays < 30; // אם ההפרש פחות מ-30 ימים, אז זה נחשב ל"חדש"
  }
}
