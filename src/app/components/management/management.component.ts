import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { Router, RouterOutlet } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTabsModule, RouterOutlet],
  templateUrl: './management.component.html',
  styleUrl: './management.component.css',
})
export class ManagementComponent {
  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}
  userType: string = '';
  ngOnInit(): void {
  // Perform checks only on the browser platform
  if (isPlatformBrowser(this.platformId)) {
    this.getUserTypeFromToken();
  }  }

  onTabChange(event: MatTabChangeEvent) {
    const tabs: Record<string, string> = {
      'ניהול משתמשים': 'users',
      'ניהול סמינרים': 'seminaries',
      'ניהול תגיות': 'tags',
      'ניהול התמחויות': 'specializations',
      'ניהול נושאים': 'subjects',
    };
    this.router.navigate([`/management/${tabs[event.tab.textLabel]}`]);
  }

  getUserTypeFromToken(): void {
    if (isPlatformBrowser(this.platformId)) {
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
  
}
