import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { ItemsListComponent } from './show/show.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ItemsListModule } from './show/items-list.module';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './components/Students/search/search.component';
import { ItemPageComponent } from './components/item-page/item-page.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive,ItemsListComponent,MatDialogModule,ItemsListModule,SearchComponent, ItemPageComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] 
})
export class AppComponent {
  title = 'routing-app';
  showSearchComponent: boolean = true; // ברירת מחדל: להציג את SearchComponent

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(() => {
  
        // נתיבים שבהם לא נרצה להציג את הקומפוננטה
        const excludedRoutes = ['/login', '/registration', '/welcome','/'];
        this.showSearchComponent = !excludedRoutes.includes(this.router.url);
      
    });
  }
  activeSubMenu: string | null = null;

toggleSubMenu(menu: string): void {
  if (this.activeSubMenu === menu) {
    this.activeSubMenu = null; // סגירה אם כבר פתוח
  } else {
    this.activeSubMenu = menu; // פתיחה
  }
}
}
