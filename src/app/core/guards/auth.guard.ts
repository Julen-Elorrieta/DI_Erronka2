import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Autentifikazioa behar duten bideak babesteko guardarra
 * /login-era birbideratzen du erabiltzailea autentifikatu gabe badago
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  console.warn('[BABESA] AuthGuard: Erabiltzailea autentifikatu gabe, login-era birbideratzen');
  return router.createUrlTree(['/login']);
};

/**
 * Login-era sarbidea ekiditeko guardarra erabiltzailea jada autentifikatuta badago
 * /dashboard-era birbideratzen du erabiltzaileak saioa irekita badu
 */
export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  console.warn('[BABESA] NoAuthGuard: Erabiltzailea jada autentifikatuta, dashboard-era birbideratzen');
  return router.createUrlTree(['/dashboard']);
};
