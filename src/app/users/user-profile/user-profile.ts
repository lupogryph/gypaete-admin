import {Component, effect, input, signal} from '@angular/core';
import {Role, UpdateUserDto, UserDto, UserService} from '../../openapi';
import {email, Field, form, required, validate} from '@angular/forms/signals';
import {ReactiveFormsModule} from '@angular/forms';
import {MatCard, MatCardActions, MatCardContent} from '@angular/material/card';
import {MatFormField, MatInput, MatLabel, MatPrefix} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatButton} from '@angular/material/button';
import {userSignal} from '../../../main';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FilterEmptyPipe} from '../../shared/pipes/filter-empty.pipe';

@Component({
  selector: 'app-user-profile',
  imports: [
    ReactiveFormsModule,
    MatCard,
    MatCardContent,
    MatFormField,
    MatIcon,
    MatLabel,
    MatSelect,
    MatOption,
    MatInput,
    Field,
    MatCardActions,
    MatButton,
    MatPrefix
  ],
  providers: [FilterEmptyPipe],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile {
  profile = input<UserDto>();

  userModel = signal({
    email: '',
    firstName: '',
    name: '',
    role: Role.User
  });

  passwordModel = signal({
    password: '',
    repassword: '',
  })

  userForm = form(this.userModel, (sp) => {
    required(sp.email, {message: 'Email requis'});
    email(sp.email, {message: 'Doit être une adresse mail valide'});
  });

  passwordForm = form(this.passwordModel, (sp) => {
    required(sp.password, {message: 'Mot de passe requis'});
    required(sp.repassword, {message: 'Merci de confirmer le mot de passe'});
    validate(sp.repassword, ({value, valueOf}) => {
      const repassword = value();
      const password = valueOf(sp.password)
      if (repassword !== password) {
        return {
          kind: 'passwordMismatch',
          message: 'Les mots de passe ne correspondent pas'
        }
      }
      return null;
    })
  })

  constructor(
    private _snackBar: MatSnackBar,
    private userService: UserService,
    private filterEmptyPipe: FilterEmptyPipe,
  ) {
    effect(() => {
      const profile = this.profile();
      const user = userSignal();
      if (profile === undefined) {
        if (!user) {
          return;
        } else {
          this.userModel.set(this.filterEmptyPipe.transform(user));
        }
      } else {
        this.userModel.set(this.filterEmptyPipe.transform(profile));
      }
    });
  }

  passwordValid() : boolean {
    return this.passwordForm().dirty() ? this.passwordForm().valid() : true;
  }

  valid(): boolean {
    return this.userForm().valid() && this.passwordValid();
  }

  save(event: Event) {
    event.preventDefault();
    const dto: UpdateUserDto = {...this.userModel()};
    if (this.passwordForm().dirty()) {
      dto.password = this.passwordModel().password;
    }
    if (this.valid()) {
      this.userService.userControllerUpdate(dto).subscribe({
        next: () => {
          this._snackBar.open(`Sauvegardé`, 'Fermer', {
            duration: 10000,
          });
        },
        error: (error) => {
          this._snackBar.open(`Echec : ${error.error.message}`, 'Fermer', {
            duration: 10000,
            panelClass: ['red-snackbar'],
          });
        }
      });
    }
  }

}
