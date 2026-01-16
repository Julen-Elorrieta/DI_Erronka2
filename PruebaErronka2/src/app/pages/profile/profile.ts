import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { User, UserRole } from '../../core/models/user.model';
import { Schedule, ScheduleSlot } from '../../core/models/schedule.model';
import { Meeting } from '../../core/models/meeting.model';

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
    TranslateModule
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  user = signal<User | null>(null);
  schedule = signal<Schedule | null>(null);
  meetings = signal<Meeting[]>([]);
  loading = signal(true);
  editing = signal(false);
  
  profileForm!: FormGroup;
  UserRole = UserRole;

  days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  hours = [1, 2, 3, 4, 5, 6];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
  }


  private initForm(user: User): void {
    this.profileForm = this.fb.group({
      name: [user.name, Validators.required],
      surname: [user.surname, Validators.required],
      email: [user.email, [Validators.required, Validators.email]]
    });
  }
/*
  private loadSchedule(userId: number): void {
    this.scheduleService.getUserSchedule(userId).subscribe({
      next: (schedule) => this.schedule.set(schedule)
    });
  }

  private loadMeetings(userId: number): void {
    this.meetingsService.getUserMeetings(userId).subscribe({
      next: (meetings) => this.meetings.set(meetings)
    });
  }*/

  toggleEdit(): void {
    this.editing.set(!this.editing());
    if (!this.editing() && this.user()) {
      this.initForm(this.user()!);
    }
  }
  saveProfile(): void {
    /*
    if (this.profileForm.valid && this.user()) {
      this.usersService.updateUser(this.user()!.id, this.profileForm.value).subscribe({
        next: (updatedUser) => {
          this.user.set(updatedUser);
          this.editing.set(false);
          this.showSuccess('Profila ondo eguneratuta');
        },
        error: () => this.showError('Errorea profila eguneratzean')
      });
    }
      */
  }

  getPhotoUrl(): string {
    const user = this.user();
    return user?.photo ? `assets/photos/${user.photo}` : 'assets/photos/unknown.jpg';
  }

  getRoleIcon(): string {
    const icons: Record<UserRole, string> = {
      [UserRole.GOD]: 'admin_panel_settings',
      [UserRole.ADMIN]: 'manage_accounts',
      [UserRole.TEACHER]: 'school',
      [UserRole.STUDENT]: 'person'
    };
    return icons[this.user()?.role || UserRole.STUDENT];
  }

  getSlot(day: number, hour: number): ScheduleSlot | undefined {
    const sch = this.schedule();
    return sch?.slots.find(s => s.day === day && s.hour === hour);
  }

  getSlotClass(slot: ScheduleSlot | undefined): string {
    if (!slot || slot.type === 'EMPTY') return 'slot-empty';
    return `slot-${slot.type.toLowerCase()}`;
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 5000,
      panelClass: ['snackbar-error']
    });
  }
}
