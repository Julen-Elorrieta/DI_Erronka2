import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUtil } from '../utils/api.util';

export interface Matriculacion {
  id: number;
  alum_id: number;
  ciclo_id: number;
  curso: number;
  fecha: Date;
  alumno_nombre?: string;
  apellidos?: string;
  ciclo_nombre?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MatriculacionesService {
  constructor(private http: HttpClient) { }

  getAllMatriculaciones(): Observable<Matriculacion[]> {
    return this.http.get<Matriculacion[]>(ApiUtil.buildUrl('/matriculaciones'));
  }

  createMatriculacion(matriculacion: Matriculacion): Observable<any> {
    return this.http.post(ApiUtil.buildUrl('/matriculaciones'), matriculacion);
  }

  updateMatriculacion(id: number, matriculacion: Matriculacion): Observable<any> {
    return this.http.put(ApiUtil.buildUrl(`/matriculaciones/${id}`), matriculacion);
  }

  deleteMatriculacion(id: number): Observable<any> {
    return this.http.delete(ApiUtil.buildUrl(`/matriculaciones/${id}`));
  }
}
