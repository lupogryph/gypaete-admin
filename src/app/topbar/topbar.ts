import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {CommonModule} from '@angular/common';
import {MatMenuModule} from '@angular/material/menu';
import {userSignal} from '../../main';
import {CurrentUserService} from '../core/user/current-user.service';
import {Router, RouterModule} from '@angular/router';
import {JwtService} from '../core/auth/jwt.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, CommonModule, RouterModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {
  user = userSignal;

  constructor(
    private currentUserService: CurrentUserService,
    private jwtService: JwtService,
    private router: Router,
  ) {}

  logout() {
    this.jwtService.clearToken();
    this.currentUserService.removeUser();
    this.router.navigate(['login']);
  }
}
