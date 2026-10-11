import { Component, ChangeDetectionStrategy } from '@angular/core';
import {UsersList} from '../users-list/users-list';
import {UserProfile} from '../user-profile/user-profile';

@Component({
  selector: 'app-users-dashboard',
  imports: [
    UsersList,
    UserProfile
  ],
  templateUrl: './users-dashboard.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './users-dashboard.scss',
})
export class UsersDashboard {

}
