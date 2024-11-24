import { Routes } from '@angular/router';
import { LoginComponent } from './components/Users/login'; 
import { RegisterComponent } from './components/Users/register';

export const routes: Routes = [
  { path: '', component: LoginComponent },  // עמוד הכניסה כנתיב ברירת מחדל
  { path: 'register', component: RegisterComponent },  // עמוד הרישום
  { path: '**', redirectTo: '' },  // עמוד ברירת מחדל לכל כתובת לא תקינה
];
