import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';

/**
 * Interceptor para mostrar indicador de carga durante peticiones HTTP
 * Útil para mostrar spinners o indicadores de progreso
 */
let activeRequests = 0;

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  activeRequests++;
  
  // TODO: Emitir evento para mostrar loading spinner
  if (activeRequests === 1) {
    console.log('🔄 Cargando...');
  }

  return next(req).pipe(
    finalize(() => {
      activeRequests--;
      
      if (activeRequests === 0) {
        console.log('✅ Carga completada');
        // TODO: Emitir evento para ocultar loading spinner
      }
    })
  );
};
