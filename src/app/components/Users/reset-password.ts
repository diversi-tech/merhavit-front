import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../api.service'; // ייבוא של השירות

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.resetPasswordForm.valid) {
      const { password, confirmPassword } = this.resetPasswordForm.value;

      if (password !== confirmPassword) {
        alert('הסיסמאות אינן תואמות!');
        return;
      }

      const idNumber = localStorage.getItem('idNumber'); // תעודת זהות (או מזהה אחר)

      if (idNumber) {
        // קריאה לשירות API לשלוח את הסיסמה החדשה
        this.apiService.Post('/users/reset-password', { idNumber, password })
          .subscribe({
            next: (response) => {
              alert('הסיסמה שונתה בהצלחה!');
            },
            error: (err) => {
              console.error('Error changing password', err);
              alert('הייתה בעיה בשינוי הסיסמה');
            }
          });
      } else {
        alert('לא נמצאה תעודת זהות');
      }
    }
  }
}
