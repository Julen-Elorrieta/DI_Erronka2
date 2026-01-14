import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { UsersService } from '../../core/services/users.service';
import { MeetingsService } from '../../core/services/meetings.service';
import { UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  totalStudents = signal(0);
  totalTeachers = signal(0);
  todayMeetings = signal(0);

  isAdminRole = computed(() => {
    const user = this.authService.currentUser();
    return user?.role === UserRole.GOD || user?.role === UserRole.ADMIN;
  });

  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private meetingsService: MeetingsService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  get currentUser() {
    return this.authService.currentUser;
  }

  private loadStats(): void {
    // Cargar estadísticas de usuarios
    this.usersService.getStats().subscribe(stats => {
      this.totalStudents.set(stats.totalStudents);
      this.totalTeachers.set(stats.totalTeachers);
    });

    // Cargar reuniones de hoy
    this.meetingsService.getTodayMeetings().subscribe(meetings => {
      this.todayMeetings.set(meetings.length);
    });
  }
}
