// import { Component, OnInit } from '@angular/core';
// import { ApiService } from '../../../api.service';
// import { Book } from '../interfaces/book-page.interface';
// import { SimilarBook } from '../interfaces/similar-book-page.interface';
// import { CommonModule } from '@angular/common'; // דרוש עבור Standalone
// import { ActivatedRoute } from '@angular/router'; // נדרש לשליפת הפרמטרים מהנתיב


// @Component({
//   selector: 'app-book-page',
//   templateUrl: './book-page.component.html',
//   styleUrls: ['./book-page.component.css'],
//   standalone: true,
//   imports: [CommonModule], // הוספת CommonModule עבור *ngIf ו-*ngFor
// })
// export class BookPageComponent implements OnInit {
//   book: Book | null = null;
//   similarBooks: Book[] = [];

//   constructor(private route: ActivatedRoute, private apiService: ApiService) {}

//   ngOnInit(): void {
//     const bookId = this.route.snapshot.paramMap.get('id');
//     if (bookId) {
//       this.fetchBookDetails(bookId);
//       this.fetchSimilarBooks(bookId);
//     }
//   }

//   fetchBookDetails(bookId: string) {
//     this.apiService.Read(`/book-page/${bookId}`).subscribe({
//       next: (response) => {
//         this.book = response;
//       },
//       error: (err) => {
//         console.error('Error fetching book details', err);
//       },
//     });
//   }

//   fetchSimilarBooks(bookId: string) {
//     this.apiService.Read(`/book-page/${bookId}/similar`).subscribe({
//       next: (response) => {
//         this.similarBooks = response;
//       },
//       error: (err) => {
//         console.error('Error fetching similar books', err);
//       },
//     });
//   }
// }

import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../api.service';
import { Book } from '../interfaces/book-page.interface';
import { SimilarBook } from '../interfaces/similar-book-page.interface';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-book-page',
  templateUrl: './book-page.component.html',
  styleUrls: ['./book-page.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class BookPageComponent implements OnInit {
  book: Book | null = null;
  similarBooks: SimilarBook[] = [];

  constructor(private route: ActivatedRoute, private apiService: ApiService) {}

  ngOnInit(): void {
    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      this.fetchBookDetails(bookId);
      this.fetchSimilarBooks(bookId);
    } else {
      console.error('Book ID not found in route');
    }
  }

  fetchBookDetails(bookId: string) {
    console.log('Fetching book details for ID:', bookId);
    this.apiService.Read(`/book-page/${bookId}`).subscribe({
      next: (response) => {
        console.log('Book details received:', response);
        this.book = response;
      },
      error: (err) => {
        console.error('Error fetching book details', err);
      },
    });
  }

  fetchSimilarBooks(bookId: string) {
    console.log('Fetching similar books for ID:', bookId);
    this.apiService.Read(`/book-page/${bookId}/similar`).subscribe({
      next: (response) => {
        console.log('Similar books received:', response);
        this.similarBooks = response;
      },
      error: (err) => {
        console.error('Error fetching similar books', err);
      },
    });
  }
}
