import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app/app.component'; // קומפוננטת הבסיס, מכילה את <router-outlet>
import { routes } from './app/app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/auth.interceptor';


bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(RouterModule.forRoot(routes)) ,
    provideHttpClient(withInterceptors([authInterceptor])) // רישום ה-Interceptor
    // הגדרת הנתיבים
  ],
})
  .catch((err) => console.error(err));
