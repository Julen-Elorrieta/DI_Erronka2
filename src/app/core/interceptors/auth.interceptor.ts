import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor-a HTTP eskaera guztiei autentifikazio tokena gehitzeko
 * Bide publikoak kanpoan uzten ditu, hala nola login edo assets
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Autentifikaziorik behar ez duten bideak
  const publicRoutes = ['/login', '/assets', '/i18n'];
  const isPublicRoute = publicRoutes.some(route => req.url.includes(route));

  if (isPublicRoute) {
    return next(req);
  }

  const currentUser = authService.currentUser();
  
  if (currentUser) {
    // TODO: Benetako tokena lortzea AuthService-tik inplementatu
    // Oraingoz, username-a gehitzen dugu identifikatzaile gisa
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
