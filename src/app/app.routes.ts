import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { LayoutComponent } from './shared/components/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { UsersComponent } from './features/users/users.component';
import { MeetingsComponent } from './features/meetings/meetings.component';
import { ScheduleComponent } from './features/schedule/schedule.component';
import { ProfileComponent } from './features/profile/profile.component';
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
      // Dashboard - accesible para todos los roles
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      
      // Gestión de usuarios - solo GOD y ADMIN
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [roleGuard],
        data: { roles: [UserRole.GOD, UserRole.ADMIN] }
      },
      
      // Reuniones y centros - todos los roles
      {
        path: 'meetings',
        component: MeetingsComponent
      },
      
      // Horario - profesores y estudiantes
      {
        path: 'schedule',
        component: ScheduleComponent,
        canActivate: [roleGuard],
        data: { roles: [UserRole.GOD, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT] }
      },
      
      // Perfil - todos los roles
      {
        path: 'profile',
        component: ProfileComponent
      },
      
      // Alumnos - profesores pueden ver lista de alumnos
      {
        path: 'students',
        component: UsersComponent,
        canActivate: [roleGuard],
        data: { 
          roles: [UserRole.GOD, UserRole.ADMIN, UserRole.TEACHER],
          defaultFilter: UserRole.STUDENT
        }
      }
    ]
  },
  
  // Ruta 404 - redirige a login
  { path: '**', redirectTo: 'login' }
];
