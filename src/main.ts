import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideRouter, RouterModule, withHashLocation } from '@angular/router';
import { AppComponent } from './app/app.component'; // קומפוננטת הבסיס, מכילה את <router-outlet>
import { routes } from './app/app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatDialogModule } from '@angular/material/dialog';


bootstrapApplication(AppComponent, {
  providers: [
   // importProvidersFrom(RouterModule.forRoot(routes)) ,
    provideRouter(routes, withHashLocation()), // שימוש ב-HashLocationStrategy
    MatDialogModule ,
    provideHttpClient(withInterceptors([authInterceptor])), // רישום ה-Interceptor
    provideAnimations(), provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync(),
    // הגדרת הנתיבים
  ],
})
  .catch((err) => console.error(err));
