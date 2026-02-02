/**
 * Erabiltzailea editatzeko elkarrizketa-koadroa
 * Erabiltzailearen datuak aldatzeko formularioa
 */
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../core/models/user.model';
import { ApiUtil } from '../../core/utils/api.util';

@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
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
          <input matInput formControlName="nombre" required />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'USER.SURNAME' | translate }}</mat-label>
          <input matInput formControlName="apellidos" required />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'USER.USERNAME' | translate }}</mat-label>
          <input matInput formControlName="username" required />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'USER.PASSWORD' | translate }}</mat-label>
          <input matInput formControlName="password" type="password" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'USER.EMAIL' | translate }}</mat-label>
          <input matInput formControlName="email" type="email" required />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'USER.ADDRESS' | translate }}</mat-label>
          <input matInput formControlName="direccion" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'USER.PHONE1' | translate }}</mat-label>
          <input matInput formControlName="telefono1" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'USER.PHONE2' | translate }}</mat-label>
          <input matInput formControlName="telefono2" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'USER.PHOTO_URL' | translate }}</mat-label>
          <input matInput formControlName="argazkia_url" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">{{ 'COMMON.CANCEL' | translate }}</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onSave()"
        [disabled]="editForm.invalid"
        style="color: white;"
      >
        {{ 'COMMON.SAVE' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .edit-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-width: 400px;
      }
    `,
  ],
})
export class EditUserDialogComponent {
  editForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User,
    private http: HttpClient,
  ) {
    this.editForm = this.fb.group({
      nombre: [data.nombre, Validators.required],
      apellidos: [data.apellidos, Validators.required],
      username: [data.username, Validators.required],
      password: [data.password],
      email: [data.email, [Validators.required, Validators.email]],
      direccion: [data.direccion],
      telefono1: [data.telefono1],
      telefono2: [data.telefono2],
      argazkia_url: [data.argazkia_url],
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.editForm.valid) {
      this.http
        .put(ApiUtil.buildUrl(`/updateUser/${this.data.id}`), this.editForm.value)
        .subscribe({
          next: () => {
            this.dialogRef.close(this.editForm.value);
          },
          error: (err) => {
            console.error('Error updating user:', err);
          },
        });
    }
  }
}
