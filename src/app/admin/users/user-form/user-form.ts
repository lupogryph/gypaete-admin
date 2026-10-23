import {ChangeDetectionStrategy, Component, effect, input, output, signal} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {email, FormField, form, required, validate} from '@angular/forms/signals';
import {MatButton} from '@angular/material/button';
import {MatCard, MatCardActions, MatCardContent} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {MatFormField, MatInput, MatLabel, MatPrefix} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {Role, UpdateUserDto, UserDto} from '../../../openapi';

interface UserFormModel {
  email: string;
  firstName: string;
  name: string;
  role: Role;
}

@Component({
  selector: 'app-user-form',
  imports: [
    FormField,
    ReactiveFormsModule,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatPrefix,
    MatSelect,
    MatOption,
    MatButton,
  ],
  templateUrl: './user-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './user-form.scss',
})
export class UserForm {
  readonly user = input<UserDto>();
  readonly admin = input(false);
  readonly isNew = input(false);
  readonly canDelete = input(true);

  readonly save = output<UpdateUserDto>();
  readonly delete = output<void>();

  readonly userModel = signal<UserFormModel>({
    email: '',
    firstName: '',
    name: '',
    role: Role.User,
  });

  readonly passwordModel = signal({password: '', repassword: ''});

  readonly userForm = form(this.userModel, (fields) => {
    required(fields.email, {message: 'Email requis'});
    email(fields.email, {message: 'Doit être une adresse mail valide'});
  });

  readonly passwordForm = form(this.passwordModel, (fields) => {
    required(fields.password, {message: 'Mot de passe requis'});
    required(fields.repassword, {message: 'Merci de confirmer le mot de passe'});
    validate(fields.repassword, ({value, valueOf}) =>
      value() === valueOf(fields.password)
        ? null
        : {kind: 'passwordMismatch', message: 'Les mots de passe ne correspondent pas'},
    );
  });

  constructor() {
    effect(() => {
      const user = this.user();
      this.userModel.set({
        email: user?.email ?? '',
        firstName: user?.firstName ?? '',
        name: user?.name ?? '',
        role: user?.role ?? Role.User,
      });
      this.passwordModel.set({password: '', repassword: ''});
    });
  }

  valid(): boolean {
    const passwordRequired = this.isNew();
    const passwordValid = passwordRequired
      ? this.passwordForm().valid()
      : !this.passwordForm().dirty() || this.passwordForm().valid();
    return this.userForm().valid() && passwordValid;
  }

  saveForm(event: Event): void {
    event.preventDefault();
    if (!this.valid()) {
      return;
    }

    const model = this.userModel();
    const dto: UpdateUserDto = {
      email: model.email,
      firstName: model.firstName,
      name: model.name,
    };
    if (this.admin()) {
      dto.role = model.role;
    }
    const password = this.passwordModel().password;
    if (password) {
      dto.password = password;
    }
    this.save.emit(dto);
  }
}
