import { CommonModule } from '@angular/common';
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

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.registrationForm = this.fb.group({
      fullName: ['', Validators.required],
      idNumber: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^05\d{8}$/)]],
      email: ['', [Validators.required, Validators.email]],
      class: ['', [Validators.required, Validators.minLength(6)]],
      specialization: ['', Validators.required],
      seminar: ['', Validators.required],

    });
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      console.log("this.registrationForm.value",this.registrationForm.value)
      this.apiService
        .Post('/users/register', this.registrationForm.value)
        .subscribe({
          next: (response) => {
            alert('הרשמה בוצעה בהצלחה');
            this.registrationForm.reset();
          },
          error: (error) => {
            alert('התרחשה שגיאה: ' + error.error.message);
          },
          complete: () => {
            console.log('בקשה הושלמה בהצלחה');
          },
        });
    }
  }

}