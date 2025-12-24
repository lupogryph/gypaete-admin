import {bootstrapApplication} from '@angular/platform-browser';
import {appConfig} from './app/app.config';
import {App} from './app/app';
import {signal, WritableSignal} from '@angular/core';
import {UserDto} from './app/openapi';

export const userSignal: WritableSignal<UserDto | undefined> = signal(undefined);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
