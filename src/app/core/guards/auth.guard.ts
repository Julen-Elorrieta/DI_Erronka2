import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para proteger rutas que requieren autenticación
 * Redirige a /login si el usuario no está autenticado
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  console.warn('🔒 AuthGuard: Usuario no autenticado, redirigiendo a login');
  return router.createUrlTree(['/login']);
};

/**
 * Guard para prevenir acceso a login si ya está autenticado
 * Redirige a /dashboard si el usuario ya tiene sesión activa
 */
export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  console.warn('🔒 NoAuthGuard: Usuario ya autenticado, redirigiendo a dashboard');
  return router.createUrlTree(['/dashboard']);
};
