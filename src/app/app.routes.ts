import {Routes} from '@angular/router';
import {Login} from './login/login';
import {ChaletDashboard} from './cms/chalet/chalet-dashboard/chalet-dashboard';
import {UsersDashboard} from './admin/users/users-dashboard/users-dashboard';
import {UserProfile} from './admin/users/user-profile/user-profile';
import {ChambresDashboard} from './cms/chambres/chambres-dashboard/chambres-dashboard';
import {LitStore} from './cms/mobilier/lit/lit-store/lit-store';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'profile', component: UserProfile },
  { path: 'chalet', component: ChaletDashboard },
  { path: 'chambres', component: ChambresDashboard },
  { path: 'users', component: UsersDashboard },
  { path: 'lits', component: LitStore },
  { path: '', redirectTo: 'chalet', pathMatch: 'full' },
];
