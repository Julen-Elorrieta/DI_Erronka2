import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUtil } from '../utils/api.util';

export interface Ciclo {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root',
})
export class CiclosService {
  constructor(private http: HttpClient) {}

  getAllCiclos(): Observable<Ciclo[]> {
    return this.http.get<Ciclo[]>(ApiUtil.buildUrl('/ciclos'));
  }

  createCiclo(ciclo: Ciclo): Observable<any> {
    return this.http.post(ApiUtil.buildUrl('/ciclos'), ciclo);
  }

  updateCiclo(id: number, ciclo: Ciclo): Observable<any> {
    return this.http.put(ApiUtil.buildUrl(`/ciclos/${id}`), ciclo);
  }

  deleteCiclo(id: number): Observable<any> {
    return this.http.delete(ApiUtil.buildUrl(`/ciclos/${id}`));
  }
}
