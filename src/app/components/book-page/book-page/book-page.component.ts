import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../api.service';
import { Book } from '../interfaces/book-page.interface';
import { SimilarBook } from '../interfaces/similar-book-page.interface';
import { CommonModule } from '@angular/common'; // דרוש עבור Standalone
import { ActivatedRoute } from '@angular/router'; // נדרש לשליפת הפרמטרים מהנתיב


// @Component({
//   selector: 'app-book-page',
//   standalone: true,
//   templateUrl: './book-page.component.html',
//   styleUrls: ['./book-page.component.css'],
// })
// export class BookPageComponent implements OnInit {
//   book!: Book; // פרטי הספר
//   similarBooks: SimilarBook[] = []; // ספרים דומים
//   bookId!: string; // ID דינמי מהנתיב

//   constructor(private apiService: ApiService, private route: ActivatedRoute) {}

//   ngOnInit(): void {
//     // שליפת ה-ID מהנתיב
//     this.route.paramMap.subscribe((params) => {
//       this.bookId = params.get('id') || ''; // קבלת ה-ID מהנתיב (ברירת מחדל: מחרוזת ריקה)
//       if (this.bookId) {
//         this.fetchBookDetails();
//         this.fetchSimilarBooks();
//       }
//     });
//   }

//   // שליפת פרטי הספר
//   fetchBookDetails(): void {
//     this.apiService.Read(`/book-page/${this.bookId}`).subscribe({
//       next: (response) => {
//         this.book = response; // שמירת נתוני הספר
//       },
//       error: (error) => {
//         console.error('Error fetching book details:', error);
//       },
//     });
//   }

//   // שליפת ספרים דומים
//   fetchSimilarBooks(): void {
//     this.apiService.Read(`/book-page/${this.bookId}/similar`).subscribe({
//       next: (response) => {
//         this.similarBooks = response; // שמירת רשימת ספרים דומים
//       },
//       error: (error) => {
//         console.error('Error fetching similar books:', error);
//       },
//     });
//   }
// }



@Component({
  selector: 'app-book-page',
  standalone: true,
  templateUrl: './book-page.component.html',
  styleUrls: ['./book-page.component.css'],
})
export class BookPageComponent implements OnInit {
  book!: Book; // פרטי הספר
  similarBooks: SimilarBook[] = []; // ספרים דומים
  bookId!: string; // ID של הספר מהנתיב

  constructor(private apiService: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // קבלת ה-ID מתוך הפרמטר שנשלח לנתיב
    this.route.queryParams.subscribe((params) => {
      this.bookId = params['id']; // ה-ID מועבר כפרמטר ב-URL
      if (this.bookId) {
        this.fetchBookDetails(); // קריאה לפונקציה שמביאה את פרטי הספר
        this.fetchSimilarBooks(); // קריאה לפונקציה שמביאה ספרים דומים
      } else {
        console.error('Book ID not provided in URL.');
      }
    });
  }

  // שליפת פרטי הספר
  fetchBookDetails(): void {
    this.apiService.Read(`/book-page/${this.bookId}`).subscribe({
      next: (response) => {
        this.book = response; // שמירת נתוני הספר
      },
      error: (error) => {
        console.error('Error fetching book details:', error);
      },
    });
  }

  // שליפת ספרים דומים
  fetchSimilarBooks(): void {
    this.apiService.Read(`/book-page/${this.bookId}/similar`).subscribe({
      next: (response) => {
        this.similarBooks = response; // שמירת רשימת ספרים דומים
      },
      error: (error) => {
        console.error('Error fetching similar books:', error);
      },
    });
  }
}
