import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ApiService } from '../../api.service';
@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './registration.html',
  styleUrls: ['./registration.css'],
})
export class RegistrationComponent {
  registrationForm: FormGroup;
  seminaries: any[] = [];
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.registrationForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        idNumber: ['',[ Validators.required, Validators.minLength(9), Validators.maxLength(9),],],
        address: ['', Validators.required],
        phone: ['', [Validators.required, Validators.pattern(/^05\d{8}$/)]],
        email: ['', [Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        class: ['', [Validators.required]],
        specialization: ['', Validators.required],
        seminar: ['', Validators.required],
      },
      { validator: this.passwordMatchValidator }
    ); // הוספת הולידציה של התאמת סיסמאות
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  ngOnInit(): void {
    // קריאה לשרת כדי לקבל את רשימת הסמינרים
    this.apiService.Read('/seminaries').subscribe((data: any[]) => {
   
      this.seminaries = data; // שמירה של הרשימה המלאה כפי שהתקבלה מהשרת
    });
  }

  onSubmit() {

    if (this.registrationForm.invalid) {
      console.log('הרשמה נכשלה. אנא בדוק את כל השדות ונסה שוב.');
      this.errorMessage = 'הרשמה נכשלה. אנא בדוק את כל השדות ונסה שוב.';
      return;
    }
    this.errorMessage = null;
    console.log('this.registrationForm.value', this.registrationForm.value);
    this.apiService
      .Post('/users/register', this.registrationForm.value)
      .subscribe({
        next: (response) => {
          console.log(response);
          localStorage.setItem('access_token', response.access_token);
          this.registrationForm.reset();
          this.router.navigate(['/success-registration']);
        },
        error: (error) => {
          console.error('Registration failed', error.error.message);
          console.log('Registration failed', error.error.message);
          this.errorMessage = error.error?.message || 'הרשמה נכשלה.';
        },
        complete: () => {
          console.log('בקשה הושלמה בהצלחה');
        },
      });
  }


}
