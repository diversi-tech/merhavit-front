import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';
import { LoginComponent } from './app/components/Users/login';

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
