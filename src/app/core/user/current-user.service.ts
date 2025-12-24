import { Injectable, signal, WritableSignal } from '@angular/core';
import { UserDto, UserService } from '../../openapi';
import { userSignal } from '../../../main';


@Injectable({
  providedIn: 'root',
})
export class CurrentUserService {

  constructor(private userService: UserService) {}

  setUser() {
    this.userService.userControllerFind().subscribe({
      next: (user) => userSignal.set(user)
    })
  }

  removeUser() {
    userSignal.set(undefined);
  }

}
