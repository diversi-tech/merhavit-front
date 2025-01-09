import { Component } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { ItemsListComponent } from './show/show.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ItemsListModule } from './show/items-list.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ItemPageComponent } from './components/item-page/item-page.component';
import { UploadResourceComponent } from './components/upload-resource/upload-resource.component';
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ItemsListComponent,
    MatDialogModule,
    ItemsListModule,
    ItemPageComponent,
    FormsModule,
    ReactiveFormsModule,
    ItemsListModule,
    UploadResourceComponent,
    NavigationBarComponent,
    HeaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'routing-app';
  showHeaderComponent: boolean = true;

  navigationBar: boolean = true;
  constructor(private router: Router) {}
  ngOnInit() {
    this.router.events.subscribe(() => {
      // נתיבים שבהם לא נרצה להציג את הקומפוננטה
      const excludedRoutes = [
        '/login',
        '/registration',
        '/welcome',
        '/',
        '/reset-password',
        '/forgot-password',
        '/success-registration',
      ];

      const currentRoute = this.router.url.split('?')[0]; // הסרת שאילתות במידת הצורך


      this.showHeaderComponent = !excludedRoutes.includes(currentRoute);

      this.navigationBar = !excludedRoutes.includes(currentRoute);
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
