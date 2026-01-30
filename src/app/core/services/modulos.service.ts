import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUtil } from '../utils/api.util';

export interface Modulo {
  id: number;
  nombre: string;
  nombre_eus: string;
  horas: number;
  ciclo_id: number;
  ciclo_nombre?: string;
  curso: number;
}

@Injectable({
  providedIn: 'root',
})
export class ModulosService {
  constructor(private http: HttpClient) {}

  getAllModulos(): Observable<Modulo[]> {
    return this.http.get<Modulo[]>(ApiUtil.buildUrl('/modulos'));
  }

  createModulo(modulo: Modulo): Observable<any> {
    return this.http.post(ApiUtil.buildUrl('/modulos'), modulo);
  }

  updateModulo(id: number, modulo: Modulo): Observable<any> {
    return this.http.put(ApiUtil.buildUrl(`/modulos/${id}`), modulo);
  }

  deleteModulo(id: number): Observable<any> {
    return this.http.delete(ApiUtil.buildUrl(`/modulos/${id}`));
  }
}
