import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app/app.component'; // קומפוננטת הבסיס, מכילה את <router-outlet>
import { routes } from './app/app.routes';
import { LoginComponent } from './app/components/Users/login';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(RouterModule.forRoot(routes)) // הגדרת הנתיבים
  ],
})
  .catch((err) => console.error(err));
