import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { User, UserRole } from '../models/user.model';
import { environment } from '../../../environments/environment';

interface UsersFilter {
  role?: UserRole;
  cycle?: string;
  course?: string;
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly API_URL = `${environment.apiUrl}/users`;
  private readonly USE_MOCK = environment.production ? false : (environment as any).enableMockData ?? true;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los usuarios con filtros opcionales
   */
  getUsers(filter?: UsersFilter): Observable<User[]> {
    if (this.USE_MOCK) {
      console.log('🔧 Modo desarrollo: Usando datos MOCK para usuarios');
      return this.getMockUsers().pipe(
        map(users => {
          let filtered = users;

          if (filter?.role) {
            filtered = filtered.filter(u => u.role === filter.role);
          }

          if (filter?.cycle) {
            filtered = filtered.filter(u => u.cycle === filter.cycle);
          }

          if (filter?.course) {
            filtered = filtered.filter(u => u.course === filter.course);
          }

          if (filter?.search) {
            const searchLower = filter.search.toLowerCase();
            filtered = filtered.filter(u =>
              u.name.toLowerCase().includes(searchLower) ||
              u.surname.toLowerCase().includes(searchLower) ||
              u.email.toLowerCase().includes(searchLower)
            );
          }

          return filtered;
        }),
        delay(300)
      );
    }

    // Petición real a la API
    console.log('🌐 Obteniendo usuarios desde:', this.API_URL);
    let params = new HttpParams();
    if (filter?.role) params = params.set('role', filter.role);
    if (filter?.cycle) params = params.set('cycle', filter.cycle);
    if (filter?.course) params = params.set('course', filter.course);
    if (filter?.search) params = params.set('search', filter.search);
    
    return this.http.get<User[]>(this.API_URL, { params });
  }

  /**
   * Obtiene un usuario por ID
   */
  getUserById(id: number): Observable<User | null> {
    if (this.USE_MOCK) {
      return this.getMockUsers().pipe(
        map(users => users.find(u => u.id === id) || null),
        delay(200)
      );
    }
    
    return this.http.get<User>(`${this.API_URL}/${id}`);
  }

  /**
   * Crea un nuevo usuario
   */
  createUser(user: Omit<User, 'id'>): Observable<User> {
    if (this.USE_MOCK) {
      const newUser = { ...user, id: Date.now() } as User;
      console.log('✅ Usuario creado (mock):', newUser);
      return of(newUser).pipe(delay(500));
    }
    
    return this.http.post<User>(this.API_URL, user);
  }

  /**
   * Actualiza un usuario existente
   */
  updateUser(id: number, user: Partial<User>): Observable<User> {
    if (this.USE_MOCK) {
      console.log('✅ Usuario actualizado (mock):', id, user);
      return this.getUserById(id).pipe(
        map(existingUser => ({ ...existingUser, ...user } as User)),
        delay(500)
      );
    }
    
    return this.http.put<User>(`${this.API_URL}/${id}`, user);
  }

  /**
   * Elimina un usuario
   * GOD no puede ser eliminado
   * Solo GOD puede eliminar usuarios
   */
  deleteUser(id: number): Observable<void> {
    if (this.USE_MOCK) {
      console.log('✅ Usuario eliminado (mock):', id);
      return of(void 0).pipe(delay(300));
    }
    
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  getStats(): Observable<{ totalStudents: number; totalTeachers: number }> {
    if (this.USE_MOCK) {
      return this.getMockUsers().pipe(
        map(users => ({
          totalStudents: users.filter(u => u.role === UserRole.STUDENT).length,
          totalTeachers: users.filter(u => u.role === UserRole.TEACHER).length
        })),
        delay(200)
      );
    }
    
    return this.http.get<{ totalStudents: number; totalTeachers: number }>(`${this.API_URL}/stats`);
  }

  /**
   * MOCK: Datos de prueba
   */
  private getMockUsers(): Observable<User[]> {
    const mockUsers: User[] = [
      {
        id: 1,
        username: 'god',
        email: 'god@elorrieta.com',
        name: 'Super',
        surname: 'Admin',
        role: UserRole.GOD,
        photo: 'unknown.jpg'
      },
      {
        id: 2,
        username: 'admin',
        email: 'admin@elorrieta.com',
        name: 'Admin',
        surname: 'Secretaría',
        role: UserRole.ADMIN,
        photo: 'unknown.jpg'
      },
      {
        id: 3,
        username: 'jperez',
        email: 'jperez@elorrieta.com',
        name: 'Juan',
        surname: 'Pérez García',
        role: UserRole.TEACHER,
        photo: 'unknown.jpg'
      },
      {
        id: 4,
        username: 'mlopez',
        email: 'mlopez@elorrieta.com',
        name: 'María',
        surname: 'López Ruiz',
        role: UserRole.TEACHER,
        photo: 'unknown.jpg'
      },
      {
        id: 5,
        username: 'aalonso',
        email: 'aalonso@elorrieta.com',
        name: 'Ana',
        surname: 'Alonso Martín',
        role: UserRole.STUDENT,
        photo: 'unknown.jpg',
        cycle: '2DAM',
        course: '2º',
        isDual: false,
        group: 'D'
      },
      {
        id: 6,
        username: 'cgomez',
        email: 'cgomez@elorrieta.com',
        name: 'Carlos',
        surname: 'Gómez Sánchez',
        role: UserRole.STUDENT,
        photo: 'unknown.jpg',
        cycle: '2DAM',
        course: '2º',
        isDual: true,
        group: 'D'
      },
      {
        id: 7,
        username: 'lgarcia',
        email: 'lgarcia@elorrieta.com',
        name: 'Laura',
        surname: 'García Fernández',
        role: UserRole.STUDENT,
        photo: 'unknown.jpg',
        cycle: '1DAM',
        course: '1º',
        isDual: false,
        group: 'A'
      }
    ];

    return of(mockUsers);
  }
}
