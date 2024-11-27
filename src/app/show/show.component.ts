import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
//import { ConfirmDeleteDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
@Component({
  selector: 'app-show',
  standalone: true,
  imports: [],
  templateUrl: './show.component.html',
  styleUrl: './show.component.css'
})
export class ShowComponent {
  constructor(public dialog: MatDialog) { }

  // deleteMedia(itemId: number): void {
  //   const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);

    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     // כאן תוכל להוסיף את הלוגיקה למחוק את הפריט מהמידע שלך
    //     console.log(`פריט עם ID ${itemId} נמחק.`);
    //   }
    // });
  }
