import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../api.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class LoginComponent {
  id: string = '';
  password: string = '';
  email: string = '';
  showPassword: boolean = false; // משתנה לבדוק אם להציג את הסיסמה
  errorMessage: string = ''; // משתנה לשגיאה
  isIdValid: boolean = false; // משתנה לבדוק אם תעודת הזהות תקינה

  constructor(private router: Router, private apiService: ApiService) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword; // שינוי מצג הסיסמה
  }

  validateId(id: string): boolean {
    // פונקציה לבדוק תעודת זהות באופן בסיסי (יש להרחיב בהתאם לצורך)
    return id.length === 9 && /^[0-9]+$/.test(id);
  }

  onSubmit() {
    if (!this.validateId(this.id)) {
      this.errorMessage = 'תעודת זהות אינה תקינה. יש להזין מספר בן 9 ספרות.';
      return;
    }
    const loginData = { idNumber: this.id, password: this.password };
     console.log("login data",loginData);
     
    this.apiService.Post('/users/login', loginData).subscribe({
      next: (response) => {
        // console.log(response);
        localStorage.setItem('access_token', response.access_token);
        const decodedToken: any = jwtDecode(response.access_token);
        const userRole = decodedToken.userType;
        if (userRole === 'Admin') {
          this.router.navigate(['/personal-details']);
        } else {
          localStorage.setItem('idNumber', this.id);
          this.router.navigate(['/show-details']);
        }
      },
      error: (err) => {
        console.error('Login failed', err);
        this.errorMessage = err?.error?.message || 'שם משתמש או סיסמה אינם נכונים. אנא נסה שוב.'; 
      },
    });
  }

  goToRegister() {
    this.router.navigate(['/registration']);
  }

  goToForgotPassword() {
    if (this.id === '') {
      this.errorMessage = 'אנא הכנס תעודת זהות לפני שתמשיך לדף שכחתי סיסמה.';
      return;
    }

    // קריאה ל-API לבדוק אם המשתמש רשום
    this.apiService.Read(`/users/check/${this.id}`).subscribe({
      next: (response) => {
        if (response.exists) {
          localStorage.setItem('idNumber', this.id);
          this.router.navigate(['/forgot-password']);
        } else {
          this.errorMessage = 'תעודת זהות לא קיימת במערכת. יש להירשם תחילה.';
        }
      },
      error: (err:any) => {
        console.error('Failed to verify user', err);
        this.errorMessage = 'שגיאה בבדיקת תעודת זהות. אנא נסה שנית.';
      }
    });
  }
}
