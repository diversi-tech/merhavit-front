import { Component, Injectable, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
// import { log } from 'console';
import { jwtDecode } from 'jwt-decode';
import { log } from 'console';
import { RouterModule, Router } from '@angular/router';

interface Item {
  id: string;
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
  imports: [CommonModule, MatTableModule],
})
export class ItemsListComponent implements OnInit {
  public items: Item[] = []; //מערך המוצרים של הספריה
  public userType: string = ''; // משתנה לשמירת סוג המשתמש
  public favorites: { itemId: string }[] = [];

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private router: Router
  ) {}

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
      await this.loadFavorites().then(() => this.updateFavoriteStatus());
      // this.updateFavoriteStatus();
    } catch (error) {
      console.error('Error initializing data:', error);
    }

    console.log('items after favorites:', this.items);

    // this.getItems().subscribe(items => {
    //   this.items = items;
    // });
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

  async getItems(page: number = 0, limit: number = 2): Promise<void> {
    console.log('hi');
    return new Promise((resolve, reject) => {
      this.apiService
        .Read(`/EducationalResource/getAll?page=${page}&limit=${limit}`)
        .subscribe({
          next: (response) => {
            console.log('i this is the response: ', response);

            if (Array.isArray(response)) {
              this.items = response;
              console.log('this.items***************', this.items);
            } else {
              this.items = response.data || []; // ברירת מחדל למערך ריק אם אין נתונים
              console.log('this.items***************', this.items);
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

  editItem(item: Item) {
    // ניווט לדף edit-media
    this.router.navigate(['/edit-media'], {
      state: { id: item.id },
    });
  }

  deleteResource(itemToDelete: Item) {
    console.log('Delete item: ', itemToDelete);
    // הוסף כאן את הלוגיקה למחיקת משתמש

    //הפונקציה מקבלת את הנתיב שאיתו היא תתחבר לפונ המחיקה בשרת
    //וכן את האובייקט למחיקה
    this.apiService
      .Delete(`/EducationalResource/${itemToDelete.id}`, {})
      .subscribe({
        next: (response) => {
          // פעולה במידה והמחיקה הצליחה
          console.log('Item deleted successfully:', response);
          alert(response.message); // הצגת הודעת הצלחה למשתמש
          // ניתן לעדכן את ה-UI או להוריד את הפריט מהרשימה המקומית
          this.items = this.items.filter((item) => item.id !== itemToDelete.id);
        },
        error: (err) => {
          // טיפול במקרה של שגיאה
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
    if (!item.id) {
      console.error('Item ID is missing.');
      alert('לא ניתן להוריד את הקובץ. חסר ID');
      return;
    }

    if (!item.filePath) {
      console.error('File path is missing.');
      alert('לא ניתן להוריד את הקובץ. חסר ניתוב');
      return;
    }

    console.log('item.filePath', item.filePath);

    this.apiService
      .Read(
        `/EducationalResource/presigned-url?filePath=${encodeURIComponent(
          item.filePath
        )}`
        // `/EducationalResource/presigned-url?filePath=${encodeURIComponent(
        //   item.filePath
        // )}&download=true`
      )
      // .Read(`/EducationalResource/presigned-url?filePath=${item.filePath}`)

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
        //   if (presignedUrl) {
        //     const downloadLink = document.createElement('a');
        //     downloadLink.href = presignedUrl;
        //     downloadLink.download = this.getFileNameFromPath(item.filePath); // קביעת שם הקובץ להורדה
        //     downloadLink.style.display = 'none';

        //     document.body.appendChild(downloadLink);
        //     downloadLink.click();
        //     document.body.removeChild(downloadLink);
        //   } else {
        //     alert('שגיאה בקבלת הקישור להורדה.');
        //   }
        // },
        error: (err) => {
          console.error('Error fetching presigned URL:', err);
          alert('שגיאה בהורדת הקובץ. אנא נסה שוב.');
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
          (fav) => fav.itemId === item.id
        );
        if (isAlreadyFavorite) {
          console.log('Item is already in favorites');
          alert('הפריט כבר נמצא במועדפים.');
          return;
        }

        const requestData = {
          userId: userId,
          itemId: item.id,
        };

        console.log('Request Data:', requestData);

        this.apiService.Post('/favorites/add', requestData).subscribe({
          next: (response) => {
            console.log('Item added to favorites:', response);
            this.favorites.push({ itemId: item.id });
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

  navigateToItemPage(itemId: string): void {
    this.router.navigate([`/item-page/${itemId}`]);
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
                console.log('this.favorites', this.favorites)
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
      const isFavorite = this.favorites.some((fav) => fav.itemId === item.id);
      item.isFavorite = isFavorite;
    });
    console.log('this.items', this.items)
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
          .Post('/favorites/remove', { userId, itemId: item.id })
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
}
