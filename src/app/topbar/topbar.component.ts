import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {CommonModule} from '@angular/common';
import {MatMenuModule} from '@angular/material/menu';
import {userSignal} from '../../main';
import {CurrentUserService} from '../current-user.service';
import {AuthApiService} from '../auth.api.service';
import {Router, RouterModule} from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, CommonModule, RouterModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  user = userSignal;

  constructor(
    private currentUserService: CurrentUserService,
    private authApiService: AuthApiService,
    private router: Router,
  ) {}

  logout() {
    this.authApiService.removeAccessToken();
    this.currentUserService.removeUser();
    this.router.navigate(['login']);
  }
}
