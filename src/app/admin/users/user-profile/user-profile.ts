import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {userSignal} from '../../../../main';
import {UpdateUserDto, UserService} from '../../../openapi';
import {UserForm} from '../user-form/user-form';

@Component({
  selector: 'app-user-profile',
  imports: [UserForm],
  templateUrl: './user-profile.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './user-profile.scss',
})
export class UserProfile {
  readonly user = userSignal;

  constructor(
    private readonly userService: UserService,
    private readonly snackBar: MatSnackBar,
  ) {}

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
        this.snackBar.open('Sauvegardé', 'Fermer', {duration: 5000});
      },
      error: (error: {error?: {message?: string}}) => {
        this.snackBar.open(
          `Échec : ${error.error?.message ?? 'Une erreur est survenue'}`,
          'Fermer',
          {duration: 10000, panelClass: ['red-snackbar']},
        );
      },
    });
  }
}
