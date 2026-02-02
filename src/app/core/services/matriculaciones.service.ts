import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUtil } from '../utils/api.util';

/**
 * Matrikulazioaren interfazea
 * Ikasle baten matrikulazio datuak definitzen ditu
 */
export interface Matriculacion {
  id: number;
  alum_id: number;          // Ikaslearen IDa
  ciclo_id: number;         // Zikloaren IDa
  curso: number;            // Kurtsoa (1 edo 2)
  fecha: Date;              // Matrikulazio data
  alumno_nombre?: string;   // Ikaslearen izena
  apellidos?: string;       // Abizenak
  ciclo_nombre?: string;    // Zikloaren izena
}

/**
 * Matrikulazioen zerbitzua
 * Matrikulazioen CRUD eragiketak kudeatzen ditu
 */
@Injectable({
  providedIn: 'root',
})
export class MatriculacionesService {
  constructor(private http: HttpClient) {}

  /** Matrikulazio guztiak eskuratzen ditu */
  getAllMatriculaciones(): Observable<Matriculacion[]> {
    return this.http.get<Matriculacion[]>(ApiUtil.buildUrl('/matriculaciones'));
  }

  /** Matrikulazio berri bat sortzen du */
  createMatriculacion(matriculacion: Matriculacion): Observable<any> {
    return this.http.post(ApiUtil.buildUrl('/matriculaciones'), matriculacion);
  }

  /** Matrikulazio bat eguneratzen du */
  updateMatriculacion(id: number, matriculacion: Matriculacion): Observable<any> {
    return this.http.put(ApiUtil.buildUrl(`/matriculaciones/${id}`), matriculacion);
  }

  /** Matrikulazio bat ezabatzen du */
  deleteMatriculacion(id: number): Observable<any> {
    return this.http.delete(ApiUtil.buildUrl(`/matriculaciones/${id}`));
  }
}
