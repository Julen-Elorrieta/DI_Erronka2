import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor para manejo centralizado de errores HTTP
 * Gestiona respuestas de error comunes (401, 403, 500, etc.)
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error desconocido';

      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error: ${error.error.message}`;
        console.error('❌ Error del cliente:', error.error.message);
      } else {
        // Error del lado del servidor
        switch (error.status) {
          case 0:
            errorMessage = 'No se pudo conectar con el servidor';
            console.error('❌ Error de conexión');
            break;
          case 400:
            errorMessage = 'Solicitud incorrecta';
            console.error('❌ Bad Request:', error.error);
            break;
          case 401:
            errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente';
            console.error('❌ No autorizado');
            // Redirigir a login
            router.navigate(['/login']);
            break;
          case 403:
            errorMessage = 'No tienes permisos para realizar esta acción';
            console.error('❌ Acceso prohibido');
            break;
          case 404:
            errorMessage = 'Recurso no encontrado';
            console.error('❌ Not Found:', req.url);
            break;
          case 500:
            errorMessage = 'Error interno del servidor';
            console.error('❌ Error del servidor:', error.error);
            break;
          default:
            errorMessage = `Error: ${error.status} - ${error.message}`;
            console.error('❌ Error HTTP:', error);
        }
      }

      // TODO: Mostrar notificación/toast al usuario con el error
      // Aquí se podría integrar un servicio de notificaciones

      return throwError(() => new Error(errorMessage));
    })
  );
};
