import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {userSignal} from '../../../../main';
import {UpdateUserDto, UserService} from '../../../openapi';
import {UserForm} from '../user-form/user-form';
import {Snackbar} from '../../../core/snackbar/snackbar';

@Component({
  selector: 'app-user-profile',
  imports: [UserForm],
  templateUrl: './user-profile.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './user-profile.scss',
})
export class UserProfile {
  readonly user = userSignal;
  readonly userService = inject(UserService);
  readonly snackBar = inject(Snackbar);

  update(dto: UpdateUserDto): void {
    this.userService.userControllerUpdate(dto).subscribe({
      next: () => {
        const currentUser = this.user();
        if (currentUser) {
          userSignal.set({
            ...currentUser,
            email: dto.email ?? currentUser.email,
            firstName: dto.firstName ?? currentUser.firstName,
            name: dto.name ?? currentUser.name,
          });
        }
        this.snackBar.saved();
      },
      error: (error: {error?: {message?: string}}) => {
        this.snackBar.error(error.error?.message);
      },
    });
  }
}
