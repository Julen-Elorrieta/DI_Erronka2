import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/**
 * Guard para control de acceso basado en roles
 * Verifica que el usuario tenga uno de los roles permitidos para acceder a la ruta
 * 
 * Uso en rutas:
 * {
 *   path: 'users',
 *   component: UsersComponent,
 *   canActivate: [authGuard, roleGuard],
 *   data: { roles: [UserRole.GOD, UserRole.ADMIN] }
 * }
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as UserRole[];
  
  if (!requiredRoles || requiredRoles.length === 0) {
    console.warn('⚠️ RoleGuard: No se especificaron roles requeridos');
    return true;
  }

  const currentUser = authService.currentUser();
  
  if (!currentUser) {
    console.warn('🔒 RoleGuard: Usuario no autenticado');
    return router.createUrlTree(['/login']);
  }

  const hasPermission = requiredRoles.includes(currentUser.role);

  if (hasPermission) {
    return true;
  }

  console.warn(
    `🔒 RoleGuard: Acceso denegado. Usuario ${currentUser.username} (${currentUser.role}) ` +
    `intentó acceder a ruta que requiere roles: ${requiredRoles.join(', ')}`
  );

  // Redirigir a página de acceso denegado o dashboard
  return router.createUrlTree(['/dashboard']);
};
