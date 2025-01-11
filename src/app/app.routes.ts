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
import { QuestionSuccessfulComponent } from './components/item-page/question-successful/question-successful';
import { ItemPageComponent } from './components/item-page/item-page.component';
import { UploadResourceComponent } from './components/upload-resource/upload-resource.component';
import { FavoritesComponent } from './components/Favorites/favorites';
import { TagManagementComponent } from './components/Librarian/tag-management';
import { SpecializationManagementComponent } from './components/Librarian/specialization-management';
import { ManagementComponent } from './components/management/management.component';
import { SeminaryComponent } from './components/seminary/seminary.component';
import { SubjectManagementComponent } from './components/Librarian/subject-management';
import { ClassManagementComponent } from './components/Librarian/class-management';
import { BorrowRequestManagementComponent } from './components/Librarian/borrowRequest';
import { OrdersComponent } from './components/orders/orders.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { TopIconsComponent } from './components/top-icons/top-icons.component';
import { HeaderComponent } from './components/header/header.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'students', component: HeaderComponent },
  { path: 'show-details', component: ItemsListComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'personal-details', component: PersonalDetailsComponent },
  { path: 'change-password', component: PasswordChangeComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'success-registration', component: SuccessRegistrationComponent },
  { path: 'question-successful', component: QuestionSuccessfulComponent },
  { path: 'borrowRequests', component: BorrowRequestManagementComponent },
  { path: 'item-page/:id', component: ItemPageComponent },
  { path: 'upload-resource/:_id', component: UploadResourceComponent },
  { path: 'upload-resource', component: UploadResourceComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'orders', component: OrdersComponent },
 

  { path: 'management', component: ManagementComponent,
    children: [
      { path: 'tags', component: TagManagementComponent },
      { path: 'seminaries', component: SeminaryComponent },
      { path: 'users', component: UserManagementComponent },
      { path: 'subjects', component:SubjectManagementComponent },
      { path: 'specializations', component: SpecializationManagementComponent },
      { path: 'classes', component: ClassManagementComponent },
      { path: '', redirectTo: 'tags', pathMatch: 'full' }, // ניתוב ברירת מחדל
    ],
  },//ניהול לספרנית ואדמין בלבד
  
  { path: '**', redirectTo: '' }, // עמוד ברירת מחדל לכל כתובת לא תקינה
];

