import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-password-change',
  templateUrl: './password-change.html',
  styleUrls: ['./password-change.css'],
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
    this.errorMessage = '';
    this.successMessage = '';

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'הסיסמאות החדשות לא תואמות!';
      return;
    }

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('access_token');

      if (token) {
        try {
          const decodedToken: any = jwtDecode(token);
          const idNumber = decodedToken.idNumber;
          console.log('idNumber', idNumber);
          if (idNumber) {
            const requestData = {
              idNumber: idNumber,
              currentPassword: this.currentPassword,
              newPassword: this.newPassword,
            };
            console.log('Request Data:', requestData);

            this.apiService
              .Put('/users/change-password', requestData)
              .subscribe({
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
                  this.errorMessage =
                    error.error.message || 'שגיאה בשינוי הסיסמה!';
                },
              });
          } else {
            console.error('ID number not found in token');
            this.router.navigate(['/login']);
            return;
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          this.router.navigate(['/login']);
          return;
        }
      } else {
        console.error('Access token not found in localStorage');
        this.errorMessage = 'לא נמצא מספר תעודת זהות. יש להתחבר מחדש.';
        this.router.navigate(['/login']);
        return;
      }
    } else {
      console.warn('Code is running on the server. Skipping token check.');
    }
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
