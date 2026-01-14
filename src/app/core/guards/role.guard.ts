import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/**
 * Roletan oinarritutako sarbide kontrolerako guardarra
 * Erabiltzaileak bideari sartzeko beharrezko roletako bat duela egiaztatzen du
 * 
 * Bideetan erabiltzeko:
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
    console.warn('[ABISUA] RoleGuard: Ez dira beharrezko rolak zehaztu');
    return true;
  }

  const currentUser = authService.currentUser();
  
  if (!currentUser) {
    console.warn('[BABESA] RoleGuard: Erabiltzailea autentifikatu gabe');
    return router.createUrlTree(['/login']);
  }

  const hasPermission = requiredRoles.includes(currentUser.role);

  if (hasPermission) {
    return true;
  }

  console.warn(
    `[BABESA] RoleGuard: Sarbidea ukatuta. ${currentUser.username} (${currentUser.role}) ` +
    `erabiltzaileak honako rolak behar dituen bidera sartu nahi izan du: ${requiredRoles.join(', ')}`
  );

  // Sarbide ukatua orrira edo dashboard-era birbideratu
  return router.createUrlTree(['/dashboard']);
};
