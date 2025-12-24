import {Component} from '@angular/core';
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
  styleUrl: './app.scss',
})
export class App {

  constructor(
    private router: Router,
    private auth: AuthService,
    private jwtService: JwtService,
    private currentUserService: CurrentUserService,
  ) {}

  ngOnInit() {
    if (!this.jwtService.isAuthenticated()) {
      this.router.navigate(['login']);
    } else {
      this.auth.authControllerProfile().subscribe({
        next: () => this.currentUserService.setUser(),
        error: (error) => {
          this.jwtService.clearToken();
          this.router.navigate(['login']);
        },
      });
    }
  }
}
