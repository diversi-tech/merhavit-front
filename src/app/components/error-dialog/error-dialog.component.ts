import { MatCardModule } from '@angular/material/card';
import { Component} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-error-dialog',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './error-dialog.component.html',
  styleUrl: './error-dialog.component.css'
})
export class ErrorDialogComponent {
  constructor(public dialogRef: MatDialogRef<ErrorDialogComponent>){}

  onClose() { this.dialogRef.close();} // סוגר את הדיאלוג 

}
