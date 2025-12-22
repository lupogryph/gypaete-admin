import {Component, signal} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService, Configuration, UserService } from '../openapi';
import { AuthApiService } from '../auth.api.service';
import { CurrentUserService } from '../current-user.service';
import { userSignal } from '../../main';
import {email, Field, form, required, schema, submit} from '@angular/forms/signals';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    Field,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  userSignal = userSignal;

  loginModel = signal({
    email: '',
    password: '',
  })

  loginForm = form(this.loginModel, (sp) => {
    required(sp.email, {message: 'Email requis'});
    email(sp.email, {message: 'Le login doit être une adresse mail'});
    required(sp.password, {message: 'Le mot de passe ne peut pas être vide'});
  });

  constructor(
    private _snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService,
    private authApiService: AuthApiService,
    private currentUserService: CurrentUserService,
  ) {}

  connect(event: Event) {
    event.preventDefault();
    if (this.loginForm().valid()) {
      const login = this.loginModel();
      this.authService.authControllerLogin(login.email, login.password).subscribe({
        next: (token) => {
          this.authApiService.setAccessToken(token.access_token);
          this.currentUserService.setUser();
          this.router.navigate(['']);
        },
        error: (error) => {
          this._snackBar.open(`Echec de la connection : ${error.error.message}`, 'Fermer', {
            duration: 10000,
            panelClass: ['red-snackbar'],
          });
        },
      })
    } else {
      this._snackBar.open('Identifiant invalide', 'Fermer', {
        duration: 5000,
        panelClass: ['red-snackbar']
      });
    }
  }
}
