import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css'],
  standalone: true,
  imports: [RouterModule, CommonModule],
})
export class FavoritesComponent implements OnInit {
  favorites: any[] = [];
  userId: string = ''; 

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getUserIdFromToken();
    this.fetchFavorites();
  }

  getUserIdFromToken(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        this.userId = decodedToken.userId || '';
        console.log('userId', this.userId)
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }

  // שליפת המועדפים מהשרת
  fetchFavorites(): void {
    if (this.userId) {
      this.apiService.Read(`/favorites/${this.userId}`).subscribe({
        next: (data) => {
          this.favorites = data;
        },
        error: (error) => {
          console.error('Error fetching favorites:', error);
        },
      });
    }
  }

  // פונקציה להסרת פריט מהמועדפים
  removeFavorite(itemId: string): void {
    this.apiService
      .Delete('/favorites/remove', { userId: this.userId, itemId })
      .subscribe({
        next: () => {
          this.favorites = this.favorites.filter((item) => item.id !== itemId);
        },
        error: (error) => {
          console.error('Error removing favorite:', error);
        },
      });
  }
}
