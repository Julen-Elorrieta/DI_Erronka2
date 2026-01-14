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
   * Erabiltzaile baten ordutegia lortzen du
   */
  getUserSchedule(userId: number): Observable<Schedule> {
    if (this.USE_MOCK) {
      return this.getMockSchedule(userId).pipe(delay(300));
    }
    return this.http.get<Schedule>(`${this.API_URL}/user/${userId}`);
  }

  /**
   * MOCK: Proba ordutegia sortzen du
   */
  private getMockSchedule(userId: number): Observable<Schedule> {
    const subjects = [
      'Interfazeen Garapena',
      'Datuetarako Sarbidea',
      'Multimedia Programazioa',
      'Enpresa Kudeaketa Sistemak',
      'Proiektua',
      'Ingelesa Teknikoa',
      'Tutoretza'
    ];

    const slots: ScheduleSlot[] = [];
    
    // Erabiltzaile bakoitzarentzat ausazko baina koherentea den ordutegia sortu
    for (let day = 0; day < 5; day++) {
      for (let hour = 1; hour <= 6; hour++) {
        const seed = (userId * 100 + day * 10 + hour) % 10;
        
        if (seed < 7) { // %70 klase izateko probabilitatea
          slots.push({
            day,
            hour,
            type: seed === 6 ? 'TUTORIA' : 'CLASS',
            subject: subjects[seed % subjects.length],
            cycle: '2DAM',
            course: '2.'
          });
        } else if (seed === 7) {
          slots.push({
            day,
            hour,
            type: 'GUARDIA',
            subject: 'Zaintza'
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
   * Ordutegiaren slot zehatz bat eskuratzen du
   */
  getSlot(schedule: Schedule, day: number, hour: number): ScheduleSlot | undefined {
    return schedule.slots.find(s => s.day === day && s.hour === hour);
  }
}
