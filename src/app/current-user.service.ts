import { Injectable, signal, WritableSignal } from '@angular/core';
import { UserDto, UserService } from './openapi';
import { userSignal } from '../main';


@Injectable({
  providedIn: 'root',
})
export class CurrentUserService {

  user = userSignal;

  constructor(private userService: UserService) {}

  setUser() {
    this.userService.userControllerFind().subscribe({
      next: (user) => this.user.set(user)
    })
  }

  removeUser() {
    this.user.set(undefined);
  }

}
