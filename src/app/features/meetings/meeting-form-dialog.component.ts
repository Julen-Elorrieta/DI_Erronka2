import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { TranslateModule } from '@ngx-translate/core';
import { Meeting, MeetingStatus } from '../../core/models/meeting.model';
import { EducationalCenter } from '../../core/models/center.model';

interface DialogData {
  meeting: Meeting | null;
  center?: EducationalCenter;
}

@Component({
  selector: 'app-meeting-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTimepickerModule,
    TranslateModule
  ],
  template: `
    <h2 mat-dialog-title>{{ 'MEETING.CREATE' | translate }}</h2>
    
    <mat-dialog-content>
      <form [formGroup]="meetingForm" class="meeting-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'MEETING.TITLE' | translate }}</mat-label>
          <input matInput formControlName="title" required>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'MEETING.TOPIC' | translate }}</mat-label>
          <textarea matInput formControlName="topic" rows="3" required></textarea>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'MEETING.DATE' | translate }}</mat-label>
            <input matInput type="date" formControlName="date" required>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'MEETING.HOUR' | translate }}</mat-label>
            <mat-select formControlName="hour" required>
              <mat-option [value]="1">1. ordua (08:00 - 09:00)</mat-option>
              <mat-option [value]="2">2. ordua (09:00 - 10:00)</mat-option>
              <mat-option [value]="3">3. ordua (10:15 - 11:15)</mat-option>
              <mat-option [value]="4">4. ordua (11:15 - 12:15)</mat-option>
              <mat-option [value]="5">5. ordua (12:30 - 13:30)</mat-option>
              <mat-option [value]="6">6. ordua (13:30 - 14:30)</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'MEETING.CLASSROOM' | translate }}</mat-label>
          <input matInput formControlName="classroom" placeholder="Adib: A-301">
        </mat-form-field>

        @if (data.center) {
          <div class="center-info">
            <h4>{{ 'CENTER.SELECTED' | translate }}</h4>
            <p><strong>{{ data.center.name }}</strong></p>
            <p>{{ data.center.address }}, {{ data.center.dmunic }}</p>
          </div>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'COMMON.CANCEL' | translate }}</button>
      <button mat-raised-button color="primary" 
              [disabled]="!meetingForm.valid" 
              (click)="onSave()">
        {{ 'COMMON.SAVE' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .meeting-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 400px;
    }
    .full-width {
      width: 100%;
    }
    .form-row {
      display: flex;
      gap: 16px;
    }
    .form-row mat-form-field {
      flex: 1;
    }
    .center-info {
      padding: 16px;
      background-color: #e3f2fd;
      border-radius: 8px;
      margin-top: 8px;
    }
    .center-info h4 {
      margin: 0 0 8px 0;
      color: var(--primary-color);
    }
    .center-info p {
      margin: 4px 0;
      font-size: 0.9rem;
    }
    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }
    @media (max-width: 480px) {
      .meeting-form {
        min-width: auto;
      }
      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class MeetingFormDialogComponent {
  meetingForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<MeetingFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.meetingForm = this.fb.group({
      title: ['', Validators.required],
      topic: ['', Validators.required],
      date: [new Date(), Validators.required],
      hour: [3, Validators.required],
      classroom: ['']
    });
  }

  onSave(): void {
    if (this.meetingForm.valid) {
      const formValue = this.meetingForm.value;
      
      const meeting: Omit<Meeting, 'id'> = {
        title: formValue.title,
        topic: formValue.topic,
        date: formValue.date,
        hour: formValue.hour,
        classroom: formValue.classroom || 'Zehazteke',
        status: MeetingStatus.PENDING,
        location: {
          center: this.data.center?.name || 'CIFP Elorrieta-Errekamari LHII',
          address: this.data.center?.address || 'Lehendakari Aguirre kalea, 184',
          latitude: this.data.center?.coordinates?.latitude,
          longitude: this.data.center?.coordinates?.longitude
        },
        participants: {
          teacherId: 0, // Zerbitzarian esleituko da
          studentId: 0
        }
      };
      
      this.dialogRef.close(meeting);
    }
  }
}
