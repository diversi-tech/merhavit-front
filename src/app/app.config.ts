import {
  ApplicationConfig,
} from '@angular/core'; // הוספת importProvidersFrom
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';

// export const appConfig: ApplicationConfig = {
//   providers: [provideRouter(routes), provideClientHydration()],
// };
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideAnimations()],
};