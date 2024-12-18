import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.css'
})
export class DialogComponent 
{
  newSubject: string = '';

  constructor(public dialogRef: MatDialogRef<DialogComponent>) {}

  save() {
    if (this.newSubject.trim()) {
      this.dialogRef.close(this.newSubject); // מחזיר את הנושא החדש לקריאה
    }
  }

  cancel() {
    this.dialogRef.close(); // סוגר את הדיאלוג
  }
}
