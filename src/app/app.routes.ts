import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { VerifyEmailComponent } from './auth/verify-email/verify-email.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MyTreesComponent } from './my-trees/my-trees.component';
import { LandsComponent } from './lands/lands.component';
import { AdminUsersComponent } from './dashboard/admin-users/admin-users.component';
import { AdminLandsComponent } from './dashboard/admin-lands/admin-lands.component';
import { AdminTreeSpeciesComponent } from './dashboard/admin-tree-species/admin-tree-species.component';

import { authGuard } from './auth.guard';
import { adminGuard } from './admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'profile', loadComponent: () => import('./dashboard/profile/profile.component').then(c => c.ProfileComponent), canActivate: [authGuard] },
  { path: 'my-trees', component: MyTreesComponent, canActivate: [authGuard] },
  { path: 'lands', component: LandsComponent, canActivate: [authGuard] },
  { path: 'lands/:id', loadComponent: () => import('./lands/land-detail/land-detail.component').then(c => c.LandDetailComponent), canActivate: [authGuard] },
  { path: 'tree-species', loadComponent: () => import('./tree-species/tree-species.component').then(c => c.TreeSpeciesComponent), canActivate: [authGuard] },
  { path: 'tree-species/:id', loadComponent: () => import('./tree-species/tree-species-detail/tree-species-detail.component').then(c => c.TreeSpeciesDetailComponent), canActivate: [authGuard] },
  { path: 'admin/users', component: AdminUsersComponent, canActivate: [authGuard, adminGuard] },
  { path: 'admin/lands', component: AdminLandsComponent, canActivate: [authGuard, adminGuard] },
  { path: 'admin/tree-species', component: AdminTreeSpeciesComponent, canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: '' }
];
