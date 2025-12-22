import {bootstrapApplication} from '@angular/platform-browser';
import {appConfig} from './app/app.config';
import {AppComponent} from './app/app.component';
import {signal, WritableSignal} from '@angular/core';
import {UserDto} from './app/openapi';

export const userSignal: WritableSignal<UserDto | undefined> = signal(undefined);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
