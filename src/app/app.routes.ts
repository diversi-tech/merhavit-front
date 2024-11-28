import { Routes } from '@angular/router';
import { LoginComponent } from './components/Users/login';
import { RegistrationComponent } from './components/Users/registration';
import { PersonalDetailsComponent } from './components/Users/personal-details';

export const routes: Routes = [
  { path: '', component: LoginComponent },  // עמוד הכניסה
  { path: 'registration', component: RegistrationComponent },  // עמוד הרישום
  { path: 'personalDetails/:idNumber', component: PersonalDetailsComponent },  // עמוד הרישום
  { path: '**', redirectTo: '' },  // עמוד ברירת מחדל לכל כתובת לא תקינה
];
