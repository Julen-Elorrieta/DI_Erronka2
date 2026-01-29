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
import { HorariosService, Horario } from '../../core/services/horarios.service';
import { UsersService } from '../../core/services/users.service';
import { ModulosService, Modulo } from '../../core/services/modulos.service';
import Swal from 'sweetalert2';

interface Usuario {
  id: number;
  nombre: string;
  tipo_id: number;
}

@Component({
  selector: 'app-horarios',
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
    TranslateModule
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>{{ 'HORARIOS' | translate }}</h1>
        <button mat-raised-button color="primary" (click)="openNewDialog()" *ngIf="isAdmin()">
          <mat-icon>add</mat-icon>
          {{ 'COMMON.ADD' | translate }}
        </button>
      </div>

      <div *ngIf="loading()" class="loading">
        <mat-spinner></mat-spinner>
      </div>

      <table mat-table [dataSource]="horarios()" class="horarios-table" *ngIf="!loading()">
        <ng-container matColumnDef="dia">
          <th mat-header-cell *matHeaderCellDef>{{ 'HORARIOS.DIA' | translate }}</th>
          <td mat-cell *matCellDef="let element">{{ element.dia }}</td>
        </ng-container>

        <ng-container matColumnDef="hora">
          <th mat-header-cell *matHeaderCellDef>{{ 'HORARIOS.HORA' | translate }}</th>
          <td mat-cell *matCellDef="let element">Hora {{ element.hora }}</td>
        </ng-container>

        <ng-container matColumnDef="profesor">
          <th mat-header-cell *matHeaderCellDef>{{ 'HORARIOS.PROFESOR' | translate }}</th>
          <td mat-cell *matCellDef="let element">{{ element.profesor_nombre }}</td>
        </ng-container>

        <ng-container matColumnDef="modulo">
          <th mat-header-cell *matHeaderCellDef>{{ 'MODULOS' | translate }}</th>
          <td mat-cell *matCellDef="let element">{{ element.modulo_nombre }}</td>
        </ng-container>

        <ng-container matColumnDef="aula">
          <th mat-header-cell *matHeaderCellDef>{{ 'HORARIOS.AULA' | translate }}</th>
          <td mat-cell *matCellDef="let element">{{ element.aula }}</td>
        </ng-container>

        <ng-container matColumnDef="observaciones">
          <th mat-header-cell *matHeaderCellDef>{{ 'HORARIOS.OBSERVACIONES' | translate }}</th>
          <td mat-cell *matCellDef="let element">{{ element.observaciones }}</td>
        </ng-container>

        <ng-container matColumnDef="actions" *ngIf="isAdmin()">
          <th mat-header-cell *matHeaderCellDef>{{ 'COMMON.ACTIONS' | translate }}</th>
          <td mat-cell *matCellDef="let element">
            <button mat-icon-button (click)="editHorario(element)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button (click)="deleteHorario(element)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .horarios-table {
      width: 100%;
      border-collapse: collapse;
    }
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 300px;
    }
  `]
})
export class HorariosComponent implements OnInit {
  horarios = signal<Horario[]>([]);
  profesores = signal<Usuario[]>([]);
  modulos = signal<Modulo[]>([]);
  loading = signal(true);
  displayedColumns = ['dia', 'hora', 'profesor', 'modulo', 'aula', 'observaciones', 'actions'];

  private horariosService = inject(HorariosService);
  private usersService = inject(UsersService);
  private modulosService = inject(ModulosService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
  horas = [1, 2, 3, 4, 5, 6];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    Promise.all([
      new Promise<void>(resolve => {
        this.horariosService.getAllHorarios().subscribe({
          next: (horarios) => {
            this.horarios.set(horarios);
            resolve();
          },
          error: (err) => {
            console.error('Error loading horarios:', err);
            resolve();
          }
        });
      }),
      new Promise<void>(resolve => {
        this.usersService.filterUserByRole(3).subscribe({
          next: (users) => {
            this.profesores.set(users);
            resolve();
          },
          error: (err) => {
            console.error('Error loading profesores:', err);
            resolve();
          }
        });
      }),
      new Promise<void>(resolve => {
        this.modulosService.getAllModulos().subscribe({
          next: (modulos) => {
            this.modulos.set(modulos);
            resolve();
          },
          error: (err) => {
            console.error('Error loading modulos:', err);
            resolve();
          }
        });
      })
    ]).then(() => {
      this.loading.set(false);
    });
  }

  openNewDialog(): void {
    Swal.fire({
      title: 'Nuevo Horario',
      html: `
        <select id="dia" class="swal2-input">
          <option value="">Seleccionar Día</option>
          ${this.dias.map(d => `<option value="${d}">${d}</option>`).join('')}
        </select>
        <select id="hora" class="swal2-input">
          <option value="">Seleccionar Hora</option>
          ${this.horas.map(h => `<option value="${h}">Hora ${h}</option>`).join('')}
        </select>
        <select id="profe_id" class="swal2-input">
          <option value="">Seleccionar Profesor</option>
          ${this.profesores().map(p => `<option value="${p.id}">${p.nombre}</option>`).join('')}
        </select>
        <select id="modulo_id" class="swal2-input">
          <option value="">Seleccionar Módulo</option>
          ${this.modulos().map(m => `<option value="${m.id}">${m.nombre}</option>`).join('')}
        </select>
        <input type="text" id="aula" class="swal2-input" placeholder="Aula">
        <textarea id="observaciones" class="swal2-textarea" placeholder="Observaciones"></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear'
    }).then((result) => {
      if (result.isConfirmed) {
        const horario = {
          dia: (document.getElementById('dia') as HTMLSelectElement)?.value,
          hora: parseInt((document.getElementById('hora') as HTMLSelectElement)?.value),
          profe_id: parseInt((document.getElementById('profe_id') as HTMLSelectElement)?.value),
          modulo_id: parseInt((document.getElementById('modulo_id') as HTMLSelectElement)?.value),
          aula: (document.getElementById('aula') as HTMLInputElement)?.value,
          observaciones: (document.getElementById('observaciones') as HTMLTextAreaElement)?.value
        };
        this.createHorario(horario);
      }
    });
  }

  createHorario(horario: any): void {
    this.horariosService.createHorario(horario).subscribe({
      next: () => {
        this.snackBar.open('Horario creado correctamente', 'Close', { duration: 3000 });
        this.loadData();
      },
      error: (err) => {
        console.error('Error creating horario:', err);
        this.snackBar.open('Error al crear horario', 'Close', { duration: 3000 });
      }
    });
  }

  editHorario(horario: Horario): void {
    Swal.fire({
      title: 'Editar Horario',
      html: `
        <select id="dia" class="swal2-input">
          ${this.dias.map(d => `<option value="${d}" ${d === horario.dia ? 'selected' : ''}>${d}</option>`).join('')}
        </select>
        <select id="hora" class="swal2-input">
          ${this.horas.map(h => `<option value="${h}" ${h === horario.hora ? 'selected' : ''}>Hora ${h}</option>`).join('')}
        </select>
        <select id="profe_id" class="swal2-input">
          ${this.profesores().map(p => `<option value="${p.id}" ${p.id === horario.profe_id ? 'selected' : ''}>${p.nombre}</option>`).join('')}
        </select>
        <select id="modulo_id" class="swal2-input">
          ${this.modulos().map(m => `<option value="${m.id}" ${m.id === horario.modulo_id ? 'selected' : ''}>${m.nombre}</option>`).join('')}
        </select>
        <input type="text" id="aula" class="swal2-input" placeholder="Aula" value="${horario.aula}">
        <textarea id="observaciones" class="swal2-textarea" placeholder="Observaciones">${horario.observaciones || ''}</textarea>
      `,
      showCancelButton: true,
      confirmButtonText: 'Actualizar'
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = {
          dia: (document.getElementById('dia') as HTMLSelectElement)?.value,
          hora: parseInt((document.getElementById('hora') as HTMLSelectElement)?.value),
          profe_id: parseInt((document.getElementById('profe_id') as HTMLSelectElement)?.value),
          modulo_id: parseInt((document.getElementById('modulo_id') as HTMLSelectElement)?.value),
          aula: (document.getElementById('aula') as HTMLInputElement)?.value,
          observaciones: (document.getElementById('observaciones') as HTMLTextAreaElement)?.value
        };
        this.horariosService.updateHorario(horario.id, updated as any).subscribe({
          next: () => {
            this.snackBar.open('Horario actualizado correctamente', 'Close', { duration: 3000 });
            this.loadData();
          },
          error: (err) => {
            console.error('Error updating horario:', err);
            this.snackBar.open('Error al actualizar horario', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteHorario(horario: Horario): void {
    Swal.fire({
      title: '¿Eliminar horario?',
      text: `¿Está seguro de que desea eliminar este horario?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.horariosService.deleteHorario(horario.id).subscribe({
          next: () => {
            this.snackBar.open('Horario eliminado correctamente', 'Close', { duration: 3000 });
            this.loadData();
          },
          error: (err) => {
            console.error('Error deleting horario:', err);
            this.snackBar.open('Error al eliminar horario', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  isAdmin(): boolean {
    const user = this.authService.currentUser();
    return user?.tipo_id === 1 || user?.tipo_id === 2;
  }
}
