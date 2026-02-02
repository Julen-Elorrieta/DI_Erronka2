import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meeting } from '../models/meeting.model';
import { ApiUtil } from '../utils/api.util';

@Injectable({
  providedIn: 'root',
})
export class MeetingsService {
  constructor(private http: HttpClient) {}

  /**
   * Bilera guztiak eskuratzen ditu
   * @returns Observable bileren array-arekin
   */
  getAllMeetings(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(ApiUtil.buildUrl('/meetings'));
  }

  /**
   * Erabiltzaile baten bilerak eskuratzen ditu
   * @param userId Erabiltzailearen IDa
   * @returns Observable erabiltzailearen bilerekin
   */
  getUserMeetings(userId: number): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(ApiUtil.buildUrl(`/meetings/user/${userId}`));
  }

  /**
   * Bilera bat eskuratzen du ID bidez
   * @param meetingId Bileraren IDa
   * @returns Observable bileraren datuekin
   */
  getMeetingById(meetingId: number): Observable<Meeting> {
    return this.http.get<Meeting>(ApiUtil.buildUrl(`/meetings/${meetingId}`));
  }

  /**
   * Bilera berri bat sortzen du
   * @param meeting Sortu beharreko bileraren datuak
   * @returns Observable sortutako bilerarekin
   */
  createMeeting(meeting: Meeting): Observable<Meeting> {
    return this.http.post<Meeting>(ApiUtil.buildUrl('/meetings'), meeting);
  }

  /**
   * Lehendik dagoen bilera bat eguneratzen du
   * @param meetingId Bileraren IDa
   * @param meeting Datu eguneratuak
   * @returns Observable emaitzarekin
   */
  updateMeeting(meetingId: number, meeting: Meeting): Observable<any> {
    return this.http.put(ApiUtil.buildUrl(`/meetings/${meetingId}`), meeting);
  }

  /**
   * Bilera baten egoera aldatzen du
   * @param meetingId Bileraren IDa
   * @param status Egoera berria (PENDING, ACCEPTED, CANCELLED, CONFLICT)
   * @returns Observable emaitzarekin
   */
  updateMeetingStatus(meetingId: number, status: string): Observable<any> {
    return this.http.put(ApiUtil.buildUrl(`/meetings/${meetingId}/status`), { status });
  }

  /**
   * Bilera bat ezabatzen du
   * @param meetingId Ezabatu beharreko bileraren IDa
   * @returns Observable emaitzarekin
   */
  deleteMeeting(meetingId: number): Observable<any> {
    return this.http.delete(ApiUtil.buildUrl(`/meetings/${meetingId}`));
  }
}
