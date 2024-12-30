import { Component } from '@angular/core';
import { ApiService } from '../../api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-seminary',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './seminary.component.html',
  styleUrl: './seminary.component.css'
})
export class SeminaryComponent {
seminaries:Array<any>=[]
constructor(private apiService:ApiService,private _snackBar: MatSnackBar){}

ngOnInit()
{
  this.getAllSeminaries()
}

getAllSeminaries()
{
  this.apiService.Read('/seminaries').subscribe({
    next: (data) => {
      
      if (Array.isArray(data)) {
        this.seminaries = data;
      } else {
        this.seminaries = data.data || []; // ברירת מחדל למערך ריק אם אין נתונים
      }
      console.log('seminaries', this.seminaries);
    },
    error: (error) => {
      console.error('Error fetching seminaries:', error);
    },
  });
}

addSeminar(seminarToAdd:any)
{
   this.apiService.Post("/seminaries",seminarToAdd).subscribe({
    next: (data) => {
      console.log('seminaries send successful', data);
    },
    error: (error) => {
      console.error('Error sending seminar to back:', error);
    },
   })
}

deleteSeminar(seminar:any)
{
  this.apiService
      .Delete(`/seminaries/${seminar._id}`, {})
      .subscribe({
        next: () => {
          this.seminaries = this.seminaries.filter((item) => item.itemId !== seminar._id);
          this._snackBar.open('הפריט הוסר מסמינרים !', 'סגור', {
            duration: 2000,
            panelClass: ['my-custom-snackbar'],
            direction: 'rtl',
          });
        },
        error: (error) => {
          console.error('Error removing seminar:', error);
          this._snackBar.open(
            'שגיאה במחיקת הפריט מסמינרים.',
            'סגור',
            {
              duration: 3000,
              panelClass: ['error-snackbar'],
              direction: 'rtl',
            }
          );
        },
      });
}

updateSeminar(seminar:any)
{
  this.apiService.Put (`/seminaries/${seminar._id}`,seminar).subscribe({
    next:(response)=>{
       console.log("success update seminar",response); 
    },
    error: (err)=>{
      console.log("error update seminar",err);
    }

  })
}
}
