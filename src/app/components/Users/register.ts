import { Component, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
//import { RegistrationService } from './registration.service';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule  } from '@angular/common/http'; // הוסף את HttpClientModule

@Component({
  selector: 'app-register',
  standalone: true, 
  imports: [ReactiveFormsModule], // הוסף את HttpClientModule כאן

  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
@Injectable({
  providedIn: 'root',  // מאפשר את הגישה לשירות בכל מקום בפרויקט
})
export class RegisterComponent  {
 /* registrationForm: FormGroup;
  specialties: string[] = [];
  seminaries: string[] = [];
  classRoles: string[] = [];

  //constructor(private fb: FormBuilder, private registrationService: RegistrationService) {
    this.registrationForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      specialty: ['', Validators.required],
      seminary: ['', Validators.required],
      classRole: ['', Validators.required],
    });
  }

  /*ngOnInit(): void {
    this.loadOptions();
  }*/

  /*loadOptions(): void {
    this.registrationService.getOptions().subscribe({
      next: (options) => {
        this.specialties = options.specialties;
        this.seminaries = options.seminaries;
        this.classRoles = options.classRoles;
      },
      error: (err) => alert('שגיאה בטעינת האופציות'),
    });
  }*/

  /*onSubmit(): void {
    if (this.registrationForm.valid) {
      this.registrationService.registerStudent(this.registrationForm.value).subscribe({
        next: () => alert('הרישום בוצע בהצלחה'),
        error: () => alert('שגיאה בהרשמה'),
      });
    }
  }*/
}
