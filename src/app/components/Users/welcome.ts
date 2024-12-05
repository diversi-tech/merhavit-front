import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'welcome.html',
  styleUrls: ['welcome.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class WelcomeComponent {
  constructor(private router: Router) {}
  navigateToLogin(): void {
    console.log('Navigating to login page...');
    this.router.navigate(['/login']);
  }
}
