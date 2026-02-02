import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { ApiUtil } from '../utils/api.util';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private http: HttpClient) {}

  /**
   * Erabiltzaile guztiak eskuratzen ditu
   * @returns Observable erabiltzaileen array-arekin
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(ApiUtil.buildUrl('/users'));
  }

  /**
   * Erabiltzaile bat eskuratzen du ID bidez
   * @param userId Erabiltzailearen IDa
   * @returns Observable erabiltzailearen datuekin
   */
  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(ApiUtil.buildUrl(`/users/${userId}`));
  }

  /**
   * Erabiltzaileak iragazten ditu rolaren arabera
   * @param tipoId Erabiltzaile mota/rol IDa
   * @returns Observable rolaren erabiltzaileekin
   */
  getUsersByRole(tipoId: number): Observable<User[]> {
    return this.http.get<User[]>(ApiUtil.buildUrl('/filterUserByRole', { tipo_id: tipoId }));
  }

  /**
   * Erabiltzaileak iragazten ditu rolaren arabera (getUsersByRole-ren aliasa)
   * @param tipoId Erabiltzaile mota/rol IDa
   * @returns Observable rolaren erabiltzaileekin
   */
  filterUserByRole(tipoId: number): Observable<User[]> {
    return this.http.get<User[]>(ApiUtil.buildUrl('/filterUserByRole', { tipo_id: tipoId }));
  }

  /**
   * Erabiltzaile berri bat sortzen du
   * @param user Sortu beharreko erabiltzailearen datuak
   * @returns Observable sortutako erabiltzailearekin
   */
  createUser(user: User): Observable<User> {
    return this.http.post<User>(ApiUtil.buildUrl('/users'), user);
  }

  /**
   * Lehendik dagoen erabiltzaile bat eguneratzen du
   * @param userId Erabiltzailearen IDa
   * @param user Datu eguneratuak
   * @returns Observable emaitzarekin
   */
  updateUser(userId: number, user: User): Observable<any> {
    return this.http.put(ApiUtil.buildUrl(`/updateUser/${userId}`), user);
  }

  /**
   * Erabiltzaile bat ezabatzen du
   * @param username Ezabatu beharreko erabiltzailearen username-a
   * @returns Observable emaitzarekin
   */
  deleteUser(username: string): Observable<any> {
    return this.http.delete(ApiUtil.buildUrl(`/deleteUser/${username}`));
  }
}
