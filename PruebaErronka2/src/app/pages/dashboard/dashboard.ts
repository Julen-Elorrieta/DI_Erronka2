import { Component, signal, computed } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule, MatIconModule, MatButtonModule, RouterModule, TranslateModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard {
  currentUser = signal<any>({ name: 'Admin', role: 'ADMIN' });
  isAdminRole = computed(() => true);
  totalStudents = signal<number>(0);
  totalTeachers = signal<number>(0);
  todayMeetings = signal<number>(0);

  constructor(private http: HttpClient) {
    this.fetchMeetingsCount();
    this.fetchUsersCount();
    this.fetchTeachersCount();
  }

  fetchMeetingsCount(): void {
    const apiUrl = Array.isArray(environment.apiUrl)
      ? environment.apiUrl.join('')
      : environment.apiUrl;
    this.http.get<any>(`${apiUrl}/countMeetings`).subscribe({
      next: (response: any) => {
        if (typeof response.count === 'number') {
          this.todayMeetings.set(response.count);
        } else {
          this.todayMeetings.set(0);
        }
      },
      error: (err) => {
        console.error('Error fetching meetings:', err);
        this.todayMeetings.set(0);
      },
    });
  }

  fetchUsersCount(): void {
    const apiUrl = Array.isArray(environment.apiUrl)
      ? environment.apiUrl.join('')
      : environment.apiUrl;
    this.http.get<any>(`${apiUrl}/countUsers`).subscribe({
      next: (response: any) => {
        if (typeof response.count === 'number') {
          this.totalStudents.set(response.count);
        } else {
          this.totalStudents.set(0);
        }
      },
      error: (err) => {
        console.error('Error fetching users count:', err);
        this.totalStudents.set(0);
      },
    });
  }

  fetchTeachersCount(): void {
    const apiUrl = Array.isArray(environment.apiUrl)
      ? environment.apiUrl.join('')
      : environment.apiUrl;
    this.http.get<any>(`${apiUrl}/countTeachers`).subscribe({
      next: (response: any) => {
        if (typeof response.count === 'number') {
          this.totalTeachers.set(response.count);
        } else {
          this.totalTeachers.set(0);
        }
      },
      error: (err) => {
        console.error('Error fetching users count:', err);
        this.totalTeachers.set(0);
      },
    });
  }
}
