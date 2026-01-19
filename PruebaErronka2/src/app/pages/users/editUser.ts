import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ 'USER.EDIT' | translate }}</h2>
    <mat-dialog-content>
      <form [formGroup]="editForm" class="edit-form">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'USER.NAME' | translate }}</mat-label>
          <input matInput formControlName="nombre" required>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'USER.SURNAME' | translate }}</mat-label>
          <input matInput formControlName="apellidos" required>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'USER.USERNAME' | translate }}</mat-label>
          <input matInput formControlName="username" required>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'USER.EMAIL' | translate }}</mat-label>
          <input matInput formControlName="email" type="email" required>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'USER.ROLE' | translate }}</mat-label>
          <mat-select formControlName="role" required>
            <mat-option [value]="1">{{ 'ROLE.GOD' | translate }}</mat-option>
            <mat-option [value]="2">{{ 'ROLE.ADMIN' | translate }}</mat-option>
            <mat-option [value]="3">{{ 'ROLE.TEACHER' | translate }}</mat-option>
            <mat-option [value]="4">{{ 'ROLE.STUDENT' | translate }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'USER.DNI' | translate }}</mat-label>
          <input matInput formControlName="dni">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'USER.PHONE1' | translate }}</mat-label>
          <input matInput formControlName="telefono1">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'USER.PHONE2' | translate }}</mat-label>
          <input matInput formControlName="telefono2">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">{{ 'COMMON.CANCEL' | translate }}</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="editForm.invalid">
        {{ 'COMMON.SAVE' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
    }
  `],
})
export class EditUserDialogComponent {
  editForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User,
    private http: HttpClient
  ) {
    this.editForm = this.fb.group({
      nombre: [data.nombre, Validators.required],
      apellidos: [data.apellidos, Validators.required],
      username: [data.username, Validators.required],
      email: [data.email, [Validators.required, Validators.email]],
      role: [data.tipo_id, Validators.required],
      dni: [data.dni],
      telefono1: [data.telefono1],
      telefono2: [data.telefono2],
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.editForm.valid) {
      const apiUrl = Array.isArray(environment.apiUrl) ? environment.apiUrl.join('') : environment.apiUrl;
      this.http.put(`${apiUrl}/updateUser/${this.data.username}`, this.editForm.value).subscribe({
        next: () => {
          this.dialogRef.close(this.editForm.value);
        },
        error: (err) => {
          console.error('Error updating user:', err);
          // Optionally show error message
        }
      });
    }
  }
}