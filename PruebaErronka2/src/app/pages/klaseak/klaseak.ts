import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { CiclosService, Ciclo } from '../../core/services/ciclos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ciclos',
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
    MatDialogModule,
    TranslateModule
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>{{ 'CICLOS' | translate }}</h1>
        <button mat-raised-button color="primary" (click)="openNewDialog()" *ngIf="isAdmin()">
          <mat-icon>add</mat-icon>
          {{ 'COMMON.ADD' | translate }}
        </button>
      </div>

      <div *ngIf="loading()" class="loading">
        <mat-spinner></mat-spinner>
      </div>

      <table mat-table [dataSource]="ciclos()" class="ciclos-table" *ngIf="!loading()">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>ID</th>
          <td mat-cell *matCellDef="let element">{{ element.id }}</td>
        </ng-container>

        <ng-container matColumnDef="nombre">
          <th mat-header-cell *matHeaderCellDef>{{ 'CICLOS.NOMBRE' | translate }}</th>
          <td mat-cell *matCellDef="let element">{{ element.nombre }}</td>
        </ng-container>

        <ng-container matColumnDef="actions" *ngIf="isAdmin()">
          <th mat-header-cell *matHeaderCellDef>{{ 'COMMON.ACTIONS' | translate }}</th>
          <td mat-cell *matCellDef="let element">
            <button mat-icon-button (click)="editCiclo(element)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button (click)="deleteCiclo(element)">
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
    .ciclos-table {
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
export class CiclosComponent implements OnInit {
  ciclos = signal<Ciclo[]>([]);
  loading = signal(true);
  displayedColumns = ['id', 'nombre', 'actions'];

  private ciclosService = inject(CiclosService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.loadCiclos();
  }

  loadCiclos(): void {
    this.loading.set(true);
    this.ciclosService.getAllCiclos().subscribe({
      next: (ciclos) => {
        this.ciclos.set(ciclos);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading ciclos:', err);
        this.loading.set(false);
        this.snackBar.open(this.translate.instant('ERROR.LOADING_CICLOS'), 'Close', { duration: 3000 });
      }
    });
  }

  openNewDialog(): void {

    Swal.fire({
      title: 'Nuevo Ciclo',
      html: `<input type="text" id="nombre" class="swal2-input" placeholder="Nombre del ciclo">`,
      showCancelButton: true,
      confirmButtonText: 'Crear',
      didOpen: () => {
        document.getElementById('nombre')?.focus();
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const nombre = (document.getElementById('nombre') as HTMLInputElement)?.value;
        if (nombre) {
          this.createCiclo({ nombre } as any);
        }
      }
    });
  }

  createCiclo(ciclo: any): void {
    this.ciclosService.createCiclo(ciclo).subscribe({
      next: () => {
        this.snackBar.open('Ciclo creado correctamente', 'Close', { duration: 3000 });
        this.loadCiclos();
      },
      error: (err) => {
        console.error('Error creating ciclo:', err);
        this.snackBar.open('Error al crear ciclo', 'Close', { duration: 3000 });
      }
    });
  }

  editCiclo(ciclo: Ciclo): void {
    Swal.fire({
      title: 'Editar Ciclo',
      html: `<input type="text" id="nombre" class="swal2-input" placeholder="Nombre del ciclo" value="${ciclo.nombre}">`,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      didOpen: () => {
        document.getElementById('nombre')?.focus();
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const nombre = (document.getElementById('nombre') as HTMLInputElement)?.value;
        if (nombre) {
          this.ciclosService.updateCiclo(ciclo.id, { nombre } as any).subscribe({
            next: () => {
              this.snackBar.open('Ciclo actualizado correctamente', 'Close', { duration: 3000 });
              this.loadCiclos();
            },
            error: (err) => {
              console.error('Error updating ciclo:', err);
              this.snackBar.open('Error al actualizar ciclo', 'Close', { duration: 3000 });
            }
          });
        }
      }
    });
  }

  deleteCiclo(ciclo: Ciclo): void {
    Swal.fire({
      title: '¿Eliminar ciclo?',
      text: `¿Está seguro de que desea eliminar el ciclo ${ciclo.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ciclosService.deleteCiclo(ciclo.id).subscribe({
          next: () => {
            this.snackBar.open('Ciclo eliminado correctamente', 'Close', { duration: 3000 });
            this.loadCiclos();
          },
          error: (err) => {
            console.error('Error deleting ciclo:', err);
            this.snackBar.open('Error al eliminar ciclo', 'Close', { duration: 3000 });
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
