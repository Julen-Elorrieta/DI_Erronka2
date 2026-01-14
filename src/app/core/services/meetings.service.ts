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
   * Obtiene todas las reuniones
   */
  getMeetings(): Observable<Meeting[]> {
    if (this.USE_MOCK) {
      return this.getMockMeetings().pipe(delay(300));
    }
    return this.http.get<Meeting[]>(this.API_URL);
  }

  /**
   * Obtiene las reuniones de un usuario
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
   * Obtiene las reuniones de hoy
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
   * Crea una nueva reunión
   */
  createMeeting(meeting: Omit<Meeting, 'id'>): Observable<Meeting> {
    if (this.USE_MOCK) {
      const newMeeting = { ...meeting, id: Date.now() } as Meeting;
      console.log('✅ Reunión creada (mock):', newMeeting);
      return of(newMeeting).pipe(delay(500));
    }
    return this.http.post<Meeting>(this.API_URL, meeting);
  }

  /**
   * Actualiza el estado de una reunión
   */
  updateMeetingStatus(id: number, status: MeetingStatus): Observable<Meeting> {
    if (this.USE_MOCK) {
      console.log(`✅ Estado de reunión ${id} actualizado a:`, status);
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
   * Elimina una reunión
   */
  deleteMeeting(id: number): Observable<void> {
    // TODO: return this.http.delete<void>(`${this.API_URL}/${id}`);
    
    console.log('✅ Reunión eliminada (mock):', id);
    return of(void 0).pipe(delay(300));
  }

  /**
   * MOCK: Datos de prueba
   */
  private getMockMeetings(): Observable<Meeting[]> {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const mockMeetings: Meeting[] = [
      {
        id: 1,
        title: 'Revisión proyecto final',
        topic: 'Discutir avances del proyecto de fin de ciclo',
        date: today,
        hour: 3,
        classroom: 'A-301',
        status: MeetingStatus.ACCEPTED,
        location: {
          center: 'CIFP Elorrieta-Errekamari LHII',
          address: 'Calle Elorrieta, 5, 48004 Bilbao',
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
        title: 'Tutoría seguimiento',
        topic: 'Revisión de notas y plan de mejora',
        date: today,
        hour: 5,
        classroom: 'B-102',
        status: MeetingStatus.PENDING,
        location: {
          center: 'CIFP Elorrieta-Errekamari LHII',
          address: 'Calle Elorrieta, 5, 48004 Bilbao',
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
        title: 'Reunión empresa DUAL',
        topic: 'Coordinación con tutor de empresa',
        date: tomorrow,
        hour: 2,
        classroom: 'Sala reuniones',
        status: MeetingStatus.ACCEPTED,
        location: {
          center: 'CIFP Elorrieta-Errekamari LHII',
          address: 'Calle Elorrieta, 5, 48004 Bilbao',
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
