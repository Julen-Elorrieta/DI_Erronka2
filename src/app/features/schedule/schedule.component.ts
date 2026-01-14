import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { Schedule, ScheduleSlot } from '../../core/models/schedule.model';
import { ScheduleService } from '../../core/services/schedule.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css'
})
export class ScheduleComponent implements OnInit {
  schedule = signal<Schedule | null>(null);
  loading = signal(true);

  days = [
    { key: 'MONDAY', label: 'Astelehena' },
    { key: 'TUESDAY', label: 'Asteartea' },
    { key: 'WEDNESDAY', label: 'Asteazkena' },
    { key: 'THURSDAY', label: 'Osteguna' },
    { key: 'FRIDAY', label: 'Ostirala' }
  ];

  hours = [
    { num: 1, time: '08:00 - 09:00' },
    { num: 2, time: '09:00 - 10:00' },
    { num: 3, time: '10:15 - 11:15' },
    { num: 4, time: '11:15 - 12:15' },
    { num: 5, time: '12:30 - 13:30' },
    { num: 6, time: '13:30 - 14:30' }
  ];

  constructor(
    private scheduleService: ScheduleService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadSchedule();
  }

  private loadSchedule(): void {
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      this.scheduleService.getUserSchedule(userId).subscribe({
        next: (schedule) => {
          this.schedule.set(schedule);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
    } else {
      this.loading.set(false);
    }
  }

  getSlot(day: number, hour: number): ScheduleSlot | undefined {
    const sch = this.schedule();
    if (!sch) return undefined;
    return sch.slots.find(s => s.day === day && s.hour === hour);
  }

  getSlotClass(slot: ScheduleSlot | undefined): string {
    if (!slot) return 'slot-empty';
    
    const classes: Record<string, string> = {
      'CLASS': 'slot-class',
      'TUTORIA': 'slot-tutoria',
      'GUARDIA': 'slot-guardia',
      'MEETING': 'slot-meeting',
      'EMPTY': 'slot-empty'
    };
    
    return classes[slot.type] || 'slot-empty';
  }

  getSlotIcon(slot: ScheduleSlot | undefined): string {
    if (!slot || slot.type === 'EMPTY') return '';
    
    const icons: Record<string, string> = {
      'CLASS': 'school',
      'TUTORIA': 'person',
      'GUARDIA': 'security',
      'MEETING': 'event'
    };
    
    return icons[slot.type] || '';
  }
}
