import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { MatriculacionesService, Matriculacion } from '../../core/services/matriculaciones.service';
import { UsersService } from '../../core/services/users.service';
import { CiclosService, Ciclo } from '../../core/services/ciclos.service';
import Swal from 'sweetalert2';

interface Usuario {
  id: number;
  nombre: string;
  tipo_id: number;
}

@Component({
  selector: 'app-matriculaciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    TranslateModule,
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>{{ 'MATRICULACIONES' | translate }}</h1>
        <button mat-raised-button color="primary" (click)="openNewDialog()" *ngIf="isAdmin()">
          <mat-icon>add</mat-icon>
          {{ 'COMMON.ADD' | translate }}
        </button>
      </div>

      <div *ngIf="loading()" class="loading">
        <mat-spinner></mat-spinner>
      </div>

      <table
        mat-table
        [dataSource]="matriculaciones()"
        class="matriculaciones-table"
        *ngIf="!loading()"
      >
        <ng-container matColumnDef="alumno">
          <th mat-header-cell *matHeaderCellDef>{{ 'USUARIOS.ALUMNO' | translate }}</th>
          <td mat-cell *matCellDef="let element">{{ element.alumno_nombre }}</td>
        </ng-container>

        <ng-container matColumnDef="ciclo">
          <th mat-header-cell *matHeaderCellDef>{{ 'CICLOS' | translate }}</th>
          <td mat-cell *matCellDef="let element">{{ element.ciclo_nombre }}</td>
        </ng-container>

        <ng-container matColumnDef="curso">
          <th mat-header-cell *matHeaderCellDef>{{ 'MODULOS.CURSO' | translate }}</th>
          <td mat-cell *matCellDef="let element">{{ element.curso }}</td>
        </ng-container>

        <ng-container matColumnDef="fecha">
          <th mat-header-cell *matHeaderCellDef>{{ 'MATRICULACIONES.FECHA' | translate }}</th>
          <td mat-cell *matCellDef="let element">{{ element.fecha | date: 'dd/MM/yyyy' }}</td>
        </ng-container>

        <ng-container matColumnDef="actions" *ngIf="isAdmin()">
          <th mat-header-cell *matHeaderCellDef>{{ 'COMMON.ACTIONS' | translate }}</th>
          <td mat-cell *matCellDef="let element">
            <button mat-icon-button (click)="editMatriculacion(element)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button (click)="deleteMatriculacion(element)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 20px;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .matriculaciones-table {
        width: 100%;
        border-collapse: collapse;
      }
      .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 300px;
      }
    `,
  ],
})
export class MatriculacionesComponent implements OnInit {
  matriculaciones = signal<Matriculacion[]>([]);
  alumnos = signal<Usuario[]>([]);
  ciclos = signal<Ciclo[]>([]);
  loading = signal(true);
  displayedColumns = ['alumno', 'ciclo', 'curso', 'fecha', 'actions'];

  private matriculacionesService = inject(MatriculacionesService);
  private usersService = inject(UsersService);
  private ciclosService = inject(CiclosService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    Promise.all([
      new Promise<void>((resolve) => {
        this.matriculacionesService.getAllMatriculaciones().subscribe({
          next: (matriculaciones) => {
            this.matriculaciones.set(matriculaciones);
            resolve();
          },
          error: (err) => {
            console.error('Error loading matriculaciones:', err);
            resolve();
          },
        });
      }),
      new Promise<void>((resolve) => {
        this.usersService.filterUserByRole(4).subscribe({
          next: (users) => {
            this.alumnos.set(users);
            resolve();
          },
          error: (err) => {
            console.error('Error loading alumnos:', err);
            resolve();
          },
        });
      }),
      new Promise<void>((resolve) => {
        this.ciclosService.getAllCiclos().subscribe({
          next: (ciclos) => {
            this.ciclos.set(ciclos);
            resolve();
          },
          error: (err) => {
            console.error('Error loading ciclos:', err);
            resolve();
          },
        });
      }),
    ]).then(() => {
      this.loading.set(false);
    });
  }

  openNewDialog(): void {
    Swal.fire({
      title: 'Nueva Matriculación',
      html: `
        <select id="alum_id" class="swal2-input">
          <option value="">Seleccionar Alumno</option>
          ${this.alumnos()
            .map((a) => `<option value="${a.id}">${a.nombre}</option>`)
            .join('')}
        </select>
        <select id="ciclo_id" class="swal2-input">
          <option value="">Seleccionar Ciclo</option>
          ${this.ciclos()
            .map((c) => `<option value="${c.id}">${c.nombre}</option>`)
            .join('')}
        </select>
        <select id="curso" class="swal2-input">
          <option value="">Seleccionar Curso</option>
          <option value="1">1º Curso</option>
          <option value="2">2º Curso</option>
        </select>
        <input type="date" id="fecha" class="swal2-input">
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear',
    }).then((result) => {
      if (result.isConfirmed) {
        const matriculacion = {
          alum_id: parseInt((document.getElementById('alum_id') as HTMLSelectElement)?.value),
          ciclo_id: parseInt((document.getElementById('ciclo_id') as HTMLSelectElement)?.value),
          curso: parseInt((document.getElementById('curso') as HTMLSelectElement)?.value),
          fecha: (document.getElementById('fecha') as HTMLInputElement)?.value,
        };
        this.createMatriculacion(matriculacion);
      }
    });
  }

  createMatriculacion(matriculacion: any): void {
    this.matriculacionesService.createMatriculacion(matriculacion).subscribe({
      next: () => {
        this.snackBar.open('Matriculación creada correctamente', 'Close', { duration: 3000 });
        this.loadData();
      },
      error: (err) => {
        console.error('Error creating matriculacion:', err);
        this.snackBar.open('Error al crear matriculación', 'Close', { duration: 3000 });
      },
    });
  }

  editMatriculacion(matriculacion: Matriculacion): void {
    Swal.fire({
      title: 'Editar Matriculación',
      html: `
        <select id="alum_id" class="swal2-input">
          ${this.alumnos()
            .map(
              (a) =>
                `<option value="${a.id}" ${a.id === matriculacion.alum_id ? 'selected' : ''}>${a.nombre}</option>`,
            )
            .join('')}
        </select>
        <select id="ciclo_id" class="swal2-input">
          ${this.ciclos()
            .map(
              (c) =>
                `<option value="${c.id}" ${c.id === matriculacion.ciclo_id ? 'selected' : ''}>${c.nombre}</option>`,
            )
            .join('')}
        </select>
        <select id="curso" class="swal2-input">
          <option value="1" ${matriculacion.curso === 1 ? 'selected' : ''}>1º Curso</option>
          <option value="2" ${matriculacion.curso === 2 ? 'selected' : ''}>2º Curso</option>
        </select>
        <input type="date" id="fecha" class="swal2-input" value="${matriculacion.fecha}">
      `,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = {
          alum_id: parseInt((document.getElementById('alum_id') as HTMLSelectElement)?.value),
          ciclo_id: parseInt((document.getElementById('ciclo_id') as HTMLSelectElement)?.value),
          curso: parseInt((document.getElementById('curso') as HTMLSelectElement)?.value),
          fecha: (document.getElementById('fecha') as HTMLInputElement)?.value,
        };
        this.matriculacionesService
          .updateMatriculacion(matriculacion.id, updated as any)
          .subscribe({
            next: () => {
              this.snackBar.open('Matriculación actualizada correctamente', 'Close', {
                duration: 3000,
              });
              this.loadData();
            },
            error: (err) => {
              console.error('Error updating matriculacion:', err);
              this.snackBar.open('Error al actualizar matriculación', 'Close', { duration: 3000 });
            },
          });
      }
    });
  }

  deleteMatriculacion(matriculacion: Matriculacion): void {
    Swal.fire({
      title: '¿Eliminar matriculación?',
      text: `¿Está seguro de que desea eliminar esta matriculación?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.matriculacionesService.deleteMatriculacion(matriculacion.id).subscribe({
          next: () => {
            this.snackBar.open('Matriculación eliminada correctamente', 'Close', {
              duration: 3000,
            });
            this.loadData();
          },
          error: (err) => {
            console.error('Error deleting matriculacion:', err);
            this.snackBar.open('Error al eliminar matriculación', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }

  isAdmin(): boolean {
    const user = this.authService.currentUser();
    return user?.tipo_id === 1 || user?.tipo_id === 2;
  }
}
