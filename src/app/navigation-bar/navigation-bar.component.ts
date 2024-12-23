import { CommonModule } from '@angular/common';  // יש לייבא את המודול הזה
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation-bar',
  standalone: true,
  imports: [CommonModule],  // הוסף את CommonModule כאן
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.css']
})
export class NavigationBarComponent {

  constructor(private router: Router) {}
  activeSubMenu: string | null = null;

  // פונקציה לפתיחת/סגירת תתי-תפריטים
  toggleSubMenu(menu: string): void {
    if (this.activeSubMenu === menu) {
      this.activeSubMenu = null; // סגירה אם כבר פתוח
    } else {
      this.activeSubMenu = menu; // פתיחה
    }
  }

  navigateAndFilter(type: string): void {
    // אם סוג הפריט הוא "הכל", אין צורך להעביר פרמטר, אחרת נשלח את סוג הפריט המתאים
    if (type === 'all') {
      this.router.navigate(['/items/all']); // עבור כפתור "הכל"
    } else {
      this.router.navigate([`/items/${type}`]); // עבור כל סוג אחר
    }
  }  


}
