import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { ApiService } from '../../api.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css'],
  standalone: true,
  imports: [RouterModule, CommonModule, MatSnackBarModule],
})
export class FavoritesComponent implements OnInit {
  favorites: any[] = [];
  userId: string = '';

  constructor(private apiService: ApiService, private router: Router, private _snackBar: MatSnackBar) {}

  async ngOnInit(): Promise<void> {
    this.getUserIdFromToken();
    await this.fetchFavorites();
    console.log('favorites', this.favorites);
  }

  getUserIdFromToken(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const decodedToken: any = jwtDecode(token);
          // this.userType = decodedToken.userType || '';
          this.userId = decodedToken.idNumber || '';
          console.log('userId', this.userId);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    } else {
      console.warn('Code is running on the server. Skipping token check.');
    }
  }

  // שליפת המועדפים מהשרת
  async fetchFavorites(): Promise<void> {
    if (this.userId) {
      return new Promise<void>((resolve, reject) => {
        this.apiService.Read(`/favorites/user/${this.userId}`).subscribe({
          next: (data) => {
            this.favorites = data.favorites;
            console.log('favorites', this.favorites);
            this.fetchFavoriteItemsDetails();
            resolve(); // מסיים את ההמתנה
          },
          error: (error) => {
            console.error('Error fetching favorites:', error);
          },
        });
      });
    }
  }

  fetchFavoriteItemsDetails(): void {
    const itemIds = Array.from(
      new Set(this.favorites.map((favorite) => favorite.itemId))
    );
    console.log('itemIds', itemIds);

    this.apiService
      .ReadWithParams('/favorites/items/details', { itemIds })
      .subscribe({
        next: (itemsDetails) => {
          // שילוב הפרטים עם המועדפים
          console.log('itemsDetails', itemsDetails);

          // יצירת מפה לפרטי הפריטים לפי ה- _id
          const itemsMap = new Map(
            itemsDetails.map((item: any) => [item._id.trim(), item])
          );

          // שילוב המידע של הפריטים עם המועדפים
          this.favorites = this.favorites.map((favorite) => ({
            ...favorite,
            itemDetail: itemsMap.get(favorite.itemId.trim()) || {
              message: 'פריט לא נמצא',
            },
          }));
          console.log('combined favorites', this.favorites);
        },
        error: (error) => {
          console.error('Error fetching item details:', error);
        },
      });
  }

  // פונקציה להסרת פריט מהמועדפים
  removeFavorite(itemId: string): void {
    this.apiService
      .Delete('/favorites/remove', { userId: this.userId, itemId })
      .subscribe({
        next: () => {
          this.favorites = this.favorites.filter((item) => item.itemId !== itemId);
          this._snackBar.open('הפריט הוסר מהמועדפים !', 'סגור', {
            duration: 2000,
            panelClass: ['my-custom-snackbar'],
            direction: 'rtl',
          });
        },
        error: (error) => {
          console.error('Error removing favorite:', error);
          this._snackBar.open(
            'שגיאה במחיקת הפריט מהמועדפים.',
            'סגור',
            {
              duration: 3000,
              panelClass: ['error-snackbar'],
              direction: 'rtl',
            }
          );
        },
      });
  }

  navigateToItemPage(itemId: string): void {
    this.router.navigate([`/item-page/${itemId}`]);
  }
}
