import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app/app.component'; // קומפוננטת הבסיס, מכילה את <router-outlet>
import { routes } from './app/app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/auth.interceptor';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';  // הוספת HashLocationStrategy


bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(RouterModule.forRoot(routes, { useHash: true })),  // הוספת useHash: true
    { provide: LocationStrategy, useClass: HashLocationStrategy },  // הגדרת HashLocationStrategy    
    provideHttpClient(withInterceptors([authInterceptor]))  // רישום ה-Interceptor
  ],
})
  .catch((err) => console.error(err));
