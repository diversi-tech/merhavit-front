import { Routes } from '@angular/router';
import { LoginComponent } from './components/Users/login';
import { RegistrationComponent } from './components/Users/registration';
import { WelcomeComponent } from './components/Users/welcome';
import { UserManagementComponent } from './components/Users/user-management';
import { ItemsListComponent } from './show/show.component';

export const routes: Routes = [
  { path: '', component:  WelcomeComponent},  
  { path: 'login', component: LoginComponent },  
  { path: 'registration', component: RegistrationComponent },  
  { path: 'user-management', component: UserManagementComponent },
  {path:'show-details',component:ItemsListComponent},
  { path: '**', redirectTo: '' },  // עמוד ברירת מחדל לכל כתובת לא תקינה
];
