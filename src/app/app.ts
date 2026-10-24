import {Component, ChangeDetectionStrategy, inject} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {AuthService} from './openapi';
import {Topbar} from './topbar/topbar';
import {CurrentUserService} from './core/user/current-user.service';
import {JwtService} from './core/auth/jwt.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Topbar],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly jwtService = inject(JwtService);
  private readonly currentUserService = inject(CurrentUserService);

  ngOnInit() {
    if (!this.jwtService.isAuthenticated()) {
      this.router.navigate(['login']);
    } else {
      this.auth.authControllerProfile().subscribe({
        next: () => this.currentUserService.setUser(),
        error: () => {
          this.jwtService.clearToken();
          this.router.navigate(['login']);
        },
      });
    }
  }
}
