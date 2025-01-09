import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SearchBarComponent } from '../search-bar/search-bar.component'; // עדכון הנתיב לפי מיקום SearchBarComponent
import { TopIconsComponent } from '../top-icons/top-icons.component'; // עדכן את הנתיב לפי מיקום הקובץ

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

    // בדיקה האם הנתיב הנוכחי שייך לרשימה
    this.router.events.subscribe(() => {
      this.showSearchBar = !hiddenSearchRoutes.includes(this.router.url);
    });
  }
}
