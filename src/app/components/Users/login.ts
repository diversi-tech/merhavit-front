import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../api.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  id: string = '';
  password: string = '';
  email: string = '';

  constructor(private router: Router, private apiService: ApiService) {}

  onSubmit() {
    const loginData = { idNumber: this.id, password: this.password }; // Prepare login data

    this.apiService.Post('/users/login', loginData).subscribe({
      next: (response) => {
        console.log(response);
        localStorage.setItem('access_token', response.access_token);
        const decodedToken: any = jwtDecode(response.access_token); // פענוח הטוקן
        const userRole = decodedToken.userType;
        if (userRole === 'Admin') {
          console.log('Redirecting to user management');
          this.router.navigate(['/user-management']); // ניווט לדף ניהול משתמשים
        } else {
          console.log('Login successful');
          localStorage.setItem('idNumber', this.id);
          this.router.navigate(['']);
        }
      },
      error: (err) => {
        console.error('Login failed', err);
      },
    });
  }

  goToRegister() {
    this.router.navigate(['/registration']);
  }

  goToForgotPassword() {
    if (this.id === '') {
      alert('אנא הכנס תעודת זהות לפני שתמשיך לדף שכחתי סיסמה.');
      return;
    } else {
      localStorage.setItem('idNumber', this.id);
      this.router.navigate(['/forgot-password']);
    }
  }
  
  
}
