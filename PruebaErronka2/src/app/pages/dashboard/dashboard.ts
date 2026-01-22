import { Component, signal, computed, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule, MatIconModule, MatButtonModule, RouterModule, TranslateModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard {
  currentUser = signal<any>({ name: 'Admin', role: 'ADMIN' });
  isAdminRole = computed(() => {
    const user = this.authService.currentUser();
    return user && (user.tipo_id === 1 || user.tipo_id === 2); // 1 = GOD, 2 = Admin
  });
  totalStudents = signal<number>(0);
  totalTeachers = signal<number>(0);
  todayMeetings = signal<number>(0);
  router: Router = inject(Router);
  authService: AuthService = inject(AuthService);

  private readonly apiUrl = Array.isArray(environment.apiUrl)
    ? environment.apiUrl.join('')
    : environment.apiUrl;

  constructor(private http: HttpClient) {
    // El guard ya se encarga de verificar la autenticación
    // Solo necesitas cargar los datos
    this.fetchMeetingsCount();
    this.fetchUsersCount();
    this.fetchTeachersCount();
  }

  // Método para cerrar sesión (opcional, úsalo en tu template)
  logout(): void {
    this.authService.logout(this.router);
  }

  private fetchData<T>(endpoint: string, targetSignal: any): void {
    this.http.get<T>(`${this.apiUrl}${endpoint}`).subscribe({
      next: (response: any) => {
        if (typeof response.count === 'number') {
          targetSignal.set(response.count);
        } else {
          targetSignal.set(0);
        }
      },
      error: (err) => {
        console.error(`Error fetching ${endpoint}:`, err);
        targetSignal.set(0);
      },
    });
  }

  fetchMeetingsCount(): void {
    this.fetchData('/countMeetings', this.todayMeetings);
  }

  fetchUsersCount(): void {
    this.fetchData('/countUsers', this.totalStudents);
  }

  fetchTeachersCount(): void {
    this.fetchData('/countTeachers', this.totalTeachers);
  }
}