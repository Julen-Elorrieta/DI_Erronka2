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
  styleUrls: ['./dashboard.css']
})
export class Dashboard {
  currentUser = signal<any>({ name: 'Admin', role: 'ADMIN' });
  isAdminRole = computed(() => true);
  totalStudents = signal<number>(0);
  totalTeachers = signal<number>(0);
  todayMeetings = signal<number>(0);


  constructor(private http: HttpClient) {
    this.fetchMeetingsCount();
  }

  fetchMeetingsCount(): void {
    const apiUrl = Array.isArray(environment.apiUrl) ? environment.apiUrl.join('') : environment.apiUrl;
    this.http.get<any>(`${apiUrl}/meetings`).subscribe({
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
      }
    });
  }
}
