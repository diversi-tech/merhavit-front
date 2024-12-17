import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app/app.component'; // קומפוננטת הבסיס, מכילה את <router-outlet>
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';


bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(RouterModule.forRoot(routes)) ,
    provideHttpClient(), provideAnimationsAsync(),
    
    // הגדרת הנתיבים
  ],
})
  .catch((err) => console.error(err));
