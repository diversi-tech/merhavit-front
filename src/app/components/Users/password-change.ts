import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-password-change',
  templateUrl: './password-change.html',
  styleUrls: ['./login.css'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class PasswordChangeComponent {
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private apiService: ApiService, private router: Router) {}

  onChangePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'הסיסמאות החדשות לא תואמות!';
      return;
    }

    // איפוס הודעות קודמות
    this.errorMessage = '';
    this.successMessage = '';
    
    const idNumber = localStorage.getItem('idNumber');
    if (!idNumber) {
      this.errorMessage = 'לא נמצא מספר תעודת זהות. יש להתחבר מחדש.';
      return;
    } 
    const requestData = {
      idNumber: idNumber,  
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
    };
    console.log('Request Data:', requestData); 


    this.apiService.Put('/users/change-password', requestData).subscribe({
      next: (response) => {
        console.log('Response from server:', response); // בדיקת תגובה מהשרת
        this.successMessage = 'הסיסמה שונתה בהצלחה!';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        setTimeout(() => {
          this.router.navigate(['/personal-details']); // ניתוב אחרי הצגת ההודעה
        }, 2000); // ניתוב אחרי 2 שניות
      },
      error: (error) => {
        console.error('Error from server:', error); // בדיקת שגיאה מהשרת
        this.errorMessage = error.error.message || 'שגיאה בשינוי הסיסמה!';
      },
    });
  }

  cancel() {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.errorMessage = '';
    this.successMessage = '';

    const idNumber = localStorage.getItem('idNumber');
    if (idNumber) {
      this.router.navigate(['/personal-details']);
    } else {
      console.error('No ID found in localStorage'); 
    }
    console.log('שינוי הסיסמה בוטל');
  }
}
