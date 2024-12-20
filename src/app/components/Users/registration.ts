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

  constructor(private fb: FormBuilder, private apiService: ApiService, private router: Router ) {
    this.registrationForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      idNumber: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^05\d{8}$/)]],
      email: ['', [Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required], 
      class: ['', [Validators.required]],
      specialization: ['', Validators.required],
      seminar: ['', Validators.required],

    }, { validator: this.passwordMatchValidator }); // הוספת הולידציה של התאמת סיסמאות
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  
  onSubmit() {
    if (this.registrationForm.valid) {
      console.log("this.registrationForm.value",this.registrationForm.value)
      this.apiService
        .Post('/users/register', this.registrationForm.value)
        .subscribe({
          next: (response) => {
            this.registrationForm.reset();
            this.router.navigate(['/success-registration']);
          },
          error: (error) => {
            alert( error.error.message);
          },
          complete: () => {
            console.log('בקשה הושלמה בהצלחה');
          },
        });
    }
  }

}
