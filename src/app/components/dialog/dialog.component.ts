import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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
  newVal: string = '';
  description:string='';

  constructor(public dialogRef: MatDialogRef<DialogComponent>,@Inject(MAT_DIALOG_DATA) public data: any) {
    console.log("data",data);
    
  }

  save() {
    if (this.newVal.trim() && this.data.isDescription && this.description.trim()) {
      this.dialogRef.close({newValue:this.newVal , description:this.description}); // מחזיר את הנושא החדש לקריאה
    }else if(this.newVal.trim()){
      this.dialogRef.close({newValue:this.newVal});
    }
  }

  cancel() {
    this.dialogRef.close(); // סוגר את הדיאלוג
  }
}
