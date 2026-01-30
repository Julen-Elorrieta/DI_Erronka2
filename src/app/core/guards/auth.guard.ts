import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Primero verificar si hay token localmente
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // Luego verificar que el token sea válido en el backend
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
