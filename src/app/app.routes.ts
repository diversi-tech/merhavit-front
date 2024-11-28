import { Routes } from '@angular/router';
import { LoginComponent } from './components/Users/login';
import { RegistrationComponent } from './components/Users/registration';
import { WelcomeComponent } from './components/Users/welcome';

export const routes: Routes = [
  { path: '', component:  WelcomeComponent},  
  { path: 'login', component: LoginComponent },  
  { path: 'registration', component: RegistrationComponent },  
  { path: '**', redirectTo: '' },  // עמוד ברירת מחדל לכל כתובת לא תקינה
];
