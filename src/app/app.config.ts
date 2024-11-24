import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core'; // הוספת importProvidersFrom
import { provideRouter } from '@angular/router';
import { FormsModule } from '@angular/forms'; // הוספת FormsModule
import { provideClientHydration } from '@angular/platform-browser';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers:[provideRouter(routes),provideClientHydration()]
    /*provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    importProvidersFrom(FormsModule), // הוספת FormsModule כאן
  */,
};
