import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../api.service';

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
        // Store the token, for example, in localStorage
        console.log(response);
        
        localStorage.setItem('access_token', response.access_token);
        console.log('Login successful');
        this.router.navigate(['']); // Redirect to the dashboard or home page
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
