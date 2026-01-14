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
  // Erro bidea login-era birbideratzen du
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // Login - autentifikatu GABE badago bakarrik eskuragarri
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [noAuthGuard]
  },
  
  // Babestutako bideak - autentifikazioa behar dute
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      // Dashboard - rol guztientzat eskuragarri
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      
      // Erabiltzaileen kudeaketa - GOD eta ADMIN bakarrik
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [roleGuard],
        data: { roles: [UserRole.GOD, UserRole.ADMIN] }
      },
      
      // Bilerak eta ikastetxeak - rol guztiak
      {
        path: 'meetings',
        component: MeetingsComponent
      },
      
      // Ordutegia - irakasleak eta ikasleak
      {
        path: 'schedule',
        component: ScheduleComponent,
        canActivate: [roleGuard],
        data: { roles: [UserRole.GOD, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT] }
      },
      
      // Profila - rol guztiak
      {
        path: 'profile',
        component: ProfileComponent
      },
      
      // Ikasleak - irakasleek ikasleen zerrenda ikusi dezakete
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
  
  // 404 bidea - login-era birbideratzen du
  { path: '**', redirectTo: 'login' }
];
