import { Routes } from '@angular/router';
import { Auth } from './pages/auth/auth';
import { Dashboard } from './pages/dashboard/dashboard';
import { Users } from './pages/users/users';
import { Meetings } from './pages/meetings/meetings';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: Auth },
    { path: 'dashboard', component: Dashboard},
    { path: 'users', component: Users},
    { path: 'meetings', component: Meetings }
];
