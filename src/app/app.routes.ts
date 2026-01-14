import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { LayoutComponent } from './shared/components/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/user.model';

export const routes: Routes = [
  // Ruta raíz redirige a login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // Login - solo accesible si NO está autenticado
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [noAuthGuard]
  },
  
  // Rutas protegidas - requieren autenticación
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      // TODO: Lazy loading modules para mejor performance
      // {
      //   path: 'users',
      //   canActivate: [roleGuard],
      //   data: { roles: [UserRole.GOD, UserRole.ADMIN] },
      //   loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule)
      // },
      // {
      //   path: 'meetings',
      //   loadChildren: () => import('./features/meetings/meetings.module').then(m => m.MeetingsModule)
      // },
      // {
      //   path: 'schedule',
      //   canActivate: [roleGuard],
      //   data: { roles: [UserRole.TEACHER, UserRole.STUDENT] },
      //   loadChildren: () => import('./features/schedule/schedule.module').then(m => m.ScheduleModule)
      // }
    ]
  },
  
  // Ruta 404 - redirige a login
  { path: '**', redirectTo: 'login' }
];
