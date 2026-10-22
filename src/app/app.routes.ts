import {Routes} from '@angular/router';
import {Login} from './login/login';
import {ChaletDashboard} from './chalet/chalet-dashboard/./chalet-dashboard';
import {Chambres} from './chambres/chambres';
import {UsersDashboard} from './users/users-dashboard/users-dashboard';
import {UserProfile} from './users/user-profile/user-profile';
import {Dashboard} from './dashboard/dashboard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'profile', component: UserProfile },
  { path: 'chalet', component: ChaletDashboard },
  { path: 'chambres', component: Chambres },
  { path: 'users', component: UsersDashboard },
  { path: 'dashboard', component: Dashboard },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
