import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { TopIconsComponent } from '../top-icons/top-icons.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, TopIconsComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  showSearchBar: boolean = false; // התחלה ב-false

  constructor(private router: Router) {
    // רשימת דפים שבהם אין צורך להציג את החיפוש
    const hiddenSearchRoutes = [
      '/upload-resource',
      '/personal-details',
      '/orders',
      '/favorites',
      '/login'
    ];

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // אחרי כל ניתוב, בדוק אם הוא בדף שלא צריך להציג בו חיפוש
        setTimeout(() => {
          const currentRoute = this.router.url.split('?')[0]; // הסרת שאילתות
          const isHiddenRoute = hiddenSearchRoutes.includes(currentRoute);
          const isSpecificItemPage = /^\/item-page\/[^/]+$/.test(currentRoute);

          // אם הדף לא נמצא ברשימה, הצג את בר החיפוש
          this.showSearchBar = !isHiddenRoute && !isSpecificItemPage;

          console.log('Current route:', currentRoute);
          console.log('Is hidden route:', isHiddenRoute);
          console.log('Is specific item page:', isSpecificItemPage);
          console.log('Show search bar:', this.showSearchBar);
        });
      }
    });
  }
}
