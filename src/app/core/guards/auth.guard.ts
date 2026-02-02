import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

/**
 * Autentifikazio guardak
 * Babestutako orrialdetara sarbidea kontrolatzen du
 * Tokena egiaztatu eta erabiltzailea autentifikatuta dagoen konprobatzen du
 */
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Lehenik tokena lokalean dagoen egiaztatu
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // Ondoren tokena backend-ean baliozkoa den egiaztatu
  return authService.verifyToken().pipe(
    map((isValid) => {
      if (!isValid) {
        router.navigate(['/login']);
        return false;
      }
      return true;
    }),
  );
};
