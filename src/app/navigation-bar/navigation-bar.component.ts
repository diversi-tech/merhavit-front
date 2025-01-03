import { CommonModule } from '@angular/common'; // יש לייבא את המודול הזה
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
type ItemType = 'all' | 'guests' | 'movies' | 'songs' | 'books' | 'posters' | 'worksheets' | 'paintings' | 'creations'|'management';


@Component({
  selector: 'app-navigation-bar',
  standalone: true,
  imports: [CommonModule], // הוסף את CommonModule כאן
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.css'],
})
export class NavigationBarComponent {

 

  constructor(private router: Router) {
    this.getUserTypeFromToken()
  }
  activeSubMenu: string | null = null;
  userType:string=''

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
      this.router.navigate(['/items/guests'], {
        queryParams: { type: 'מערך' },
      }); // עבור כפתור "מערכים"
    } else if (type === 'movies') {
      this.router.navigate(['/items/movies'], {
        queryParams: { type: 'סרטון' },
      }); // עבור כפתור "סרטונים"
    } else if (type === 'songs') {
      this.router.navigate(['/items/songs'], { queryParams: { type: 'שיר' } }); // עבור כפתור "שירים"
    } else if (type === 'books') {
      this.router.navigate(['/items/books'], { queryParams: { type: 'ספר' } }); // עבור כפתור "ספרים"
    } else if (type === 'posters') {
      this.router.navigate(['/items/images/posters'], {
        queryParams: { type: 'כרזה' },
      }); // עבור כפתור "כרזות"
    } else if (type === 'worksheets') {
      this.router.navigate(['/items/images/worksheets'], {
        queryParams: { type: 'דף עבודה' },
      }); // עבור כפתור "דף עבודה"
    } else if (type === 'paintings') {
      this.router.navigate(['/items/images/paintings'], {
        queryParams: { type: 'איור' },
      }); // עבור כפתור "איורים"
    } else if (type === 'creations') {
      this.router.navigate(['/items/images/creations'], {
        queryParams: { type: 'יצירה' },
      }); // עבור כפתור "יצירות"
    }else if(type=== 'management'){
      this.router.navigate(['/management'])//ניהול 
    } else {
      this.router.navigate([`/items/${type}`]); // עבור כל סוג אחר
    }
  }  

  // navigateAndFilter(type: string): void {
  //   this.router.navigate(['/items'], { queryParams: { type: type === 'all' ? '' : type } });
  // }
  getUserTypeFromToken(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    
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
    }else {
        console.error('localStorage is not available on the server.');
      }
    
    }
    
  }

  

