import {Component, ChangeDetectionStrategy, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {MatMenuModule} from '@angular/material/menu';
import {userSignal} from '../../main';
import {CurrentUserService} from '../core/user/current-user.service';
import {Router, RouterModule} from '@angular/router';
import {JwtService} from '../core/auth/jwt.service';

const routeList = [
  {id: 'chalet', label: 'Chalet', icon: 'cabin'},
  {id: 'chambres', label: 'Chambres', icon: 'bedroom_parent'},
  {id: 'infos', label: 'Infos', icon: 'info'},
  {id: 'users', label: 'Utilisateurs', icon: 'group'},
] as const;

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, CommonModule, RouterModule, NgOptimizedImage],
  templateUrl: './topbar.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './topbar.scss',
})
export class Topbar {
  private readonly currentUserService = inject(CurrentUserService);
  private readonly jwtService = inject(JwtService);
  private readonly router = inject(Router);

  user = userSignal;
  readonly routeList = routeList;

  logout() {
    this.jwtService.clearToken();
    this.currentUserService.removeUser();
    this.router.navigate(['login']);
  }
}
