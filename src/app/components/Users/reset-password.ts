import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../api.service'; // ייבוא של השירות
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;
  errorMessage: string = ''; // משתנה לשגיאה


  constructor(private fb: FormBuilder, private apiService: ApiService,private router: Router) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit() {
    this.errorMessage = ''; // איפוס הודעת השגיאה

    if (this.resetPasswordForm.invalid) {
      // הצגת שגיאה אם אחד השדות לא מולא
      if (this.resetPasswordForm.get('password')?.errors?.['required'] || this.resetPasswordForm.get('confirmPassword')?.errors?.['required']) {
        this.errorMessage = 'יש למלא את כל השדות!';
        return;
      }

      if (this.resetPasswordForm.get('password')?.errors?.['minlength']) {
        this.errorMessage = 'הסיסמה חייבת לכלול לפחות 8 תווים!';
        return;
      }
    }

    const { password, confirmPassword } = this.resetPasswordForm.value;

    if (password !== confirmPassword) {
      this.errorMessage = 'הסיסמאות אינן תואמות!';
      return;
    }

    const idNumber = localStorage.getItem('idNumber');

    if (idNumber) {
      // קריאה ל-API
      this.apiService.Post('/users/reset-password', { idNumber, password }).subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Error changing password', err);
          this.errorMessage = err?.error?.message || 'שגיאה בשינוי הסיסמה';
        }
      });
    } else {
      alert('לא נמצאה תעודת זהות');
    }
  }
}
