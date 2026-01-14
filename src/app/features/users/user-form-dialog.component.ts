import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { User, UserRole } from '../../core/models/user.model';

interface DialogData {
  user: User | null;
  isEdit: boolean;
}

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    TranslateModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.isEdit ? ('USER.EDIT' | translate) : ('USER.CREATE' | translate) }}</h2>
    
    <mat-dialog-content>
      <form [formGroup]="userForm" class="user-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'USER.USERNAME' | translate }}</mat-label>
          <input matInput formControlName="username" required>
          @if (userForm.get('username')?.hasError('required')) {
            <mat-error>{{ 'VALIDATION.REQUIRED' | translate }}</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'USER.NAME' | translate }}</mat-label>
          <input matInput formControlName="name" required>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'USER.SURNAME' | translate }}</mat-label>
          <input matInput formControlName="surname" required>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'USER.EMAIL' | translate }}</mat-label>
          <input matInput formControlName="email" type="email" required>
          @if (userForm.get('email')?.hasError('email')) {
            <mat-error>{{ 'VALIDATION.EMAIL' | translate }}</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'USER.ROLE' | translate }}</mat-label>
          <mat-select formControlName="role" required>
            @for (role of availableRoles; track role) {
              <mat-option [value]="role">{{ 'ROLE.' + role | translate }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <!-- Ikaslearen eremu espezifikoak -->
        @if (userForm.get('role')?.value === 'STUDENT') {
          <div class="student-fields">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'USER.CYCLE' | translate }}</mat-label>
              <mat-select formControlName="cycle">
                <mat-option value="1DAM">1º DAM</mat-option>
                <mat-option value="2DAM">2º DAM</mat-option>
                <mat-option value="1DAW">1º DAW</mat-option>
                <mat-option value="2DAW">2º DAW</mat-option>
                <mat-option value="1ASIR">1º ASIR</mat-option>
                <mat-option value="2ASIR">2º ASIR</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'USER.GROUP' | translate }}</mat-label>
              <mat-select formControlName="group">
                <mat-option value="A">A</mat-option>
                <mat-option value="B">B</mat-option>
                <mat-option value="C">C</mat-option>
                <mat-option value="D">D</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-checkbox formControlName="isDual">{{ 'USER.IS_DUAL' | translate }}</mat-checkbox>
          </div>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'COMMON.CANCEL' | translate }}</button>
      <button mat-raised-button color="primary" 
              [disabled]="!userForm.valid" 
              (click)="onSave()">
        {{ 'COMMON.SAVE' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .user-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 350px;
    }
    .full-width {
      width: 100%;
    }
    .student-fields {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
      margin-top: 8px;
    }
    .student-fields mat-form-field {
      flex: 1;
      min-width: 140px;
    }
    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }
    @media (max-width: 480px) {
      .user-form {
        min-width: auto;
      }
    }
  `]
})
export class UserFormDialogComponent {
  userForm: FormGroup;
  availableRoles = [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.userForm = this.fb.group({
      username: [data.user?.username || '', Validators.required],
      name: [data.user?.name || '', Validators.required],
      surname: [data.user?.surname || '', Validators.required],
      email: [data.user?.email || '', [Validators.required, Validators.email]],
      role: [data.user?.role || UserRole.STUDENT, Validators.required],
      cycle: [data.user?.cycle || ''],
      course: [data.user?.course || ''],
      group: [data.user?.group || ''],
      isDual: [data.user?.isDual || false]
    });
  }

  onSave(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      
      // Ikaslearen eremuak garbitu ikaslea ez bada
      if (formValue.role !== UserRole.STUDENT) {
        delete formValue.cycle;
        delete formValue.course;
        delete formValue.group;
        delete formValue.isDual;
      }
      
      this.dialogRef.close(formValue);
    }
  }
}
