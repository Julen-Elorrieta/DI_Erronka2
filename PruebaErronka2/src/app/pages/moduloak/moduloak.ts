import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { ModulosService, Modulo } from '../../core/services/modulos.service';
import { CiclosService, Ciclo } from '../../core/services/ciclos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modulos',
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
        <h1>{{ 'MODULOS' | translate }}</h1>
        <button mat-raised-button color="primary" (click)="openNewDialog()" *ngIf="isAdmin()">
          <mat-icon>add</mat-icon>
          {{ 'COMMON.ADD' | translate }}
        </button>
      </div>

      <div *ngIf="loading()" class="loading">
        <mat-spinner></mat-spinner>
      </div>

      <table mat-table [dataSource]="modulos()" class="modulos-table" *ngIf="!loading()">
        <ng-container matColumnDef="nombre">
          <th mat-header-cell *matHeaderCellDef>{{ 'MODULOS.NOMBRE' | translate }}</th>
          <td mat-cell *matCellDef="let element">{{ element.nombre }}</td>
        </ng-container>

        <ng-container matColumnDef="nombre_eus">
          <th mat-header-cell *matHeaderCellDef>Euskera</th>
          <td mat-cell *matCellDef="let element">{{ element.nombre_eus }}</td>
        </ng-container>

        <ng-container matColumnDef="horas">
          <th mat-header-cell *matHeaderCellDef>{{ 'MODULOS.HORAS' | translate }}</th>
          <td mat-cell *matCellDef="let element">{{ element.horas }}</td>
        </ng-container>

        <ng-container matColumnDef="ciclo">
          <th mat-header-cell *matHeaderCellDef>{{ 'CICLOS' | translate }}</th>
          <td mat-cell *matCellDef="let element">{{ element.ciclo_nombre }}</td>
        </ng-container>

        <ng-container matColumnDef="curso">
          <th mat-header-cell *matHeaderCellDef>{{ 'MODULOS.CURSO' | translate }}</th>
          <td mat-cell *matCellDef="let element">{{ element.curso }}</td>
        </ng-container>

        <ng-container matColumnDef="actions" *ngIf="isAdmin()">
          <th mat-header-cell *matHeaderCellDef>{{ 'COMMON.ACTIONS' | translate }}</th>
          <td mat-cell *matCellDef="let element">
            <button mat-icon-button (click)="editModulo(element)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button (click)="deleteModulo(element)">
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
    .modulos-table {
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
export class ModulosComponent implements OnInit {
  modulos = signal<Modulo[]>([]);
  ciclos = signal<Ciclo[]>([]);
  loading = signal(true);
  displayedColumns = ['nombre', 'nombre_eus', 'horas', 'ciclo', 'curso', 'actions'];

  private modulosService = inject(ModulosService);
  private ciclosService = inject(CiclosService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);

  ngOnInit(): void {
    this.loadCiclos();
    this.loadModulos();
  }

  loadModulos(): void {
    this.loading.set(true);
    this.modulosService.getAllModulos().subscribe({
      next: (modulos) => {
        this.modulos.set(modulos);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading modulos:', err);
        this.loading.set(false);
        this.snackBar.open('Error al cargar módulos', 'Close', { duration: 3000 });
      }
    });
  }

  loadCiclos(): void {
    this.ciclosService.getAllCiclos().subscribe({
      next: (ciclos) => this.ciclos.set(ciclos),
      error: (err) => console.error('Error loading ciclos:', err)
    });
  }

  openNewDialog(): void {
    Swal.fire({
      title: 'Nuevo Módulo',
      html: `
        <input type="text" id="nombre" class="swal2-input" placeholder="Nombre">
        <input type="text" id="nombre_eus" class="swal2-input" placeholder="Nombre Euskera">
        <input type="number" id="horas" class="swal2-input" placeholder="Horas">
        <select id="ciclo_id" class="swal2-input">
          <option value="">Seleccionar Ciclo</option>
          ${this.ciclos().map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')}
        </select>
        <input type="number" id="curso" class="swal2-input" placeholder="Curso (1 o 2)">
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear'
    }).then((result) => {
      if (result.isConfirmed) {
        const modulo = {
          nombre: (document.getElementById('nombre') as HTMLInputElement)?.value,
          nombre_eus: (document.getElementById('nombre_eus') as HTMLInputElement)?.value,
          horas: parseInt((document.getElementById('horas') as HTMLInputElement)?.value),
          ciclo_id: parseInt((document.getElementById('ciclo_id') as HTMLSelectElement)?.value),
          curso: parseInt((document.getElementById('curso') as HTMLInputElement)?.value)
        };
        this.createModulo(modulo);
      }
    });
  }

  createModulo(modulo: any): void {
    this.modulosService.createModulo(modulo).subscribe({
      next: () => {
        this.snackBar.open('Módulo creado correctamente', 'Close', { duration: 3000 });
        this.loadModulos();
      },
      error: (err) => {
        console.error('Error creating modulo:', err);
        this.snackBar.open('Error al crear módulo', 'Close', { duration: 3000 });
      }
    });
  }

  editModulo(modulo: Modulo): void {
    Swal.fire({
      title: 'Editar Módulo',
      html: `
        <input type="text" id="nombre" class="swal2-input" placeholder="Nombre" value="${modulo.nombre}">
        <input type="text" id="nombre_eus" class="swal2-input" placeholder="Nombre Euskera" value="${modulo.nombre_eus || ''}">
        <input type="number" id="horas" class="swal2-input" placeholder="Horas" value="${modulo.horas}">
        <select id="ciclo_id" class="swal2-input">
          ${this.ciclos().map(c => `<option value="${c.id}" ${c.id === modulo.ciclo_id ? 'selected' : ''}>${c.nombre}</option>`).join('')}
        </select>
        <input type="number" id="curso" class="swal2-input" placeholder="Curso" value="${modulo.curso}">
      `,
      showCancelButton: true,
      confirmButtonText: 'Actualizar'
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = {
          nombre: (document.getElementById('nombre') as HTMLInputElement)?.value,
          nombre_eus: (document.getElementById('nombre_eus') as HTMLInputElement)?.value,
          horas: parseInt((document.getElementById('horas') as HTMLInputElement)?.value),
          ciclo_id: parseInt((document.getElementById('ciclo_id') as HTMLSelectElement)?.value),
          curso: parseInt((document.getElementById('curso') as HTMLInputElement)?.value)
        };
        this.modulosService.updateModulo(modulo.id, updated as any).subscribe({
          next: () => {
            this.snackBar.open('Módulo actualizado correctamente', 'Close', { duration: 3000 });
            this.loadModulos();
          },
          error: (err) => {
            console.error('Error updating modulo:', err);
            this.snackBar.open('Error al actualizar módulo', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteModulo(modulo: Modulo): void {
    Swal.fire({
      title: '¿Eliminar módulo?',
      text: `¿Está seguro de que desea eliminar ${modulo.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.modulosService.deleteModulo(modulo.id).subscribe({
          next: () => {
            this.snackBar.open('Módulo eliminado correctamente', 'Close', { duration: 3000 });
            this.loadModulos();
          },
          error: (err) => {
            console.error('Error deleting modulo:', err);
            this.snackBar.open('Error al eliminar módulo', 'Close', { duration: 3000 });
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
