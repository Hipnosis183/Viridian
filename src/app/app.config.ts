// Import Angular elements.
import { APP_INITIALIZER, ApplicationConfig, Injector, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

// Setup app routing.
import { provideRouter } from '@angular/router';
import { routes } from '@app/app.routes';

// Setup translate service.
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
};

// Define app configuration.
export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }).providers!,
    {
      deps: [TranslateService, Injector],
      provide: APP_INITIALIZER, multi: true,
      useFactory: (translate: TranslateService) => {
        return () => {
          translate.addLangs(['en']);
          translate.setDefaultLang('en');
          return translate.use('en').toPromise();
        };
      },
    },
  ],
};