import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideCheckNoChangesConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { provideRouterFeature } from '@flight-demo/shared/state';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { APP_ROUTES } from './app.routes';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection(),
    /* provideCheckNoChangesConfig({
      exhaustive: true,
      interval: 2_000
    }), */
    provideRouter(APP_ROUTES,
      withComponentInputBinding(),
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
        defaultQueryParamsHandling: 'merge'
      }),
    ),
    provideHttpClient(),
    provideStore(),
    provideEffects(),
    provideRouterFeature(),
    provideStoreDevtools(),
  ]
};
