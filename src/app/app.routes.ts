/**
 * Aplikazioaren bideratze konfigurazioa
 * Orrialde guztien routak eta guardak definitzen ditu
 */
import { Routes } from '@angular/router';
import { Auth } from './pages/auth/auth';
import { Dashboard } from './pages/dashboard/dashboard';
import { Users } from './pages/users/users';
import { Meetings } from './pages/meetings/meetings';
import { ProfileComponent } from './pages/profile/profile';
import { CiclosComponent } from './pages/klaseak/klaseak';
import { ModulosComponent } from './pages/moduloak/moduloak';
import { HorariosComponent } from './pages/ordutegia/ordutegia';
import { MatriculacionesComponent } from './pages/matrikulazioak/matrikulazioak';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';

/**
 * Aplikazioaren bide guztiak
 * - login: Autentifikazio orrialdea (loginGuard-ekin)
 * - dashboard: Hasiera orrialdea (authGuard-ekin)
 * - profile: Erabiltzailearen profila
 * - users: Erabiltzaileen kudeaketa
 * - meetings: Bileren kudeaketa
 * - ciclos: Zikloen kudeaketa
 * - modulos: Moduluen kudeaketa
 * - horarios: Ordutegien kudeaketa
 * - matriculaciones: Matrikulazioen kudeaketa
 */
export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    component: Auth,
    canActivate: [loginGuard],
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
  },
  {
    path: 'users',
    component: Users,
    canActivate: [authGuard],
  },
  {
    path: 'meetings',
    component: Meetings,
    canActivate: [authGuard],
  },
  {
    path: 'ciclos',
    component: CiclosComponent,
    canActivate: [authGuard],
  },
  {
    path: 'modulos',
    component: ModulosComponent,
    canActivate: [authGuard],
  },
  {
    path: 'horarios',
    component: HorariosComponent,
    canActivate: [authGuard],
  },
  {
    path: 'matriculaciones',
    component: MatriculacionesComponent,
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '/login' },
];
