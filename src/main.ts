import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app/app.component'; // קומפוננטת הבסיס, מכילה את <router-outlet>
import { routes } from './app/app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/auth.interceptor';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';  // הוספת HashLocationStrategy
import { WelcomeComponent } from './app/components/Users/welcome';


bootstrapApplication(WelcomeComponent)
  .catch((err) => console.error(err));
