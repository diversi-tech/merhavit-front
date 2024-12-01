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

    // Send the login request to the server
    this.apiService.Post('/users/login', loginData).subscribe({
      next: (response) => {
        // Store the token in localStorage
        console.log(response);
        localStorage.setItem('access_token', response.access_token);

        // Decode the token to check user role
        const decodedToken: any = jwtDecode(response.access_token); // פענוח הטוקן
        const userRole = decodedToken.userType; // שמירת תפקיד המשתמש מתוך הטוקן

        // אם התפקיד הוא Admin, עבור אל עמוד ניהול המשתמשים
        if (userRole === 'Admin') {
          console.log('Redirecting to user management');
          this.router.navigate(['/user-management']); // ניווט לדף ניהול משתמשים
        } else {
          console.log('Login successful');
          this.router.navigate(['']); // ניווט לעמוד הבית או דף נפרד
        }
      },
      error: (err) => {
        console.error('Login failed', err);
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/registration']);
  }
}
