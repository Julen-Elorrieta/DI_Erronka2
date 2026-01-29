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
   * Obtiene todos los usuarios
   * @returns Observable con array de usuarios
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(ApiUtil.buildUrl('/users'));
  }

  /**
   * Obtiene un usuario por ID
   * @param userId ID del usuario
   * @returns Observable con datos del usuario
   */
  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(ApiUtil.buildUrl(`/users/${userId}`));
  }

  /**
   * Obtiene usuarios filtrados por rol
   * @param tipoId ID del tipo de usuario/rol
   * @returns Observable con usuarios del rol
   */
  getUsersByRole(tipoId: number): Observable<User[]> {
    return this.http.get<User[]>(ApiUtil.buildUrl('/filterUserByRole', { tipo_id: tipoId }));
  }

  /**
   * Filtrar usuarios por rol (alias para getUsersByRole)
   * @param tipoId ID del tipo de usuario/rol
   * @returns Observable con usuarios del rol
   */
  filterUserByRole(tipoId: number): Observable<User[]> {
    return this.http.get<User[]>(ApiUtil.buildUrl('/filterUserByRole', { tipo_id: tipoId }));
  }

  /**
   * Crea un nuevo usuario
   * @param user Datos del usuario a crear
   * @returns Observable con el usuario creado
   */
  createUser(user: User): Observable<User> {
    return this.http.post<User>(ApiUtil.buildUrl('/users'), user);
  }

  /**
   * Actualiza un usuario existente
   * @param userId ID del usuario
   * @param user Datos actualizados
   * @returns Observable con el resultado
   */
  updateUser(userId: number, user: User): Observable<any> {
    return this.http.put(ApiUtil.buildUrl(`/updateUser/${userId}`), user);
  }

  /**
   * Elimina un usuario
   * @param username Username del usuario a eliminar
   * @returns Observable con el resultado
   */
  deleteUser(username: string): Observable<any> {
    return this.http.delete(ApiUtil.buildUrl(`/deleteUser/${username}`));
  }
}
