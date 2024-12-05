import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class ForgotPasswordComponent {
  idNumber: string = '';
  code: string = '';
  remainingTime: number = 300; 
  timerInterval: any;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    const storedId = localStorage.getItem('idNumber');
    if (storedId) {
      this.idNumber = storedId;
      this.sendResetEmail(); // קריאה לפונקציה ששולחת את המייל
    } else {
      alert('לא הוזנה תעודת זהות, חזור לעמוד הקודם.');
      this.router.navigate(['/login']);
    }

    this.startTimer();
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
      } else {
        clearInterval(this.timerInterval); 
      }
    }, 1000);
  }

  get remainingTimeMinutes() {
    return Math.floor(this.remainingTime / 60);
  }

  get remainingTimeSeconds() {
    return this.remainingTime % 60;
  }

  sendResetEmail() {
    // קריאה ל-API לשליחת המייל
    this.apiService
      .Post('/users/forgot-password', { idNumber: this.idNumber })
      .subscribe({
        next: () => {
          console.log('מייל לאיפוס נשלח בהצלחה.');
        },
        error: (err) => {
          console.error('שליחת המייל נכשלה', err);
        },
      });
  }

  sendResetEmailAgain() {
    this.sendResetEmail(); // שימוש בפונקציה לשליחה חוזרת
    this.remainingTime = 300; 
    this.startTimer(); 
    alert('קוד אימות נוסף נשלח לאימייל שלך.');
  }

  onSubmitVerifyCode() {
    this.apiService
      .Post('/users/verify-code', { idNumber: this.idNumber, code: this.code })
      .subscribe({
        next: () => {
          alert('הקוד אושר בהצלחה');
          this.router.navigate(['/reset-password']); // ניווט לעמוד איפוס סיסמה
        },
        error: (err) => {
          alert('קוד לא תקין');
          console.error('Failed to verify code', err);
        },
      });
  }
}
