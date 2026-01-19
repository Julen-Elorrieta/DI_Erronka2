import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { LayoutComponent } from './shared/components/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { UsersComponent } from './features/users/users.component';
import { MeetingsComponent } from './features/meetings/meetings.component';
import { ScheduleComponent } from './features/schedule/schedule.component';
import { ProfileComponent } from './features/profile/profile.component';
import { authGuardGuard } from './core/guards/auth-guard-guard';
import { UserRole } from './core/models/user.model';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuardGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
