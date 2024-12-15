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

  constructor(private router: Router, private apiService: ApiService) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword; // שינוי מצג הסיסמה
  }
  onSubmit() {
    const loginData = { idNumber: this.id, password: this.password };

    this.apiService.Post('/users/login', loginData).subscribe({
      next: (response) => {
        console.log(response);
        localStorage.setItem('access_token', response.access_token);
        const decodedToken: any = jwtDecode(response.access_token);
        const userRole = decodedToken.userType;
        if (userRole === 'Admin') {
          console.log('Redirecting to user management');
          this.router.navigate(['/personal-details']);
        } else {
          console.log('Login successful');
          localStorage.setItem('idNumber', this.id);
          this.router.navigate(['']);
        }
      },
      error: (err) => {
        console.error('Login failed', err);
        this.errorMessage = err?.error?.message || 'Invalid credentials. Please try again.'; 
      },
    });
  }

  goToRegister() {
    this.router.navigate(['/registration']);
  }

  goToForgotPassword() {
    if (this.id === '') {
      this.errorMessage='אנא הכנס תעודת זהות לפני שתמשיך לדף שכחתי סיסמה.';
      return;
    } else {
      localStorage.setItem('idNumber', this.id);
      this.router.navigate(['/forgot-password']);
    }
  }

}
