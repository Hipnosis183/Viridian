// Import Angular elements.
import { bootstrapApplication } from '@angular/platform-browser';

// Import app component.
import { AppComponent } from '@app/app.component';

// Import app configuration.
import { appConfig } from '@app/app.config';

// Initialize Angular app.
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => { console.error(err); });