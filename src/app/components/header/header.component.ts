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
  showSearchBar: boolean = true;
  constructor(private router: Router) {
    // רשימת דפים שבהם אין צורך להציג את החיפוש
    const hiddenSearchRoutes = [
      '/upload-resource',
      '/personal-details',
      '/orders',
      '/favorites',
    ];

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentRoute = this.router.url.split('?')[0]; // הסרת שאילתות

        // בדיקה האם הנתיב הוא בדיוק אחד מהנתיבים החסומים
        const isHiddenRoute = hiddenSearchRoutes.includes(currentRoute);

        // בדיקה האם הנתיב תואם לתבנית /item-page/:id
        const isSpecificItemPage = /^\/item-page\/[^/]+$/.test(currentRoute);

        // עדכון האם להציג את החיפוש
        this.showSearchBar = !isHiddenRoute && !isSpecificItemPage;
      }
    });
  }
}
