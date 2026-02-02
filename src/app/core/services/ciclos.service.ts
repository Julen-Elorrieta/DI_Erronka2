import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUtil } from '../utils/api.util';

/**
 * Zikloaren interfazea
 * Heziketa zikloen datuak definitzen ditu
 */
export interface Ciclo {
  id: number;
  nombre: string;  // Zikloaren izena
}

/**
 * Zikloen zerbitzua
 * Heziketa zikloen CRUD eragiketak kudeatzen ditu
 */
@Injectable({
  providedIn: 'root',
})
export class CiclosService {
  constructor(private http: HttpClient) {}

  /** Ziklo guztiak eskuratzen ditu */
  getAllCiclos(): Observable<Ciclo[]> {
    return this.http.get<Ciclo[]>(ApiUtil.buildUrl('/ciclos'));
  }

  /** Ziklo berri bat sortzen du */
  createCiclo(ciclo: Ciclo): Observable<any> {
    return this.http.post(ApiUtil.buildUrl('/ciclos'), ciclo);
  }

  /** Ziklo bat eguneratzen du */
  updateCiclo(id: number, ciclo: Ciclo): Observable<any> {
    return this.http.put(ApiUtil.buildUrl(`/ciclos/${id}`), ciclo);
  }

  /** Ziklo bat ezabatzen du */
  deleteCiclo(id: number): Observable<any> {
    return this.http.delete(ApiUtil.buildUrl(`/ciclos/${id}`));
  }
}
