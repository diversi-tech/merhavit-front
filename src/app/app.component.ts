import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { ItemsListComponent } from './show/show.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ItemsListModule } from './show/items-list.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditMediaComponent } from './edit-media/edit-media.component';
import { MediaService } from './edit-media/media.service';
import { ReactiveFormsModule } from '@angular/forms';
// import { materialize } from 'rxjs';
import { SearchComponent } from './components/Students/search/search.component';
import { ItemPageComponent } from './components/item-page/item-page.component';
import { UploadResourceComponent } from './components/upload-resource/upload-resource.component';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component'



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
    SearchComponent, 
    ItemPageComponent,
    FormsModule,
    EditMediaComponent,
    ReactiveFormsModule,
    ItemsListModule,
    UploadResourceComponent,
    NavigationBarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] ,

})
export class AppComponent {
  title = 'routing-app';
  showSearchComponent: boolean = true; // ברירת מחדל: להציג את SearchComponent
  navigationBar: boolean = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(() => {
  
        // נתיבים שבהם לא נרצה להציג את הקומפוננטה
        const excludedRoutes = ['/login', '/registration', '/welcome','/','/reset-password','/forgot-password','/success-registration','/upload-resource'];
        this.showSearchComponent = !excludedRoutes.includes(this.router.url);
        this.navigationBar = !excludedRoutes.includes(this.router.url);
      
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
