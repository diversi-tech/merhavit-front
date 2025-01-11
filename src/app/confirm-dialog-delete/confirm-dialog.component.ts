// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-confirm-dialog',
//   standalone: true,
//   imports: [],
//   templateUrl: './confirm-dialog.component.html',
//   styleUrl: './confirm-dialog.component.css'
// })
// export class ConfirmDialogComponent {

// }

import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { importProvidersFrom } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <h1 mat-dialog-title>אישור מחיקה</h1>
    <div mat-dialog-content>האם אתה בטוח שברצונך למחוק את פריט המדיה?</div>
    <div mat-dialog-actions>
      <button mat-button (click)="onNoClick()">לא</button>
      <button mat-button (click)="confirm()">כן</button>
    </div>
  `,
  standalone: true,
  providers: [MatDialogModule], // הוספת MatDialogModule כאן
})
export class ConfirmDialogComponent1 {
  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent1>) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.dialogRef.close(true);
  }
}

