import {Routes} from '@angular/router';
import {Login} from './login/login';
import {UsersDashboard} from './users/users-dashboard/users-dashboard';
import {UserProfile} from './users/user-profile/user-profile';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'profile', component: UserProfile },
  { path: 'users', component: UsersDashboard },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
