import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true, // הוספת הגדרה זו אם זו קומפוננטה עצמאית
  imports: [CommonModule, FormsModule], // ייבוא מודולים נדרשים
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  //משתנים שמתחברים אל HTML כך שזה TWOBINDING
  phone: string = ''; 
  id: string = ''; 

  constructor(private router: Router) {} // הוספת Router

  onSubmit() {
    console.log('Phone:', this.phone); 
    console.log('ID:', this.id); 
  }
  goToRegister() {
    this.router.navigate(['/register']); // מעביר את המשתמש לעמוד הרישום
  }
}
