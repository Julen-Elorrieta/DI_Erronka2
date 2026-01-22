import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Schedule } from '../models/schedule.model';
import { ApiUtil } from '../utils/api.util';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  constructor(private http: HttpClient) { }

  /**
   * Obtiene el horario de un usuario específico
   * @param userId ID del usuario
   * @returns Observable con el horario del usuario
   */
  getUserSchedule(userId: number): Observable<Schedule> {
    return this.http.get<Schedule>(ApiUtil.buildUrl(`/schedule/${userId}`));
  }

  /**
   * Actualiza el horario de un usuario
   * @param userId ID del usuario
   * @param schedule Datos del horario a actualizar
   * @returns Observable con el resultado
   */
  updateUserSchedule(userId: number, schedule: Schedule): Observable<any> {
    return this.http.put(ApiUtil.buildUrl(`/schedule/${userId}`), schedule);
  }
}
