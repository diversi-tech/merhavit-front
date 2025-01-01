// import { Component, Injectable, OnInit } from '@angular/core';

// import { CommonModule } from '@angular/common';

// import { MatTableModule } from '@angular/material/table';

// import { HttpClient } from '@angular/common/http';

// // import { Observable } from 'rxjs';

// import { ApiService } from '../api.service';

// // import { log } from 'console';

// import { jwtDecode } from 'jwt-decode';

// import { log } from 'console';

// import { RouterModule, Router, ActivatedRoute } from '@angular/router';

// interface Item {

//   id: string;

//   description: string;

//   title: string;

//   type: string;

//   Author: string;

//   publicationDate: Date;

//   Tags: Array<string>;

//   createdBy: string;

//   ApprovedBy: string;

//   coverImage: string;

//   filePath: string;

// }

// @Component({

//   selector: 'app-items-list',

//   templateUrl: './show.component.html',

//   styleUrls: ['./show.component.css'],

//   standalone: true,

//   imports: [CommonModule, MatTableModule],

// })

// //@Injectable({ providedIn: 'root' })

// export class ItemsListComponent implements OnInit {

//   public items: Item[] = []; //מערך המוצרים של הספריה

//   public userType: string = ''; // משתנה לשמירת סוג המשתמש

//   constructor(

//     private http: HttpClient,

//     private apiService: ApiService,

//     private router: Router,

//     private route: ActivatedRoute

//   ) {}

//   async ngOnInit(): Promise<void> {

//     this.getUserTypeFromToken();

//     this.route.queryParams.subscribe(params => {

//       const type = params['type']; // שימו לב לשם הפרמטר שנשלח ב-URL

//       if (type) {

//         this.filterItems(type);  // נקרא לפונקציה של סינון

//       } else {

//        this.getItems();  // אם לא נבחר סוג, נשלוף את כל הפריטים

//       }

//     });

//   }

//   getUserTypeFromToken(): void {

//     if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {

//       const token = localStorage.getItem('access_token');

//       if (token) {

//         try {

//           const decodedToken: any = jwtDecode(token);

//           this.userType = decodedToken.userType || '';

//           console.log(this.userType);

//         } catch (error) {

//           console.error('Error decoding token:', error);

//         }

//       }

//     } else {

//       console.warn('Code is running on the server. Skipping token check.');

//     }

//   }

//   async getItems(page: number = 0, limit: number = 100) {

//     console.log('hi');

//     this.apiService.Read(`/EducationalResource/getAll?page=${page}&limit=${limit}`).subscribe({

//       next: (response) => {

//         console.log('i this is the response: ', response);

//         if (Array.isArray(response)) {

//           this.items = response;

//         } else {

//           this.items = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים

//         }

//       },

//       error: (err) => {

//         console.error('Error fetching items', err);

//       },

//     });

//   }

//   editItem(item: Item) {

//     // ניווט לדף edit-media

//     this.router.navigate(['/edit-media'], {

//       state: { id: item.id }

//     })

//   }

//   deleteResource(itemToDelete: Item) {

//     console.log('Delete item: ', itemToDelete);

//     // הוסף כאן את הלוגיקה למחיקת משתמש

//     //הפונקציה מקבלת את הנתיב שאיתו היא תתחבר לפונ המחיקה בשרת

//     //וכן את האובייקט למחיקה

//     this.apiService

//       .Delete(`/EducationalResource/${itemToDelete.id}`, {})

//       .subscribe({

//         next: (response) => {

//           // פעולה במידה והמחיקה הצליחה

//           console.log('Item deleted successfully:', response);

//           alert(response.message); // הצגת הודעת הצלחה למשתמש

//           // ניתן לעדכן את ה-UI או להוריד את הפריט מהרשימה המקומית

//           this.items = this.items.filter((item) => item.id !== itemToDelete.id);

//         },

//         error: (err) => {

//           // טיפול במקרה של שגיאה

//           console.error('Error deleting item:', err);

//           alert(err.error.message || 'Failed to delete item. Please try again.');

//         },

//         complete: () => {

//           // פעולה כאשר הקריאה הסתיימה (אופציונלי)

//           console.log('Delete request completed.');

//         },

//       });

//   }

//   downloadResource(item: Item): void {

//     if (!item.id) {

//       console.error('Item ID is missing.');

//       alert('לא ניתן להוריד את הקובץ. חסר ID');

//       return;

//     }

//     if (!item.filePath) {

//       console.error('File path is missing.');

//       alert('לא ניתן להוריד את הקובץ. חסר ניתוב');

//       return;

//     }

//     console.log('item.filePath', item.filePath);

//     this.apiService

//       .Read(

//         `/EducationalResource/presigned-url?filePath=${encodeURIComponent(

//           item.filePath

//         )}`

//         // `/EducationalResource/presigned-url?filePath=${encodeURIComponent(

//         //   item.filePath

//         // )}&download=true`

//       )

//       // .Read(`/EducationalResource/presigned-url?filePath=${item.filePath}`)

//       .subscribe({

//         next: (response) => {

//           const presignedUrl = response.url;

//           if (response && response.url) {

//             const downloadLink = document.createElement('a');

//             downloadLink.href = response.url;

//             downloadLink.download = item.title; // אפשר להוסיף כאן סיומת אם יש צורך

//             document.body.appendChild(downloadLink);

//             downloadLink.click();

//             document.body.removeChild(downloadLink);

//           } else {

//             console.error('Invalid response for download URL.');

//             alert('לא ניתן להוריד את הקובץ. אנא נסה שוב.');

//           }

//         },

//         //   if (presignedUrl) {

//         //     const downloadLink = document.createElement('a');

//         //     downloadLink.href = presignedUrl;

//         //     downloadLink.download = this.getFileNameFromPath(item.filePath); // קביעת שם הקובץ להורדה

//         //     downloadLink.style.display = 'none';

//         //     document.body.appendChild(downloadLink);

//         //     downloadLink.click();

//         //     document.body.removeChild(downloadLink);

//         //   } else {

//         //     alert('שגיאה בקבלת הקישור להורדה.');

//         //   }

//         // },

//         error: (err) => {

//           console.error('Error fetching presigned URL:', err);

//           alert('שגיאה בהורדת הקובץ. אנא נסה שוב.');

//         },

//       });

//   }

//   filterItems(type: string): void {

//     this.apiService.Read(`/EducationalResource/getAll?type=${type}`).subscribe({

//       next: (response) => {

//         if (Array.isArray(response)) {

//           this.items = response;

//         } else {

//           this.items = response.data || [];

//         }

//       },

//       error: (err) => {

//         console.error('Error fetching filtered items', err);

//       }

//     });

//   }

//   getFileNameFromPath(filePath: string): string {

//     return filePath.split('/').pop() || 'downloaded-file';

//   }

//   addToFavorites(item: Item): void {

//     const token = localStorage.getItem('access_token');

//     if (!token) {

//       console.error('User is not logged in.');

//       alert('עליך להתחבר כדי להוסיף למועדפים.');

//       return;

//     }

//     try {

//       const decodedToken: any = jwtDecode(token);

//       const userId = decodedToken.idNumber; // נניח שה-`id` של המשתמש נמצא בטוקן

//       const requestData = {

//         userId: userId,

//         itemId: item.id,

//       };

//       console.log('Request Data:', requestData);

//     this.apiService.Post('/favorites/add', requestData).subscribe({

//       next: (response) => {

//         console.log('Item added to favorites:', response);

//         alert('המוצר נוסף למועדפים בהצלחה!');

//       },

//       error: (err) => {

//         console.error('Error adding item to favorites:', err);

//         alert('שגיאה בהוספת המוצר למועדפים. אנא נסה שוב.');

//       },

//     });

//   } catch(error) {

//     console.error('Error decoding token:', error);

//     alert('שגיאה באימות המשתמש.');

//   }

// }

// getFileExtension(filePath: string): string | null {

//   const match = filePath.match(/\.[0-9a-z]+$/i);

//   return match ? match[0] : null;

// }

// //הוספת לוגיקת דפדוף

// currentPage: number = 0;

// nextPage() {

//   this.currentPage++;

//   this.getItems(this.currentPage);

// }

// previousPage() {

//   if (this.currentPage > 0) {

//     this.currentPage--;

//     this.getItems(this.currentPage);

//   }

// }

//  navigateToItemPage(itemId: string): void {

//     this.router.navigate([`/item-page/${itemId}`]);

//   }

// }

import { Component, Injectable, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../api.service';
import { jwtDecode } from 'jwt-decode';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { log } from 'console';
import { ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface Item {
  _id: string;
  description: string;
  title: string;
  type: string;
  author: string;
  publicationDate: Date;
  Tags: Array<string>;
  createdBy: string;
  ApprovedBy: string;
  coverImage: string;
  filePath: string;
  isFavorite?: boolean;
}

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
  ],
})
export class ItemsListComponent implements OnInit {
  public userType: string = ''; // משתנה לשמירת סוג המשתמש
  public showNoDataMessage: boolean = false; // משתנה לשליטה בהצגת ההודעה
  public favorites: { itemId: string }[] = [];
  itemsFromServer: any[] = [];// משתנה לשמירת כל הפריטים שהתקבלו מהשרת
  public items: Item[] = []; // רשימת הפריטים שמוצגים בסופו של דבר

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    this.getUserTypeFromToken();
    this.route.queryParams.subscribe(params => {
      const type = params['type'];
      if (type) {
        this.getItems(0, 1000, '', type); // שליפת נתונים עם סוג מסנן
      } else {
        this.getItems(0, 1000, ''); // שליפת כל הנתונים אם אין סוג
      }
    });
  }

  async initializeData() {
    try {
      await this.route.queryParams.subscribe((params) => {
        const type = params['type'];
        this.getItems(0, 1000, '', type);
      });
      await this.loadFavorites();
      this.updateFavoriteStatus();
    } catch (error) {
      console.error('Error initializing data:', error);
    }
    console.log('items after favorites:', this.items);
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





  
  async getItems(
    page: number = 0,
    limit: number = 1000,
    searchTerm: string = '',
    typeFilter: string = ''
  ): Promise<void> {
    this.showNoDataMessage = false;
  
    const url = `/EducationalResource/getAll?page=${page}&limit=${limit}`;
    console.log(`Requesting URL: ${url}`);
  
    return new Promise((resolve, reject) => {
      this.apiService.Read(url).subscribe({
        next: (response) => {
          console.log('API Response: ', response);
  
          if (response.success && Array.isArray(response.data)) {
            this.itemsFromServer = response.data;
            console.log('Items received from server:', this.itemsFromServer);
            // מבצע סינון לפי סוג
            this.filterItemsByType(searchTerm, typeFilter);
          } else {
            this.items = [];
            this.showNoDataMessage = true;
          }
          resolve();
        },
        error: (err) => {
          console.error('Error fetching items', err);
          this.items = [];
          this.showNoDataMessage = true;
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
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('After search term filtering:', filteredItems);
    }
  
    // סינון לפי סוג (typeFilter)
    if (typeFilter) {
      filteredItems = filteredItems.filter(item => item.type === typeFilter);
      console.log('After type filter:', filteredItems);
    }
  
    this.items = filteredItems;
    console.log('Final filtered items:', this.items);
  
    if (this.items.length === 0) {
      setTimeout(() => {
        this.showNoDataMessage = true;
      }, 2000);
    }
  }
  
  
  editItem(item: Item) {
    this.router.navigate(['/edit-media'], {
      state: { id: item._id },
    });
  }

  deleteResource(itemToDelete: Item) {
    this.apiService
      .Delete(`/EducationalResource/${itemToDelete._id}`, {})
      .subscribe({
        next: (response) => {
          console.log('Item deleted successfully:', response);
          alert(response.message);
          this.items = this.items.filter(
            (item) => item._id !== itemToDelete._id
          );
          this.items = this.items; // עדכון הפריטים המוצגים
        },
        error: (err) => {
          console.error('Error deleting item:', err);
          alert(
            err.error.message || 'Failed to delete item. Please try again.'
          );
        },
        complete: () => {
          // פעולה כאשר הקריאה הסתיימה (אופציונלי)
          console.log('Delete request completed.');
        },
      });
  }

  downloadResource(item: Item): void {
    if (!item._id) {
      console.error('Item ID is missing.');
      // alert('לא ניתן להוריד את הקובץ. חסר ID');
      this._snackBar.open('לא ניתן להוריד את הקובץ. חסר ID', 'סגור', {
        duration: 3000,
        panelClass: ['error-snackbar'],
        direction: 'rtl',
      });
      return;
    }

    if (!item.filePath) {
      console.error('File path is missing.');
      // alert('לא ניתן להוריד את הקובץ. חסר ניתוב');
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
            // alert('לא ניתן להוריד את הקובץ. אנא נסה שוב.');
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
          // alert('שגיאה בהורדת הקובץ. אנא נסה שוב.');
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
        // alert('עליך להתחבר כדי להוסיף למועדפים.');
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
          // alert('הפריט כבר נמצא במועדפים.');
          this._snackBar.open('הפריט כבר נמצא במועדפים.', 'סגור', {
            duration: 2000,
            panelClass: ['my-custom-snackbar'],
            direction: 'rtl',
          });
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
            // alert('הפריט נוסף למועדפים ');
            this._snackBar.open('הפריט נוסף למועדפים ', 'סגור', {
              duration: 2000,
              panelClass: ['my-custom-snackbar'],
              direction: 'rtl',
            });
          },
          error: (err) => {
            console.error('Error adding item to favorites:', err);
            // alert('שגיאה בהוספת המוצר למועדפים. אנא נסה שוב.');
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
        // alert('שגיאה באימות המשתמש.');
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

      item.isFavorite = true;
    } else {
      this.removeFromFavorites(item);

      item.isFavorite = false;
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
          if (result) {
            // אם המשתמש אישר, המשך להסרה

            this.apiService

              .Delete('/favorites/remove', { userId: userId, itemId: item._id })

              .subscribe({
                next: (response) => {
                  console.log('Item removed from favorites:', response);

                  // alert('המוצר הוסר מהמועדפים בהצלחה!');
                  this.favorites = this.favorites.filter(
                    (fav) => fav.itemId !== item._id
                  );
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
}
