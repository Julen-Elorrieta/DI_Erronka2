import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUtil } from '../utils/api.util';

/**
 * Moduluaren interfazea
 * Ikasgai/modulu baten datuak definitzen ditu
 */
export interface Modulo {
  id: number;
  nombre: string;        // Izena gaztelaniaz
  nombre_eus: string;    // Izena euskaraz
  horas: number;         // Ordu kopurua
  ciclo_id: number;      // Zikloaren IDa
  ciclo_nombre?: string; // Zikloaren izena (aukerakoa)
  curso: number;         // Kurtsoa (1 edo 2)
}

/**
 * Moduluen zerbitzua
 * Moduluen CRUD eragiketak kudeatzen ditu
 */
@Injectable({
  providedIn: 'root',
})
export class ModulosService {
  constructor(private http: HttpClient) {}

  /** Modulu guztiak eskuratzen ditu */
  getAllModulos(): Observable<Modulo[]> {
    return this.http.get<Modulo[]>(ApiUtil.buildUrl('/modulos'));
  }

  /** Modulu berri bat sortzen du */
  createModulo(modulo: Modulo): Observable<any> {
    return this.http.post(ApiUtil.buildUrl('/modulos'), modulo);
  }

  /** Modulu bat eguneratzen du */
  updateModulo(id: number, modulo: Modulo): Observable<any> {
    return this.http.put(ApiUtil.buildUrl(`/modulos/${id}`), modulo);
  }

  /** Modulu bat ezabatzen du */
  deleteModulo(id: number): Observable<any> {
    return this.http.delete(ApiUtil.buildUrl(`/modulos/${id}`));
  }
}
