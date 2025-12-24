import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { Configuration } from './openapi/configuration';

import localeFr from '@angular/common/locales/fr';
import { registerLocaleData } from '@angular/common';
import {JwtService} from './core/auth/jwt.service';
registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    {
      provide: Configuration,
      useFactory: (jwt: JwtService) =>
        new Configuration({
          basePath: environment.apiUrl,
          credentials: { bearer: jwt.getToken.bind(jwt) }
        }),
      deps: [JwtService],
      multi: false,
    },
  ],
};
