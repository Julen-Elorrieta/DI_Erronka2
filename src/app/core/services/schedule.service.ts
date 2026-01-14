import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Schedule, ScheduleSlot } from '../models/schedule.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private readonly API_URL = `${environment.apiUrl}/schedules`;
  private readonly USE_MOCK = environment.production ? false : (environment as any).enableMockData ?? true;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el horario de un usuario
   */
  getUserSchedule(userId: number): Observable<Schedule> {
    if (this.USE_MOCK) {
      return this.getMockSchedule(userId).pipe(delay(300));
    }
    return this.http.get<Schedule>(`${this.API_URL}/user/${userId}`);
  }

  /**
   * MOCK: Genera horario de prueba
   */
  private getMockSchedule(userId: number): Observable<Schedule> {
    const subjects = [
      'Desarrollo de Interfaces',
      'Acceso a Datos',
      'Programación Multimedia',
      'Sistemas de Gestión Empresarial',
      'Proyecto',
      'Inglés Técnico',
      'Tutoría'
    ];

    const slots: ScheduleSlot[] = [];
    
    // Generar horario aleatorio pero consistente para cada usuario
    for (let day = 0; day < 5; day++) {
      for (let hour = 1; hour <= 6; hour++) {
        const seed = (userId * 100 + day * 10 + hour) % 10;
        
        if (seed < 7) { // 70% probabilidad de clase
          slots.push({
            day,
            hour,
            type: seed === 6 ? 'TUTORIA' : 'CLASS',
            subject: subjects[seed % subjects.length],
            cycle: '2DAM',
            course: '2º'
          });
        } else if (seed === 7) {
          slots.push({
            day,
            hour,
            type: 'GUARDIA',
            subject: 'Guardia'
          });
        } else {
          slots.push({
            day,
            hour,
            type: 'EMPTY'
          });
        }
      }
    }

    return of({ userId, slots });
  }

  /**
   * Obtiene un slot específico del horario
   */
  getSlot(schedule: Schedule, day: number, hour: number): ScheduleSlot | undefined {
    return schedule.slots.find(s => s.day === day && s.hour === hour);
  }
}
