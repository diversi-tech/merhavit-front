import { Routes } from '@angular/router';
import { LoginComponent } from './components/Users/login';
import { RegistrationComponent } from './components/Users/registration';
import { WelcomeComponent } from './components/Users/welcome';
import { UserManagementComponent } from './components/Users/user-management';
import { PersonalDetailsComponent } from './components/Users/personal-details';
import {PasswordChangeComponent} from './components/Users/password-change'
import { SearchComponent } from './components/Students/search/search.component';
import { ItemsListComponent } from './show/show.component';
import { ForgotPasswordComponent } from './components/Users/forgot-password';
import { ResetPasswordComponent } from './components/Users/reset-password';
import { SuccessRegistrationComponent } from './components/Users/success-registration';
import { EducationalResourcesComponent } from './components/Students/educational-resources';

export const routes: Routes = [
  { path: '', component:  WelcomeComponent},  
  { path: 'login', component: LoginComponent },  
  { path: 'students', component:  SearchComponent},
  {path:'show-details',component:ItemsListComponent},
  { path: 'registration', component: RegistrationComponent },  
  { path: 'personal-details', component: PersonalDetailsComponent },  
  { path: 'change-password', component: PasswordChangeComponent }, 
  { path: 'user-management', component: UserManagementComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },  
  { path: 'reset-password', component: ResetPasswordComponent },  
  { path: 'success-registration', component: SuccessRegistrationComponent },  
  {path:'show-details',component:ItemsListComponent},
  {path:'educational-resources',component:EducationalResourcesComponent},

  { path: '**', redirectTo: '' },  // עמוד ברירת מחדל לכל כתובת לא תקינה
];
