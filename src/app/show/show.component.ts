

    
    
import { Component, Injectable, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
// import { log } from 'console';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar'; // ייבוא MatSnackBar
import { MatPaginatorModule } from '@angular/material/paginator';
import { PageEvent } from '@angular/material/paginator';
import { jwtDecode } from 'jwt-decode';
import { ActivatedRoute } from '@angular/router';
// import { log } from 'console';

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
  standalone: true, // זה הופך את הרכיב לעצמאי
  imports: [CommonModule, MatTableModule, RouterOutlet, MatPaginatorModule] // ייבוא ישיר של מודולים
})

export class ItemsListComponent implements OnInit {

    searchTerm: string = ''
    typeFilter: string = ''
  public items: Item[] = []; //מערך המוצרים של הספריה 
  public totalItems: number = 0; // תכונה חדשה למעקב אחרי מספר הנתונים
  public userType: string = ''; // משתנה לשמירת סוג המשתמש
  
   public favorites: { itemId: string }[] = [];

  constructor( private route: ActivatedRoute,public dialog: MatDialog, private ro: Router, private http: HttpClient, private apiService: ApiService, private router: Router, private snackBar: MatSnackBar // הוספת MatSnackBar לקונסטרוקטור
  ) { }

  async ngOnInit(): Promise<void> {
    this.getUserTypeFromToken();
    try {
      await this.initializeData();
    } catch (error) {
      console.error('Error initializing component:', error);
    }
  }
  async initializeData() {
    try {
      await this.getItems();
      await this.loadFavorites();
      this.updateFavoriteStatus();
    } catch (error) {
      console.error('Error initializing data:', error);
    }

    console.log('items after favorites:', this.items);
    this.route.queryParams.subscribe((params) => {
      const type = params['type'];
      this.getItems(0, 20, '', type); // קריאה לפונקציה getItems עם סוג הפריט המתאים
    });
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

onPageChange(event: PageEvent) {
    this.getItems(event.pageIndex, event.pageSize,this.searchTerm,this.typeFilter);
  }
  // async getItems(page: number = 0, limit: number = 1000, searchTerm:string = '', typeFilter: string = '') {
  //   if(searchTerm!==''&&typeFilter===''){
  //     this.apiService.Read(`/EducationalResource/getAll?page=${page}&limit=${limit}&searchTerm=${searchTerm}`).subscribe({
  //       next: (response) => {
  //         console.log('All items response: ', response);

  //         if (Array.isArray(response)) {
  //           this.items = response;
  //         } else {
  //           this.items = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
  //         }
  //         // אם יש סוג בפרמטרים של ה-URL, נסנן מיד
  //         const type = this.route.snapshot.queryParamMap.get('type');
  //         if (type) {
  //           this.filterItemsByType(type);
  //         } else {
  //           this.items = this.items; // הצגת כל הפריטים בהתחלה
  //         }
  //       },
  //       error: (err) => {
  //         console.error('Error fetching all items', err);
  //       },
  //     });
  //   }
  //   if(searchTerm===''&&typeFilter!=='')
  //     {this.apiService.Read(`/EducationalResource/getAll?page=${page}&limit=${limit}&typeFilter=${typeFilter}`).subscribe({
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
  //     });}
  //     if(searchTerm!==''&&typeFilter!=='')
  //       {this.apiService.Read(`/EducationalResource/getAll?page=${page}&limit=${limit}&searchTerm=${searchTerm}&typeFilter=${typeFilter}`).subscribe({
  //         next: (response) => {
  //           console.log('i this is the response: ', response);

  //           if (Array.isArray(response)) {
  //             this.items = response;
  //           } else {
  //             this.items = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
  //           }
  //         },
  //         error: (err) => {
  //           console.error('Error fetching items', err);
  //         },
  //       });}
  //       else
  //       { this.apiService.Read(`/EducationalResource/getAll?page=${page}&limit=${limit}`).subscribe({
  //         next: (response) => {
  //           console.log('i this is the response: ', response);

  //           if (Array.isArray(response)) {
  //             this.items = response
  //           } else {
  //             this.items = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
  //           }
  //         },
  //         error: (err) => {
  //           console.error('Error fetching items', err);
  //         },
  //   });}

  // }

  async getItems(
    page: number = 0,
    limit: number = 20,
    searchTerm: string='' ,
    typeFilter: string =''
  ): Promise<void> {
    this.searchTerm=searchTerm
    this.typeFilter=typeFilter
    if (searchTerm !== '' && typeFilter === '') {
      return new Promise((resolve, reject) => {
        this.apiService
          .Read(
            `/EducationalResource/getAll?page=${page}&limit=${limit}&searchTerm=${searchTerm}`
          )
          .subscribe({
            next: (response: { data: any[], totalCount: number }) => {
              console.log('All items response: ', response);

              if (Array.isArray(response.data)) {
                this.items = response.data;
                this.totalItems = response.totalCount; // משתמשים ב-totalCount מהשרת

              } else {
                this.items = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
		            this.totalItems = response.totalCount; // משתמשים ב-totalCount מהשרת
              }
              // אם יש סוג בפרמטרים של ה-URL, נסנן מיד
              const type = this.route.snapshot.queryParamMap.get('type');
              if (type) {
                this.filterItemsByType(type);
              } else {
                this.items = this.items; // הצגת כל הפריטים בהתחלה
              }
              resolve();
            },
            error: (err) => {
              console.error('Error fetching all items', err);
              reject(err);
            },
          });
      });
    }
    if (searchTerm === '' && typeFilter !== '') {
      return new Promise((resolve, reject) => {
        this.apiService
          .Read(
            `/EducationalResource/getAll?page=${page}&limit=${limit}&typeFilter=${typeFilter}`
          )
          .subscribe({
            next: (response: { data: any[], totalCount: number }) => {
              console.log('i this is the response: ', response);

              if (Array.isArray(response.data)) {
                this.items = response.data;
                console.log('this.items***************', this.items);
                this.totalItems = response.totalCount; // משתמשים ב-totalCount מהשרת
                console.log('this.totalItems***************', this.totalItems);

              } else {
                this.items = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
                console.log('this.items***************', this.items);
		 this.totalItems = response.totalCount; // משתמשים ב-totalCount מהשרת
              }
              resolve();
            },
            error: (err) => {
              console.error('Error fetching items', err);
              reject(err);
            },
          });
      });
    }
    if (searchTerm !== '' && typeFilter !== '') {
      return new Promise((resolve, reject) => {
        this.apiService
          .Read(
            `/EducationalResource/getAll?page=${page}&limit=${limit}&searchTerm=${searchTerm}&typeFilter=${typeFilter}`
          )
          .subscribe({
            next: (response: { data: any[], totalCount: number }) => {
              console.log('i this is the response: ', response);

              if (Array.isArray(response.data)) {
                this.items = response.data;
                this.totalItems = response.totalCount; // משתמשים ב-totalCount מהשרת

              } else {
                this.items = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
		 this.totalItems = response.totalCount; // משתמשים ב-totalCount מהשרת
              }
              resolve();
            },
            error: (err) => {
              console.error('Error fetching items', err);
              reject(err);
            },
          });
      });
    } else {
      return new Promise((resolve, reject) => {
        this.apiService
          .Read(`/EducationalResource/getAll?page=${page}&limit=${limit}`)
          .subscribe({
            next: (response: { data: any[], totalCount: number }) => {
              console.log('i this is the response: ', response);

              if (Array.isArray(response.data)) {
                this.items = response.data;
                this.totalItems = response.totalCount; // משתמשים ב-totalCount מהשרת

              } else {
                this.items = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
		 this.totalItems = response.totalCount; // משתמשים ב-totalCount מהשרת
              }
              resolve();
            },
            error: (err) => {
              console.error('Error fetching items', err);
              reject(err);
            },
          });
      });
    }
    var apiUrl = `/EducationalResource/getAll?page=${page}&limit=${limit}`;
    if (searchTerm) {
      apiUrl += `&searchTerm=${searchTerm}`;
    }
    if (typeFilter) {
      apiUrl += `&typeFilter=${typeFilter}`;
    }
    this.apiService.Read(apiUrl).subscribe({
      next: (response: { data: any[], totalCount: number }) => {
        console.log('All items response: ', response);
        if (Array.isArray(response.data)) {
          this.items = response.data;
          this.totalItems = response.totalCount; // משתמשים ב-totalCount מהשרת

        } else {
          this.items = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
	   this.totalItems = response.totalCount; // משתמשים ב-totalCount מהשרת
        }
      },
      error: (err) => {
        console.error('Error fetching items', err);
      },
    });
  }
  //מה ש GPT נתן לי
  // async getItems(
  //   page: number = 0,
  //   limit: number = 20,
  //   searchTerm: string = '',
  //   typeFilter: string = ''
  // ): Promise<void> {
  //   this.searchTerm = searchTerm;
  //   this.typeFilter = typeFilter;
  
  //   let apiUrl = `/EducationalResource/getAll?page=${page}&limit=${limit}`;
  //   if (searchTerm) {
  //     apiUrl += `&searchTerm=${searchTerm}`;
  //   }
  //   if (typeFilter) {
  //     apiUrl += `&typeFilter=${typeFilter}`;
  //   }
  
  //   return new Promise((resolve, reject) => {
  //     this.apiService.Read(apiUrl).subscribe({
  //       next: (response: { data: any[], totalCount: number }) => {
  //         console.log('All items response: ', response);
  
  //         if (Array.isArray(response.data)) {
  //           this.items = response.data;
  //         } else {
  //           this.items = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
  //         }
  
  //         this.totalItems = response.data.length; // משתמשים ב-totalCount מהשרת
  //         console.log('Total items: ', this.totalItems); // לוג של totalItems
  
  //         // אם יש סוג בפרמטרים של ה-URL, נסנן מיד
  //         const type = this.route.snapshot.queryParamMap.get('type');
  //         if (type) {
  //           this.filterItemsByType(type);
  //         }
  
  //         resolve();
  //       },
  //       error: (err) => {
  //         console.error('Error fetching items', err);
  //         reject(err);
  //       },
  //     });
  //   });
  // }
  


  async editItem(item1: Item) {
    
    this.router.navigate(['/upload-resource', item1._id], { queryParams: { additionalParam: 'edit' } });

  }



  deleteResource(itemToDelete: Item) {
    console.log('Delete item: ', itemToDelete);
    // הוסף כאן את הלוגיקה למחיקת משתמש

    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().subscribe(result => {

      if (result) {
        // כאן תוכל לקרוא לפונקציה שמוחקת את הפריט מהשרת
        //הפונקציה מקבלת את הנתיב שאיתו היא תתחבר לפונ המחיקה בשרת 
        //וכן את האובייקט למחיקה
        this.apiService.Delete(`/EducationalResource/${itemToDelete._id}`, {}).subscribe(
          {
            next: (response) => {
              // פעולה במידה והמחיקה הצליחה
              console.log('Item deleted successfully:', response);
              // הצגת הודעת הצלחה למשתמש
              this.snackBar.open('הפריט נמחק בהצלחה', 'סגור', {
                duration: 3000,
                panelClass: ['custom-snack-bar'], // הוספת הכיתה המותאמת אישית
              });
              // ניתן לעדכן את ה-UI או להוריד את הפריט מהרשימה המקומית
              this.items = this.items.filter(item => item._id !== itemToDelete._id);
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
            },
          });

      }
    })
  }

      downloadResource(item: Item): void {
        if(!item._id) {
      console.error('Item ID is missing.');
      alert('לא ניתן להוריד את הקובץ. חסר ID');
      return;
    }

    if (!item.filePath) {
      console.error('File path is missing.');
      alert('לא ניתן להוריד את הקובץ. חסר ניתוב');
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
            alert('לא ניתן להוריד את הקובץ. אנא נסה שוב.');
          }
        },
        error: (err) => {
          console.error('Error fetching presigned URL:', err);
          alert('שגיאה בהורדת הקובץ. אנא נסה שוב.');
        },
      });

  }

  // filterItemsByType(type: string): void {
  //   console.log('Filtering items by type:', type);
  //   this.items = this.items.filter((item: Item) => item.type === type);
  //   console.log('Filtered items:', this.items);
  // }

  filterItemsByType(type: string): void {
    console.log('Filtering items by type:', type);
    this.apiService.Read(`/EducationalResource/getAll?type=${type}`).subscribe({
      next: (response: { data: any[], totalCount: number }) => {
        if (Array.isArray(response.data)) {
          this.items = response.data;
          this.totalItems = response.totalCount; // משתמשים ב-totalCount מהשרת

        } else {
          this.items = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
	   this.totalItems = response.totalCount; // משתמשים ב-totalCount מהשרת
        }
        console.log('Filtered items:', this.items);
        console.log('Filtered total count:', this.totalItems);

      },
      error: (err) => {
        console.error('Error filtering items by type', err);
      },
    });
  }

  getFileNameFromPath(filePath: string): string {
    return filePath.split('/').pop() || 'downloaded-file';
  }

  addToFavorites(item: Item): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('User is not logged in.');
        alert('עליך להתחבר כדי להוסיף למועדפים.');
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
          alert('הפריט כבר נמצא במועדפים.');
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
            alert('הפריט נוסף למועדפים ');
          },
          error: (err) => {
            console.error('Error adding item to favorites:', err);
            alert('שגיאה בהוספת המוצר למועדפים. אנא נסה שוב.');
          },
        });
      } catch (error) {
        console.error('Error decoding token:', error);
        alert('שגיאה באימות המשתמש.');
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
    this.getItems(this.currentPage);
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
        // const response = await
        return new Promise((resolve, reject) => {
          this.apiService
            .Read(`/favorites/user/${userId}`)
            // .toPromise();
            .subscribe({
              // if (response?.favorites?.length) {
              //   this.favorites = response.favorites;
              //   console.log(' this.favorites', this.favorites);
              //   console.log('this.items=============+++++++==', this.items);

              //   this.items.forEach((item) => {
              //     item.isFavorite = this.favorites.some(
              //       (fav) => fav.itemId === item.id
              //     );
              //   });
              // } else {
              //   this.favorites = [];

              //   this.items.forEach((item) => (item.isFavorite = false));
              next: (response) => {
                this.favorites = response.favorites || [];
                resolve();
      this.getItems(this.currentPage);
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

  // updateFavoriteStatus(): void {
  //   if (!this.favorites || this.favorites.length === 0) {
  //     this.items.forEach((item) => (item.isFavorite = false));

  //     return;
  //   }
  //   const favoriteItemIds = this.favorites.map((fav) => fav.itemId);
  //   this.items.forEach((item) => {
  //     item.isFavorite = favoriteItemIds.includes(item.id);
  //   });
  // }

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

  // toggleFavorite(item: Item): void {
  //   const isFavorite = this.favorites.some(fav => fav.itemId === item.id);

  //   if (isFavorite) {
  //     // הסרת מהמועדפים
  //     this.apiService.Delete(`/favorites/remove/${item.id}`, {}).subscribe({
  //       next: () => {
  //         this.favorites = this.favorites.filter(fav => fav.itemId !== item.id);
  //         this.updateFavoriteStatus(); // עדכון סטטוס
  //         alert('הפריט הוסר מהמועדפים.');
  //       },
  //       error: (err) => {
  //         console.error('Error removing item from favorites:', err);
  //         alert('שגיאה בהסרת המוצר מהמועדפים. אנא נסה שוב.');
  //       },
  //     });
  //   } else {
  //     // הוספה למועדפים
  //     this.addToFavorites(item);
  //   }
  // }

  removeFromFavorites(item: Item): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const decodedToken: any = jwtDecode(token);
        const userId = decodedToken.idNumber;

        this.apiService
          .Post('/favorites/remove', { userId, itemId: item._id })
          .subscribe({
            next: (response) => {
              console.log('Item removed from favorites:', response);
              alert('המוצר הוסר מהמועדפים בהצלחה!');
            },
            error: (err) => {
              console.error('Error removing item from favorites:', err);
            },
          });
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }

  getPageSizeOptions(): number[] {
    if (this.totalItems <= 5) {
      return [];
    } else if (this.totalItems >= 11) {
      return [5, 10];
    } else {
      return [5, 10, 15, 20];
    }
  }
  
}
