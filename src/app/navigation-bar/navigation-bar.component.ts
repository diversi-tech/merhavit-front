import { CommonModule } from '@angular/common';  // יש לייבא את המודול הזה
import { Component } from '@angular/core';
import { Router } from '@angular/router';
type ItemType = 'all' | 'guests' | 'movies' | 'songs' | 'books' | 'posters' | 'worksheets' | 'paintings' | 'creations';


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
    } else if (type === 'guests') {
      this.router.navigate(['/items/guests'], { queryParams: { type: 'מערך' }}); // עבור כפתור "מערכים"
    } else if (type === 'movies') {
      this.router.navigate(['/items/movies'], { queryParams: { type: 'סרטון' }}); // עבור כפתור "סרטונים"
    }else if (type === 'songs') {
      this.router.navigate(['/items/songs'], { queryParams: { type: 'שיר' }}); // עבור כפתור "שירים"
    }else if (type === 'books') {
      this.router.navigate(['/items/books'], { queryParams: { type: 'ספר' }}); // עבור כפתור "ספרים"
    }else if (type === 'posters') {
      this.router.navigate(['/items/images/posters'], { queryParams: { type: 'כרזה' }}); // עבור כפתור "כרזות"
    }else if (type === 'worksheets') {
      this.router.navigate(['/items/images/worksheets'], { queryParams: { type: 'דף עבודה' }}); // עבור כפתור "דף עבודה"
    }else if (type === 'paintings') {
      this.router.navigate(['/items/images/paintings'], { queryParams: { type: 'איור' }}); // עבור כפתור "איורים"
    }else if (type === 'creations') {
      this.router.navigate(['/items/images/creations'], { queryParams: { type: 'יצירה' }}); // עבור כפתור "יצירות"
    }else {
      this.router.navigate([`/items/${type}`]); // עבור כל סוג אחר
    }
  }  

  // navigateAndFilter(type: string): void {
  //   this.router.navigate(['/items'], { queryParams: { type: type === 'all' ? '' : type } });
  // }
  
}
