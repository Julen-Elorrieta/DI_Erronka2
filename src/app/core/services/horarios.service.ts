import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUtil } from '../utils/api.util';

/**
 * Ordutegiaren interfazea
 * Ordutegi slot baten datuak definitzen ditu
 */
export interface Horario {
  id: number;
  dia: 'ASTELEHENA' | 'ASTEARTEA' | 'ASTEAZKENA' | 'OSTEGUNA' | 'OSTIRALA';
  hora: number; // Ordua (1-6)
  profe_id: number; // Irakaslearen IDa
  modulo_id: number; // Moduluaren IDa
  aula: string; // Gela
  observaciones?: string; // Oharrak (aukerakoa)
  profesor_nombre?: string; // Irakaslearen izena
  apellidos?: string; // Abizenak
  modulo_nombre?: string; // Moduluaren izena
}

/**
 * Ordutegien zerbitzua
 * Ordutegien CRUD eragiketak kudeatzen ditu
 */
@Injectable({
  providedIn: 'root',
})
export class HorariosService {
  constructor(private http: HttpClient) {}

  /** Ordutegia osoa eskuratzen du */
  getAllHorarios(): Observable<Horario[]> {
    return this.http.get<Horario[]>(ApiUtil.buildUrl('/horarios'));
  }

  /** Ordutegia berri bat sortzen du */
  createHorario(horario: Horario): Observable<any> {
    return this.http.post(ApiUtil.buildUrl('/horarios'), horario);
  }

  /** Ordutegia bat eguneratzen du */
  updateHorario(id: number, horario: Horario): Observable<any> {
    return this.http.put(ApiUtil.buildUrl(`/horarios/${id}`), horario);
  }

  /** Ordutegia bat ezabatzen du */
  deleteHorario(id: number): Observable<any> {
    return this.http.delete(ApiUtil.buildUrl(`/horarios/${id}`));
  }
}
