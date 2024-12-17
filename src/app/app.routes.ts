import { Routes } from '@angular/router';
import { LoginComponent } from './components/Users/login';
import { RegistrationComponent } from './components/Users/registration';
import { WelcomeComponent } from './components/Users/welcome';
import { UserManagementComponent } from './components/Users/user-management';
import { PersonalDetailsComponent } from './components/Users/personal-details';
import {PasswordChangeComponent} from './components/Users/password-change'
import { SearchComponent } from './components/Students/search/search.component';
import { ItemsListComponent } from './show/show.component'
import { EditMediaComponent } from './edit-media/edit-media.component';

export const routes: Routes = [
  { path: '', component:  WelcomeComponent},  
  { path: 'login', component: LoginComponent },  
  { path: 'students', component:  SearchComponent},
   {path:'show-details',component:ItemsListComponent},
  { path: 'registration', component: RegistrationComponent },  
  { path: 'personal-details', component: PersonalDetailsComponent },  
  { path: 'change-password', component: PasswordChangeComponent }, 
    { path: 'user-management', component: UserManagementComponent },
  { path: 'edit-media', component: EditMediaComponent },
  { path: '**', redirectTo: '' },  // עמוד ברירת מחדל לכל כתובת לא תקינה
];
