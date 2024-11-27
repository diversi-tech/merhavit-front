import { CommonModule } from '@angular/common';
import { HttpClientJsonpModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true, // הקומפוננטה עצמאית
  imports: [CommonModule, FormsModule,ReactiveFormsModule], // ייבוא המודולים הנדרשים
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  // משתנים לקישור דו-כיווני
  phone: string = ''; 
  id: string = ''; 

  constructor(private router: Router) {} // הזרקת Router

  // פונקציה שתופעל בעת שליחת הטופס
  onSubmit() {
    console.log('Phone:', this.phone); 
    console.log('ID:', this.id); 
  }

  // פונקציה לניווט לעמוד ההרשמה
  goToRegister() {
    this.router.navigate(['/register']); // ניווט לנתיב /register
  }
}
