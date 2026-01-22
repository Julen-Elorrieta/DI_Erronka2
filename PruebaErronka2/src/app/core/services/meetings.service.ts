import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meeting } from '../models/meeting.model';
import { ApiUtil } from '../utils/api.util';

@Injectable({
  providedIn: 'root'
})
export class MeetingsService {

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las reuniones
   * @returns Observable con array de reuniones
   */
  getAllMeetings(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(ApiUtil.buildUrl('/meetings'));
  }

  /**
   * Obtiene las reuniones de un usuario específico
   * @param userId ID del usuario
   * @returns Observable con reuniones del usuario
   */
  getUserMeetings(userId: number): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(ApiUtil.buildUrl(`/meetings/user/${userId}`));
  }

  /**
   * Obtiene una reunión por ID
   * @param meetingId ID de la reunión
   * @returns Observable con datos de la reunión
   */
  getMeetingById(meetingId: number): Observable<Meeting> {
    return this.http.get<Meeting>(ApiUtil.buildUrl(`/meetings/${meetingId}`));
  }

  /**
   * Crea una nueva reunión
   * @param meeting Datos de la reunión a crear
   * @returns Observable con la reunión creada
   */
  createMeeting(meeting: Meeting): Observable<Meeting> {
    return this.http.post<Meeting>(ApiUtil.buildUrl('/meetings'), meeting);
  }

  /**
   * Actualiza una reunión existente
   * @param meetingId ID de la reunión
   * @param meeting Datos actualizados
   * @returns Observable con el resultado
   */
  updateMeeting(meetingId: number, meeting: Meeting): Observable<any> {
    return this.http.put(ApiUtil.buildUrl(`/meetings/${meetingId}`), meeting);
  }

  /**
   * Cambia el estado de una reunión
   * @param meetingId ID de la reunión
   * @param status Nuevo estado (PENDING, ACCEPTED, CANCELLED, CONFLICT)
   * @returns Observable con el resultado
   */
  updateMeetingStatus(meetingId: number, status: string): Observable<any> {
    return this.http.put(ApiUtil.buildUrl(`/meetings/${meetingId}/status`), { status });
  }

  /**
   * Elimina una reunión
   * @param meetingId ID de la reunión a eliminar
   * @returns Observable con el resultado
   */
  deleteMeeting(meetingId: number): Observable<any> {
    return this.http.delete(ApiUtil.buildUrl(`/meetings/${meetingId}`));
  }
}
