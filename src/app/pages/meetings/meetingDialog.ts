import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Meeting } from '../../core/models/meeting.model';

@Component({
  selector: 'app-meeting-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    TranslateModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data?.id_reunion ? ('MEETING.EDIT' | translate) : ('MEETING.CREATE' | translate) }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="meetingForm" class="meeting-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'MEETING.TITLE' | translate }}</mat-label>
          <input matInput formControlName="title" required />
          <mat-error>{{ 'VALIDATION.REQUIRED' | translate }}</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'MEETING.TOPIC' | translate }}</mat-label>
          <input matInput formControlName="topic" required />
          <mat-error>{{ 'VALIDATION.REQUIRED' | translate }}</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'MEETING.DATE' | translate }}</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="date" required />
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error>{{ 'VALIDATION.REQUIRED' | translate }}</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'MEETING.HOUR' | translate }}</mat-label>
          <mat-select formControlName="hour" required>
            <mat-option *ngFor="let hour of hours" [value]="hour">
              {{ hour }}ª {{ 'SCHEDULE.HOUR' | translate }}
            </mat-option>
          </mat-select>
          <mat-error>{{ 'VALIDATION.REQUIRED' | translate }}</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'MEETING.CLASSROOM' | translate }}</mat-label>
          <input matInput formControlName="classroom" required />
          <mat-error>{{ 'VALIDATION.REQUIRED' | translate }}</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'MEETING.CENTER' | translate }}</mat-label>
          <input matInput formControlName="center" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'MEETING.ADDRESS' | translate }}</mat-label>
          <input matInput formControlName="address" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">{{ 'COMMON.CANCEL' | translate }}</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="meetingForm.invalid">
        {{ 'COMMON.SAVE' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .meeting-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-width: 400px;
      }
      .full-width {
        width: 100%;
      }
    `,
  ],
})
export class MeetingDialogComponent implements OnInit {
  meetingForm: FormGroup;
  hours = [1, 2, 3, 4, 5, 6];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MeetingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Meeting | null,
    private http: HttpClient,
  ) {
    this.meetingForm = this.fb.group({
      title: ['', Validators.required],
      topic: ['', Validators.required],
      date: ['', Validators.required],
      hour: ['', Validators.required],
      classroom: ['', Validators.required],
      center: [''],
      address: [''],
    });

    if (data) {
      this.meetingForm.patchValue(data);
    }
  }

  ngOnInit(): void {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.meetingForm.valid) {
      const formValue = this.meetingForm.value;
      // Transformar los datos al formato que espera el backend
      const meetingData = {
        title: formValue.title,
        topic: formValue.topic,
        fecha: formValue.date,
        hora: formValue.hour,
        classroom: formValue.classroom,
        center: formValue.center,
        address: formValue.address,
      };
      this.dialogRef.close(meetingData);
    }
  }
}
