// import { Component } from '@angular/core';
// import { MatDialog } from '@angular/material/dialog';
// //import { ConfirmDeleteDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
// @Component({
//   selector: 'app-show',
//   standalone: true,
//   imports: [],
//   templateUrl: './show.component.html',
//   styleUrl: './show.component.css'
// })
// export class ShowComponent {
//   constructor(public dialog: MatDialog) { }

//   // deleteMedia(itemId: number): void {
//   //   const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);

//     // dialogRef.afterClosed().subscribe(result => {
//     //   if (result) {
//     //     // כאן תוכל להוסיף את הלוגיקה למחוק את הפריט מהמידע שלך
//     //     console.log(`פריט עם ID ${itemId} נמחק.`);
//     //   }
//     // });
//   }


// import { Component, Input } from '@angular/core';
// import { Message } from './message.model';

// @Component({
//   selector: 'app-messages-list',
//   templateUrl: './messages-list.component.html',
//   styleUrls: ['./messages-list.component.css']
// })
// export class ShowComponent {
//   @Input() messages: Message[] = [];
//   currentPage = 1;
//   itemsPerPage = 10;

//   get paginatedMessages() {
//     const startIndex = (this.currentPage - 1) * this.itemsPerPage;
//     return this.messages.slice(startIndex, startIndex + this.itemsPerPage);
//   }

//   nextPage() {
//     this.currentPage++;
//   }

//   previousPage() {
//     if (this.currentPage > 1) {
//       this.currentPage--;
//     }
//   }
// }



// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { MatTableModule } from '@angular/material/table';

// @Component({
//   selector: 'app-items-list',
//   templateUrl: './items-list.component.html',
//   styleUrls: ['./items-list.component.css'],
//   standalone: true,
//   imports: [CommonModule, MatTableModule]
// })
// export class ItemsListComponent implements OnInit {
//   ngOnInit(): void {
    
//   }
//   items = [
//     {
//       title: 'סרטון בנושא סבלנות',
//       description: 'המפגשים איך מחנכים בורות בסבלנות',
//       details: {
//         author: 'קובי שיר',
//         year: 1953,
//       },
//       type: 'מאמר',
//       date: '17.02.2020',
//     },
//     // הוסף עוד פריטים כאן
//   ];
// }

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-items-list',
  templateUrl: './show.component.html', // ודא שהנתיב נכון!
  styleUrls: ['./show.component.css'],
  standalone: true, // זה הופך את הרכיב לעצמאי
  imports: [CommonModule, MatTableModule] // ייבוא ישיר של מודולים
})
export class ItemsListComponent implements OnInit {
  ngOnInit(): void {
    
  }
  items = [
   {
          title: 'סרטון בנושא סבלנות',
           description: 'המפגשים איך מחנכים בורות בסבלנות',
           details: {
             author: 'קובי שיר',
             year: 1953,
           },
           type: 'מאמר',
           date: '17.02.2020',
         },
         // הוסף עוד פריטים כאן
       ];
}
