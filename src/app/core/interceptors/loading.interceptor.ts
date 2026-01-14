import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';

/**
 * HTTP eskaeretan karga adierazlea erakusteko interceptorra
 * Spinner-ak edo aurrerapen adierazleak erakusteko erabilgarria
 */
let activeRequests = 0;

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  activeRequests++;
  
  // TODO: Karga spinner-a erakusteko gertaera igorri
  if (activeRequests === 1) {
    console.log('[INFO] Kargatzen...');
  }

  return next(req).pipe(
    finalize(() => {
      activeRequests--;
      
      if (activeRequests === 0) {
        console.log('[ONDO] Karga osatuta');
        // TODO: Karga spinner-a ezkutatzeko gertaera igorri
      }
    })
  );
};
