import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Schedule } from '../models/schedule.model';
import { ApiUtil } from '../utils/api.util';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  constructor(private http: HttpClient) {}

  /**
   * Erabiltzaile baten ordutegia eskuratzen du
   * @param userId Erabiltzailearen IDa
   * @returns Observable erabiltzailearen ordutegiarekin
   */
  getUserSchedule(userId: number): Observable<Schedule> {
    return this.http.get<Schedule>(ApiUtil.buildUrl(`/schedule/${userId}`));
  }
}
