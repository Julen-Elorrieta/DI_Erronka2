import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor para añadir token de autenticación a todas las peticiones HTTP
 * Excluye rutas públicas como login o assets
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Rutas que no requieren autenticación
  const publicRoutes = ['/login', '/assets', '/i18n'];
  const isPublicRoute = publicRoutes.some(route => req.url.includes(route));

  if (isPublicRoute) {
    return next(req);
  }

  const currentUser = authService.currentUser();
  
  if (currentUser) {
    // TODO: Implementar obtención de token real desde AuthService
    // Por ahora, añadimos el username como identificador
    const clonedRequest = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${currentUser.username}`,
        'X-User-Role': currentUser.role
      }
    });
    
    return next(clonedRequest);
  }

  return next(req);
};
