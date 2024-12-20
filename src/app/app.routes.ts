import { Routes } from '@angular/router';
import { LoginComponent } from './components/Users/login';
import { RegistrationComponent } from './components/Users/registration';
import { WelcomeComponent } from './components/Users/welcome';
import { UserManagementComponent } from './components/Users/user-management';
import { PersonalDetailsComponent } from './components/Users/personal-details';
import { PasswordChangeComponent } from './components/Users/password-change';
import { SearchComponent } from './components/Students/search/search.component';
import { ItemsListComponent } from './show/show.component';
import { ForgotPasswordComponent } from './components/Users/forgot-password';
import { ResetPasswordComponent } from './components/Users/reset-password';
import { SuccessRegistrationComponent } from './components/Users/success-registration';
import { ItemPageComponent } from './components/item-page/item-page.component';
import { EditMediaComponent } from './edit-media/edit-media.component';
import { UploadResourceComponent } from './components/upload-resource/upload-resource.component';
import { FavoritesComponent } from './components/Favorites/favorites';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'students', component: SearchComponent },
  { path: 'show-details', component: ItemsListComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'personal-details', component: PersonalDetailsComponent },
  { path: 'change-password', component: PasswordChangeComponent },
  { path: 'user-management', component: UserManagementComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'success-registration', component: SuccessRegistrationComponent },
  { path: 'edit-media', component: EditMediaComponent },
  { path: 'item-page/:id', component: ItemPageComponent },
  { path: 'upload-resource', component: UploadResourceComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: '**', redirectTo: '' }, // עמוד ברירת מחדל לכל כתובת לא תקינה
];
