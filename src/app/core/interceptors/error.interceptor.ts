import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * HTTP erroreak zentralizatuki kudeatzeko interceptorra
 * Errore erantzun arruntak kudeatzen ditu (401, 403, 500, etab.)
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Errore ezezaguna gertatu da';

      if (error.error instanceof ErrorEvent) {
        // Bezero aldeko errorea
        errorMessage = `Errorea: ${error.error.message}`;
        console.error('[ERROREA] Bezeroaren errorea:', error.error.message);
      } else {
        // Zerbitzari aldeko errorea
        switch (error.status) {
          case 0:
            errorMessage = 'Ezin izan da zerbitzarira konektatu';
            console.error('[ERROREA] Konexio errorea');
            break;
          case 400:
            errorMessage = 'Eskaera okerra';
            console.error('[ERROREA] Bad Request:', error.error);
            break;
          case 401:
            errorMessage = 'Baimenik gabe. Mesedez, hasi saioa berriro';
            console.error('[ERROREA] Baimenik gabe');
            // Login-era birbideratu
            router.navigate(['/login']);
            break;
          case 403:
            errorMessage = 'Ez daukazu ekintza hau egiteko baimenik';
            console.error('[ERROREA] Sarbidea debekatuta');
            break;
          case 404:
            errorMessage = 'Baliabidea ez da aurkitu';
            console.error('[ERROREA] Not Found:', req.url);
            break;
          case 500:
            errorMessage = 'Zerbitzariaren barne errorea';
            console.error('[ERROREA] Zerbitzari errorea:', error.error);
            break;
          default:
            errorMessage = `Errorea: ${error.status} - ${error.message}`;
            console.error('[ERROREA] HTTP errorea:', error);
        }
      }

      // TODO: Erabiltzaileari errorea erakutsi jakinarazpen/toast bidez
      // Hemen jakinarazpen zerbitzu bat integratu liteke

      return throwError(() => new Error(errorMessage));
    })
  );
};
