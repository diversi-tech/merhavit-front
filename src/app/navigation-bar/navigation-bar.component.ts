import { CommonModule } from '@angular/common'; // יש לייבא את המודול הזה
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { ItemsService } from '../items.service';


@Component({
  selector: 'app-navigation-bar',
  standalone: true,
  imports: [CommonModule], // הוסף את CommonModule כאן
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.css'],
})
export class NavigationBarComponent {

  constructor(private router: Router, private _itemsService: ItemsService) {
    this.getUserTypeFromToken();
  }
    // Getter לגישה ל-itemsService בצורה ציבורית
    get itemsService() {
      return this._itemsService;
    }

  activeSubMenu: string | null = null;
  userType: string = '';
  selectedFilter: string = '';
  selectedFileType: string = 'all';
  showFilterOptions: boolean = false;

  // פונקציה לפתיחת/סגירת תתי-תפריטים
  toggleSubMenu(menu: string): void {
    if (this.activeSubMenu === menu) {
      this.activeSubMenu = null; // סגירה אם כבר פתוח
    } else {
      this.activeSubMenu = menu; // פתיחה
    }
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

  onSelectFilter(type: string): void {
    const targetRoute = '/show-details';
    const currentUrl = this.router.url;

    if (currentUrl !== targetRoute) {
      this.router.navigate([targetRoute]).then(() => {
        this.updateFilter(type);
      });
    } else {
      this.updateFilter(type);
    }
  }

  tagManagementButton(type: string): void {
    this.router.navigate(['/management']);
  }

  private updateFilter(type: string): void {
    this.selectedFilter = type;
    this.itemsService.typeFilter = type; // עדכון הסינון ב-service
    this.itemsService.fetchItems(); // שליחת בקשה לשרת עם הסינון החדש
  }
}

