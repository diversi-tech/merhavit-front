import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // הוספת Router

@Component({
  selector: 'app-root',
  templateUrl: 'welcome.html',
  styleUrls: ['welcome.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class WelcomeComponent {
  constructor(private router: Router) {} // הוספת constructor עם Router

  // עדכון שם הפונקציה
  navigateToLogin(): void {
    console.log('Navigating to login page...');
    this.router.navigate(['/login']); // ביצוע המעבר לעמוד LOGIN
  }
}
