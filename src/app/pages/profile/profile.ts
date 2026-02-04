import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { User, getUserRoleFromTipoId, UserRole } from '../../core/models/user.model';
import { Schedule, ScheduleSlot } from '../../core/models/schedule.model';
import { Meeting } from '../../core/models/meeting.model';
import { AuthService } from '../../core/services/auth.service';
import { ScheduleService } from '../../core/services/schedule.service';
import { MeetingsService } from '../../core/services/meetings.service';

/**
 * Profileko osagaia
 * Erabiltzaileak bere datu pertsonalak, ordutegia eta bilerak ikus ditzake
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTableModule,
    TranslateModule,
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class ProfileComponent implements OnInit {
  user = signal<User | null>(null);
  schedule = signal<Schedule | null>(null);
  meetings = signal<Meeting[]>([]);
  loading = signal(true);
  editing = signal(false);
  userRole = signal<UserRole | null>(null);

  profileForm!: FormGroup;

  days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  hours = [1, 2, 3, 4, 5, 6];

  private authService = inject(AuthService);
  private scheduleService = inject(ScheduleService);
  private meetingsService = inject(MeetingsService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);
  private router = inject(Router);

  displayedColumns: string[] = ['title', 'topic', 'date', 'hour', 'classroom', 'status'];

  constructor() {
    this.authenticate();
  }

  authenticate(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit(): void {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.user.set(currentUser);
      this.userRole.set(getUserRoleFromTipoId(currentUser.tipo_id));
      this.initForm(currentUser);
      this.loadSchedule(currentUser.id);
      this.loadMeetings(currentUser.id);
    }
  }

  private initForm(user: User): void {
    this.profileForm = this.fb.group({
      username: [user.username, Validators.required],
      nombre: [user.nombre, Validators.required],
      apellidos: [user.apellidos, Validators.required],
      email: [user.email, [Validators.required, Validators.email]],
      dni: [{ value: user.dni, disabled: true }, Validators.required],
      direccion: [user.direccion],
      telefono1: [user.telefono1],
      telefono2: [user.telefono2],
      argazkia_url: [user.argazkia_url],
    });
  }

  private loadSchedule(userId: number): void {
    this.scheduleService.getUserSchedule(userId).subscribe({
      next: (schedule) => {
        this.schedule.set(schedule);
      },
      error: (err) => {
        console.error('Error loading schedule:', err);
        this.showError(this.translate.instant('ERROR.LOADING_SCHEDULE'));
      },
    });
  }

  private loadMeetings(userId: number): void {
    this.meetingsService.getUserMeetings(userId).subscribe({
      next: (meetings) => {
        this.meetings.set(meetings);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading meetings:', err);
        this.showError(this.translate.instant('ERROR.LOADING_MEETINGS'));
        this.loading.set(false);
      },
    });
  }

  toggleEdit(): void {
    this.editing.set(!this.editing());
    if (!this.editing() && this.user()) {
      this.initForm(this.user()!);
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid && this.user()) {
      // TODO: UsersService erabili eguneratzeko
      // this.usersService.updateUser(this.user()!.id, updatedUser).subscribe({
      //   next: (user) => {
      //     this.user.set(user);
      //     this.editing.set(false);
      //     this.showSuccess(this.translate.instant('SUCCESS.PROFILE_UPDATED'));
      //   },
      //   error: () => this.showError(this.translate.instant('ERROR.UPDATING_PROFILE'))
      // });

      // Oraingoz, mezua bakarrik erakusten dugu
      this.editing.set(false);
      this.showSuccess(this.translate.instant('SUCCESS.PROFILE_UPDATED'));
    }
  }

  getPhotoUrl(): string {
    const user = this.user();
    return user && user.argazkia_url ? user.argazkia_url : '/unknown.webp';
  }

  getRoleIcon(): string {
    const role = this.userRole();
    const icons: Record<UserRole, string> = {
      [UserRole.GOD]: 'admin_panel_settings',
      [UserRole.ADMIN]: 'manage_accounts',
      [UserRole.TEACHER]: 'school',
      [UserRole.STUDENT]: 'person',
    };
    return role ? icons[role] : 'person';
  }

  getRoleLabel(): string {
    const role = this.userRole();
    if (!role) return '';
    return this.translate.instant(`ROLE.${role}`) || role;
  }

  getSlot(day: number, hour: number): ScheduleSlot | undefined {
    const sch = this.schedule();
    return sch?.slots.find((s) => s.day === day && s.hour === hour);
  }

  getSlotClass(slot: ScheduleSlot | undefined): string {
    if (!slot || slot.type === 'EMPTY') return 'slot-empty';
    return `slot-${slot.type.toLowerCase()}`;
  }

  getSlotText(slot: ScheduleSlot | undefined): string {
    if (!slot || slot.type === 'EMPTY') return '';

    switch (slot.type) {
      case 'CLASS':
        return `${slot.subject || ''} ${slot.course || ''}`.trim();
      case 'TUTORIA':
        return 'Tutoritza';
      case 'GUARDIA':
        return 'Guardia';
      case 'MEETING':
        return `Bilera #${slot.meetingId}`;
      default:
        return '';
    }
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, this.translate.instant('COMMON.CLOSE'), {
      duration: 3000,
      panelClass: ['snackbar-success'],
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, this.translate.instant('COMMON.CLOSE'), {
      duration: 5000,
      panelClass: ['snackbar-error'],
    });
  }
}
