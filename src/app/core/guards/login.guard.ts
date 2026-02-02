import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

/**
 * Login guardak
 * Login orrialdera sarbidea kontrolatzen du
 * Erabiltzailea jadanik autentifikatuta badago, dashboard-era birbideratzen du
 */
export const loginGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Tokenik ez badago, login-era sarbidea baimendu
  if (!authService.isLoggedIn()) {
    return true;
  }

  // Tokena badago, baliozkoa den egiaztatu
  return authService.verifyToken().pipe(
    map((isValid) => {
      if (isValid) {
        // Tokena baliozkoa, dashboard-era birbideratu
        router.navigate(['/dashboard']);
        return false;
      }
      // Tokena baliogabea, login-era sarbidea baimendu
      return true;
    }),
  );
};
