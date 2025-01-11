import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { TopIconsComponent } from '../top-icons/top-icons.component';
import { NgZone } from '@angular/core';
import { ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, TopIconsComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class HeaderComponent implements OnInit {
  showSearchBar: boolean = true;

  constructor(
    private router: Router,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const hiddenSearchRoutes = [
      '/upload-resource',
      '/personal-details',
      '/orders',
      '/favorites',
      '/login',
      '/management/tags',
      '/management/seminaries',
      '/management/subjects',
      '/management/specializations',
      '/management/classes',
    ];

    this.updateSearchBarVisibility(hiddenSearchRoutes);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        setTimeout(() => {
          this.updateSearchBarVisibility(hiddenSearchRoutes);
        });
      }
    });
  }

  private updateSearchBarVisibility(hiddenSearchRoutes: string[]) {
    const currentRoute = this.router.url.split('?')[0]; // הסרת שאילתות
    const isHiddenRoute = hiddenSearchRoutes.includes(currentRoute);
    const isSpecificItemPage = /^\/item-page\/[^/]+$/.test(currentRoute);

    this.showSearchBar = !isHiddenRoute && !isSpecificItemPage;

    console.log('Show search bar:', this.showSearchBar);

    // אילוץ זיהוי שינויים
    this.cdr.detectChanges();
  }
}
