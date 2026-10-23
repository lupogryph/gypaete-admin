import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { Configuration } from './openapi';

import localeFr from '@angular/common/locales/fr';
import { registerLocaleData } from '@angular/common';
import {JwtService} from './core/auth/jwt.service';
import {MAT_ICON_DEFAULT_OPTIONS} from '@angular/material/icon';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withXhr()),
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
    {provide: MAT_ICON_DEFAULT_OPTIONS, useValue: {fontSet: 'material-symbols-outlined'}}
  ],
};
