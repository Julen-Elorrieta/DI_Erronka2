import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUtil } from '../utils/api.util';

export interface Horario {
  id: number;
  dia: 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES';
  hora: number;
  profe_id: number;
  modulo_id: number;
  aula: string;
  observaciones?: string;
  profesor_nombre?: string;
  apellidos?: string;
  modulo_nombre?: string;
}

@Injectable({
  providedIn: 'root',
})
export class HorariosService {
  constructor(private http: HttpClient) {}

  getAllHorarios(): Observable<Horario[]> {
    return this.http.get<Horario[]>(ApiUtil.buildUrl('/horarios'));
  }

  createHorario(horario: Horario): Observable<any> {
    return this.http.post(ApiUtil.buildUrl('/horarios'), horario);
  }

  updateHorario(id: number, horario: Horario): Observable<any> {
    return this.http.put(ApiUtil.buildUrl(`/horarios/${id}`), horario);
  }

  deleteHorario(id: number): Observable<any> {
    return this.http.delete(ApiUtil.buildUrl(`/horarios/${id}`));
  }
}
