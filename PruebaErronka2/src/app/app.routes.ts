import { Routes } from '@angular/router';
import { Auth } from './pages/auth/auth';
import { Dashboard } from './pages/dashboard/dashboard';
import { Users } from './pages/users/users';
import { Meetings } from './pages/meetings/meetings';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { 
        path: 'login', 
        component: Auth,
        canActivate: [loginGuard] // Si ya está logueado, redirige al dashboard
    },
    { 
        path: 'dashboard', 
        component: Dashboard,
        canActivate: [authGuard] // Solo accesible si está autenticado
    },
    { 
        path: 'users', 
        component: Users,
        canActivate: [authGuard] // Solo accesible si está autenticado
    },
    { 
        path: 'meetings', 
        component: Meetings,
        canActivate: [authGuard] // Solo accesible si está autenticado
    },
    { path: '**', redirectTo: '/login' }
];