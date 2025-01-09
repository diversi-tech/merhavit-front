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
import { israeliIdValidator } from './id-validator';


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
  specializations: any[] = [];
  classes: any[] = [];
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
        idNumber: ['', [Validators.required, israeliIdValidator()]],
        address: ['', Validators.required],
        phone: ['', [Validators.required, Validators.pattern(/^05\d{8}$/)]],
        email: ['', [Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        class: [{ value: '', disabled: true }, Validators.required],
        specialization: [{ value: '', disabled: true }, Validators.required],
        seminar: [{ value: '', disabled: true }, Validators.required],
      },
      { validator: this.passwordMatchValidator }
    ); // הוספת הולידציה של התאמת סיסמאות
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  get idNumber() {
    return this.registrationForm.get('idNumber');
  }

  ngOnInit(): void {
    this.apiService.Read('/seminaries').subscribe((data: any[]) => {
      this.seminaries = data;
      this.registrationForm.get('seminar')?.enable();
    });

    this.apiService.Read('/specializations').subscribe((data: any[]) => {
      this.specializations = data;
      this.registrationForm.get('specialization')?.enable();
    });

    this.apiService.Read('/classes').subscribe((data: any[]) => {
      this.classes = data;
      this.registrationForm.get('class')?.enable();
    });
  }

  onSubmit() {
    if (this.registrationForm.invalid) {
      console.log('הרשמה נכשלה. אנא בדוק את כל השדות ונסה שוב.');
      this.errorMessage = 'הרשמה נכשלה. אנא בדוק את כל השדות ונסה שוב.';
      console.log('Form Submitted:', this.registrationForm.value);
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
          this.registrationForm.get('class')?.disable();
          this.registrationForm.get('specialization')?.disable();
          this.registrationForm.get('seminar')?.disable();
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
