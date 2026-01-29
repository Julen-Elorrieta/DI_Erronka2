import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const loginGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si no hay token, permitir acceso al login
  if (!authService.isLoggedIn()) {
    return true;
  }

  // Si hay token, verificar que sea válido
  return authService.verifyToken().pipe(
    map((isValid) => {
      if (isValid) {
        // Token válido, redirigir al dashboard
        router.navigate(['/dashboard']);
        return false;
      }
      // Token inválido, permitir acceso al login
      return true;
    }),
  );
};
