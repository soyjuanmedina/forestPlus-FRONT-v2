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
  { path: 'profile', loadComponent: () => import( './dashboard/profile/profile.component' ).then( c => c.ProfileComponent ), canActivate: [authGuard] },
  { path: 'profile/:id', loadComponent: () => import( './dashboard/profile/profile.component' ).then( c => c.ProfileComponent ), canActivate: [authGuard, adminGuard] },
  { path: 'my-trees', component: MyTreesComponent, canActivate: [authGuard] },
  { path: 'my-trees/purchase', loadComponent: () => import( './my-trees/purchase/purchase.component' ).then( c => c.PurchaseComponent ), canActivate: [authGuard] },
  { path: 'lands', component: LandsComponent, canActivate: [authGuard] },
  { path: 'lands/:id', loadComponent: () => import( './lands/land-detail/land-detail.component' ).then( c => c.LandDetailComponent ), canActivate: [authGuard] },
  { path: 'tree-species', loadComponent: () => import( './tree-species/tree-species.component' ).then( c => c.TreeSpeciesComponent ), canActivate: [authGuard] },
  { path: 'tree-species/:id', loadComponent: () => import( './tree-species/tree-species-detail/tree-species-detail.component' ).then( c => c.TreeSpeciesDetailComponent ), canActivate: [authGuard] },
  { path: 'admin/users', component: AdminUsersComponent, canActivate: [authGuard, adminGuard] },
  { path: 'admin/lands', component: AdminLandsComponent, canActivate: [authGuard, adminGuard] },
  { path: 'admin/tree-species', component: AdminTreeSpeciesComponent, canActivate: [authGuard, adminGuard] },
  { path: 'admin/companies', loadComponent: () => import( './dashboard/admin-companies/admin-companies.component' ).then( c => c.AdminCompaniesComponent ), canActivate: [authGuard, adminGuard] },
  { path: 'admin/tree-types', loadComponent: () => import( './dashboard/admin-tree-types/admin-tree-types.component' ).then( c => c.AdminTreeTypesComponent ), canActivate: [authGuard, adminGuard] },
  { path: 'admin/planned-plantations', loadComponent: () => import( './dashboard/admin-planned-plantations/admin-planned-plantations.component' ).then( c => c.AdminPlannedPlantationsComponent ), canActivate: [authGuard, adminGuard] },
  { path: 'company', loadComponent: () => import( './dashboard/company/company.component' ).then( c => c.CompanyComponent ), canActivate: [authGuard] },
  { path: 'company/:id', loadComponent: () => import( './dashboard/company/company.component' ).then( c => c.CompanyComponent ), canActivate: [authGuard] },
  { path: 'company/form/:id', loadComponent: () => import( './dashboard/company/company-form/company-form.component' ).then( c => c.CompanyFormComponent ), canActivate: [authGuard, adminGuard] },
  { path: 'tree-type/:id', loadComponent: () => import( './dashboard/tree-type/tree-type.component' ).then( c => c.TreeTypeComponent ), canActivate: [authGuard] },
  { path: 'tree-type/form/:id', loadComponent: () => import( './dashboard/tree-type/tree-form/tree-form.component' ).then( c => c.TreeFormComponent ), canActivate: [authGuard] },
  { path: 'planned-plantation/:id', loadComponent: () => import( './dashboard/planned-plantation/planned-plantation.component' ).then( c => c.PlannedPlantationComponent ), canActivate: [authGuard] },
  { path: 'planned-plantation/form/:id', loadComponent: () => import( './dashboard/planned-plantation/planned-plantation-form/planned-plantation-form.component' ).then( c => c.PlannedPlantationFormComponent ), canActivate: [authGuard] },
  { path: 'tree/:id', loadComponent: () => import( './my-trees/tree-detail/tree-detail.component' ).then( c => c.TreeDetailComponent ), canActivate: [authGuard] },
  { path: 'tree/form/:id', loadComponent: () => import( './my-trees/tree-form/tree-form.component' ).then( c => c.TreeFormComponent ), canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
