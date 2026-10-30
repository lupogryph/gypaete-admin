import {inject, Injectable} from '@angular/core';
import {UserService} from '../../openapi';
import {userSignal} from '../../../main';


@Injectable({
  providedIn: 'root',
})
export class CurrentUserService {
  private readonly userService = inject(UserService);

  setUser() {
    this.userService.userControllerFind().subscribe({
      next: (user) => userSignal.set(user)
    })
  }

  removeUser() {
    userSignal.set(undefined);
  }

}
