import { Routes } from '@angular/router';
import { LoginComponent } from './components/Users/login';
import { RegistrationComponent } from './components/Users/registration';
import { WelcomeComponent } from './components/Users/welcome';
import { UserManagementComponent } from './components/Users/user-management';
import { ForgotPasswordComponent } from './components/Users/forgot-password';
import { ResetPasswordComponent } from './components/Users/reset-password';
import { SuccessRegistrationComponent } from './components/Users/success-registration';

export const routes: Routes = [
  { path: '', component:  WelcomeComponent},  
  { path: 'login', component: LoginComponent },  
  { path: 'registration', component: RegistrationComponent },  
  { path: 'user-management', component: UserManagementComponent },  
  { path: 'forgot-password', component: ForgotPasswordComponent },  
  { path: 'reset-password', component: ResetPasswordComponent },  
  { path: 'success-registration', component: SuccessRegistrationComponent },  

  { path: '**', redirectTo: '' },  // עמוד ברירת מחדל לכל כתובת לא תקינה
];
