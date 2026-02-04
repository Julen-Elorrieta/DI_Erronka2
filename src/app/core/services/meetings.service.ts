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
   * Erabiltzaile baten bilerak eskuratzen ditu
   */
  getUserMeetings(userId: number): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(ApiUtil.buildUrl(`/meetings/user/${userId}`));
  }

  /**
   * Bilera berri bat sortzen du
   */
  createMeeting(meeting: Meeting): Observable<Meeting> {
    return this.http.post<Meeting>(ApiUtil.buildUrl('/meetings'), meeting);
  }

  /**
   * Bilera baten egoera aldatzen du
   */
  updateMeetingStatus(meetingId: number, status: string): Observable<any> {
    return this.http.put(ApiUtil.buildUrl(`/meetings/${meetingId}/status`), { status });
  }
}
