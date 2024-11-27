import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../api.service'; // חיבור ל־ApiService
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  identity: string = '';
  currentStep: number = 1; 

  constructor(private apiService: ApiService, private router: Router) {}

  nextStep() {
    if (this.currentStep === 2) {
      if (!this.identity) {
        alert('אנא הכנס תעודת זהות');
        return;
      }
      this.verifyIdentity(); // בדיקת תעודת הזהות מול השרת
    } else {
      this.currentStep++;
    }
  }
  // חזרה להתחלה
  restart() {
    this.currentStep = 1;
    this.identity = '';
  }

  verifyIdentity() {
    this.apiService.Read(`/users/${this.identity}`).subscribe({
      next: (response) => {
        if (response?.isRegistered) {
          this.currentStep++;
        } else {
          alert('משתמש לא קיים, אנא עבור לרישום');
        }
      },
      error: (err) => {
        console.error(err);
        alert('שגיאה בתקשורת עם השרת');
      },
    });
  }

  navigateToRegistration() {
    this.router.navigate(['/registration']); 
  }
}
