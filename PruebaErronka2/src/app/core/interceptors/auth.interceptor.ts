import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Si existe token y NO es la petición de login, añadir header Authorization
  if (token && !req.url.includes('/login')) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error) => {
      // Si el token es inválido o expiró (401), cerrar sesión y redirigir
      if (error.status === 401 && !req.url.includes('/login')) {
        console.log('Token inválido o expirado, cerrando sesión...');
        authService.logout(router);
      }
      return throwError(() => error);
    })
  );
};