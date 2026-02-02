import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { ScheduleService } from '../../core/services/schedule.service';

/**
 * Dashboard osagaia
 * Hasierako orria da, erabiltzaile motaren arabera informazio ezberdina erakusten du
 * - GOD/ADMIN: Ikasle, irakasle eta bilera kopuruak + kudeaketa botoiak
 * - IRAKASLEA: Ordutegia, bilerak eta ikasleak
 * - IKASLEA: Profila, ordutegia eta bilerak
 */
@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    TranslateModule,
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit {
  /** Uneko erabiltzailea AuthService-tik eskuratzen du */
  currentUser = computed(() => this.authService.currentUser());

  /** Erabiltzailea administratzailea den egiaztatzen du (GOD=1, Admin=2) */
  isAdminRole = computed(() => {
    const user = this.authService.currentUser();
    return user && (user.tipo_id === 1 || user.tipo_id === 2);
  });

  /** Erabiltzailea irakaslea den egiaztatzen du (tipo_id=3) */
  isTeacherRole = computed(() => {
    const user = this.authService.currentUser();
    return user && user.tipo_id === 3;
  });

  /** Erabiltzailea ikaslea den egiaztatzen du (tipo_id=4) */
  isStudentRole = computed(() => {
    const user = this.authService.currentUser();
    return user && user.tipo_id === 4;
  });

  totalStudents = signal<number>(0); // Ikasle kopurua
  totalTeachers = signal<number>(0); // Irakasle kopurua
  todayMeetings = signal<number>(0); // Gaurko bilera kopurua
  myMeetings = signal<any[]>([]); // Nire bilerak
  mySchedule = signal<any[]>([]); // Nire ordutegia

  router: Router = inject(Router);
  authService: AuthService = inject(AuthService);
  scheduleService: ScheduleService = inject(ScheduleService);
  translate: TranslateService = inject(TranslateService);

  private readonly apiUrl = Array.isArray(environment.apiUrl)
    ? environment.apiUrl.join('')
    : environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();

    // Admin/GOD datuak
    if (this.isAdminRole()) {
      this.fetchMeetingsCount();
      this.fetchUsersCount();
      this.fetchTeachersCount();
    }

    // Irakasle edo ikasle bada, bere ordutegia eta bilerak kargatu
    if ((this.isTeacherRole() || this.isStudentRole()) && user) {
      this.loadMySchedule(user.id);
      this.loadMyMeetings(user.id);
    }
  }

  /** Nire ordutegia kargatzen du */
  private loadMySchedule(userId: number): void {
    this.scheduleService.getUserSchedule(userId).subscribe({
      next: (schedule) => {
        this.mySchedule.set(schedule.slots || []);
      },
      error: (err) => {
        console.error('Errorea ordutegia kargatzean:', err);
        this.mySchedule.set([]);
      },
    });
  }

  /** Nire bilerak kargatzen ditu */
  private loadMyMeetings(userId: number): void {
    this.http.get<any[]>(`${this.apiUrl}/meetings/user/${userId}`).subscribe({
      next: (meetings) => {
        // Hurrengo bilerak soilik (etorkizunekoak)
        const now = new Date();
        const upcoming = meetings
          .filter((m) => new Date(m.fecha) >= now)
          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
          .slice(0, 5); // 5 bilera hurrenak
        this.myMeetings.set(upcoming);
      },
      error: (err) => {
        console.error('Errorea bilerak kargatzean:', err);
        this.myMeetings.set([]);
      },
    });
  }

  /** Ordua formateatu */
  formatTime(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('eu-ES', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  }

  /** Data formateatu */
  formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('eu-ES', { day: 'numeric', month: 'short' });
    } catch {
      return '--';
    }
  }

  /** Moduluaren izena lortu edo default itzulpena */
  getSubjectLabel(subject: string | null | undefined): string {
    return subject || this.translate.instant('SCHEDULE.NO_MODULE');
  }

  /** Irakaslearen izena lortu edo default itzulpena */
  getTeacherLabel(teacher: string | null | undefined): string {
    return teacher || this.translate.instant('SCHEDULE.NO_TEACHER');
  }

  /** Saioa ixteko metodoa */
  logout(): void {
    this.authService.logout(this.router);
  }

  /**
   * Datuak APIatik eskuratzen ditu
   * @param endpoint API endpoint-a
   * @param targetSignal Datuak gordetzeko signal-a
   */
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
        console.error(`Errorea ${endpoint} kargatzean:`, err);
        targetSignal.set(0);
      },
    });
  }

  /** Gaurko bilera kopurua eskuratzen du */
  fetchMeetingsCount(): void {
    this.fetchData('/countMeetings', this.todayMeetings);
  }

  /** Ikasle kopurua eskuratzen du */
  fetchUsersCount(): void {
    this.fetchData('/countUsers', this.totalStudents);
  }

  /** Irakasle kopurua eskuratzen du */
  fetchTeachersCount(): void {
    this.fetchData('/countTeachers', this.totalTeachers);
  }
}
