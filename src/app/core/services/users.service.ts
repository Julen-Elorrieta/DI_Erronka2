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
   * Erabiltzaileak iragazten ditu rolaren arabera
   */
  filterUserByRole(tipoId: number): Observable<User[]> {
    return this.http.get<User[]>(ApiUtil.buildUrl('/filterUserByRole', { tipo_id: tipoId }));
  }
}
