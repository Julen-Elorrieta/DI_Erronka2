import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

/**
 * Autentifikazio interceptor-a
 * HTTP eskaeretara Authorization header-a gehitzen du
 * 401 erroreak kudeatzen ditu eta saioa ixten du
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Tokena badago eta EZ bada login eskaera, Authorization header-a gehitu
  if (token && !req.url.includes('/login')) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error) => {
      // Tokena baliogabea edo iraungitua bada (401), saioa itxi eta birbideratu
      if (error.status === 401 && !req.url.includes('/login')) {
        console.log('Tokena baliogabea edo iraungitua, saioa ixten...');
        authService.logout(router);
      }
      return throwError(() => error);
    }),
  );
};
