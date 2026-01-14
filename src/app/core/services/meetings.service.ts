import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Meeting, MeetingStatus } from '../models/meeting.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MeetingsService {
  private readonly API_URL = `${environment.apiUrl}/meetings`;
  private readonly USE_MOCK = environment.production ? false : (environment as any).enableMockData ?? true;

  constructor(private http: HttpClient) {}

  /**
   * Bilera guztiak lortzen ditu
   */
  getMeetings(): Observable<Meeting[]> {
    if (this.USE_MOCK) {
      return this.getMockMeetings().pipe(delay(300));
    }
    return this.http.get<Meeting[]>(this.API_URL);
  }

  /**
   * Erabiltzaile baten bilerak lortzen ditu
   */
  getUserMeetings(userId: number): Observable<Meeting[]> {
    if (this.USE_MOCK) {
      return this.getMockMeetings().pipe(
        map(meetings => meetings.filter(m =>
          m.participants.teacherId === userId || m.participants.studentId === userId
        )),
        delay(300)
      );
    }
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<Meeting[]>(this.API_URL, { params });
  }

  /**
   * Gaurko bilerak lortzen ditu
   */
  getTodayMeetings(): Observable<Meeting[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (this.USE_MOCK) {
      return this.getMockMeetings().pipe(
        map(meetings => meetings.filter(m => {
          const meetingDate = new Date(m.date);
          meetingDate.setHours(0, 0, 0, 0);
          return meetingDate.getTime() === today.getTime();
        })),
        delay(200)
      );
    }
    const params = new HttpParams().set('date', today.toISOString().split('T')[0]);
    return this.http.get<Meeting[]>(`${this.API_URL}/today`, { params });
  }

  /**
   * Bilera berria sortzen du
   */
  createMeeting(meeting: Omit<Meeting, 'id'>): Observable<Meeting> {
    if (this.USE_MOCK) {
      const newMeeting = { ...meeting, id: Date.now() } as Meeting;
      console.log('[ONDO] Bilera sortuta (mock):', newMeeting);
      return of(newMeeting).pipe(delay(500));
    }
    return this.http.post<Meeting>(this.API_URL, meeting);
  }

  /**
   * Bilera baten egoera eguneratzen du
   */
  updateMeetingStatus(id: number, status: MeetingStatus): Observable<Meeting> {
    if (this.USE_MOCK) {
      console.log(`[ONDO] ${id} bileraren egoera eguneratuta:`, status);
      return this.getMockMeetings().pipe(
        map(meetings => {
          const meeting = meetings.find(m => m.id === id);
          if (meeting) {
            meeting.status = status;
          }
          return meeting!;
        }),
        delay(300)
      );
    }
    return this.http.patch<Meeting>(`${this.API_URL}/${id}/status`, { status });
  }

  /**
   * Bilera bat ezabatzen du
   */
  deleteMeeting(id: number): Observable<void> {
    if (this.USE_MOCK) {
      console.log('[ONDO] Bilera ezabatuta (mock):', id);
      return of(void 0).pipe(delay(300));
    }
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  /**
   * MOCK: Proba datuak
   */
  private getMockMeetings(): Observable<Meeting[]> {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const mockMeetings: Meeting[] = [
      {
        id: 1,
        title: 'Azken proiektuaren berrikuspena',
        topic: 'Ziklo amaierako proiektuaren aurrerapenak eztabaidatu',
        date: today,
        hour: 3,
        classroom: 'A-301',
        status: MeetingStatus.ACCEPTED,
        location: {
          center: 'CIFP Elorrieta-Errekamari LHII',
          address: 'Elorrieta kalea, 5, 48004 Bilbo',
          latitude: 43.2627,
          longitude: -2.9253
        },
        participants: {
          teacherId: 3,
          studentId: 5
        }
      },
      {
        id: 2,
        title: 'Jarraipen tutoretza',
        topic: 'Noten berrikuspena eta hobekuntza plana',
        date: today,
        hour: 5,
        classroom: 'B-102',
        status: MeetingStatus.PENDING,
        location: {
          center: 'CIFP Elorrieta-Errekamari LHII',
          address: 'Elorrieta kalea, 5, 48004 Bilbo',
          latitude: 43.2627,
          longitude: -2.9253
        },
        participants: {
          teacherId: 4,
          studentId: 6
        }
      },
      {
        id: 3,
        title: 'DUAL enpresako bilera',
        topic: 'Enpresako tutorearekin koordinazioa',
        date: tomorrow,
        hour: 2,
        classroom: 'Bilera gela',
        status: MeetingStatus.ACCEPTED,
        location: {
          center: 'CIFP Elorrieta-Errekamari LHII',
          address: 'Elorrieta kalea, 5, 48004 Bilbo',
          latitude: 43.2627,
          longitude: -2.9253
        },
        participants: {
          teacherId: 3,
          studentId: 6
        }
      }
    ];

    return of(mockMeetings);
  }
}
