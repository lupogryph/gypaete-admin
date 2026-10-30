import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {ReactiveFormsModule,} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {AuthService} from '../openapi';
import {CurrentUserService} from '../core/user/current-user.service';
import {email, form, FormField, required} from '@angular/forms/signals';
import {JwtService} from '../core/auth/jwt.service';
import {Snackbar} from '../core/snackbar/snackbar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormField,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './login.scss',
})
export class Login {
  private readonly snackBar = inject(Snackbar);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly jwtService = inject(JwtService);
  private readonly currentUserService = inject(CurrentUserService);

  loginModel = signal({
    email: '',
    password: '',
  })

  loginForm = form(this.loginModel, (sp) => {
    required(sp.email, {message: 'Email requis'});
    email(sp.email, {message: 'Le login doit être une adresse mail'});
    required(sp.password, {message: 'Le mot de passe ne peut pas être vide'});
  });

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
          this.snackBar.error(`Echec de la connection : ${error.error.message}`);
        },
      })
    } else {
      this.snackBar.error('Identifiant invalide');
    }
  }
}
