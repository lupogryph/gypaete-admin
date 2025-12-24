import {Component, signal} from '@angular/core';
import {ReactiveFormsModule,} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {AuthService} from '../openapi';
import {CurrentUserService} from '../core/user/current-user.service';
import {userSignal} from '../../main';
import {email, Field, form, required} from '@angular/forms/signals';
import {JwtService} from '../core/auth/jwt.service';

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
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
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
    private jwtService: JwtService,
    private currentUserService: CurrentUserService,
  ) {}

  connect(event: Event) {
    event.preventDefault();
    if (this.loginForm().valid()) {
      const login = this.loginModel();
      this.authService.authControllerLogin(login.email, login.password).subscribe({
        next: (token) => {
          this.jwtService.setToken(token.access_token);
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
