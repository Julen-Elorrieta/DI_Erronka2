import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    TranslateModule,
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>{{ 'CICLOS' | translate }}</h1>
        @if (isAdmin()) {
          <button mat-raised-button color="primary" (click)="openNewDialog()">
            <mat-icon>add</mat-icon>
            {{ 'COMMON.ADD' | translate }}
          </button>
        }
      </div>

      @if (loading()) {
        <div class="loading">
          <mat-spinner></mat-spinner>
        </div>
      }

      @if (!loading()) {
        <table mat-table [dataSource]="ciclos()" class="ciclos-table">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>ID</th>
          <td mat-cell *matCellDef="let element">{{ element.id }}</td>
        </ng-container>

        <ng-container matColumnDef="nombre">
          <th mat-header-cell *matHeaderCellDef>{{ 'CICLOS.NOMBRE' | translate }}</th>
          <td mat-cell *matCellDef="let element">{{ element.nombre }}</td>
        </ng-container>

        @if (isAdmin()) {
          <ng-container matColumnDef="actions">
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
        }

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
      }
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
    `,
  ],
})
export class CiclosComponent implements OnInit {
  ciclos = signal<Ciclo[]>([]);
  loading = signal(true);
  displayedColumns = ['id', 'nombre', 'actions'];

  private ciclosService = inject(CiclosService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);

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
        this.snackBar.open(this.translate.instant('ERROR.LOADING_CICLOS'), 'Close', {
          duration: 3000,
        });
      },
    });
  }

  /**
   * Ziklo berria sortzeko dialogoa irekitzen du
   */
  openNewDialog(): void {
    Swal.fire({
      title: this.translate.instant('CICLOS.NEW'),
      html: `<input type="text" id="nombre" class="swal2-input" placeholder="${this.translate.instant('CICLOS.NAME_PLACEHOLDER')}">`,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('COMMON.CREATE'),
      cancelButtonText: this.translate.instant('COMMON.CANCEL'),
      didOpen: () => {
        document.getElementById('nombre')?.focus();
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const nombre = (document.getElementById('nombre') as HTMLInputElement)?.value;
        if (nombre) {
          this.createCiclo({ nombre } as any);
        }
      }
    });
  }

  /**
   * Ziklo berria sortzen du datu-basean
   * @param ciclo Sortu beharreko zikloaren datuak
   */
  createCiclo(ciclo: any): void {
    this.ciclosService.createCiclo(ciclo).subscribe({
      next: () => {
        this.snackBar.open(
          this.translate.instant('CICLOS.CREATED'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 },
        );
        this.loadCiclos();
      },
      error: (err) => {
        console.error('Errorea zikloa sortzean:', err);
        this.snackBar.open(
          this.translate.instant('CICLOS.ERROR_CREATE'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 },
        );
      },
    });
  }

  /**
   * Zikloa editatzeko dialogoa irekitzen du
   * @param ciclo Editatu beharreko zikloa
   */
  editCiclo(ciclo: Ciclo): void {
    Swal.fire({
      title: this.translate.instant('CICLOS.EDIT'),
      html: `<input type="text" id="nombre" class="swal2-input" placeholder="${this.translate.instant('CICLOS.NAME_PLACEHOLDER')}" value="${ciclo.nombre}">`,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('COMMON.UPDATE'),
      cancelButtonText: this.translate.instant('COMMON.CANCEL'),
      didOpen: () => {
        document.getElementById('nombre')?.focus();
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const nombre = (document.getElementById('nombre') as HTMLInputElement)?.value;
        if (nombre) {
          this.ciclosService.updateCiclo(ciclo.id, { nombre } as any).subscribe({
            next: () => {
              this.snackBar.open(
                this.translate.instant('CICLOS.UPDATED'),
                this.translate.instant('COMMON.CLOSE'),
                { duration: 3000 },
              );
              this.loadCiclos();
            },
            error: (err) => {
              console.error('Errorea zikloa eguneratzean:', err);
              this.snackBar.open(
                this.translate.instant('CICLOS.ERROR_UPDATE'),
                this.translate.instant('COMMON.CLOSE'),
                { duration: 3000 },
              );
            },
          });
        }
      }
    });
  }

  /**
   * Zikloa ezabatzeko baieztapena eskatzen du
   * @param ciclo Ezabatu beharreko zikloa
   */
  deleteCiclo(ciclo: Ciclo): void {
    Swal.fire({
      title: this.translate.instant('CICLOS.DELETE_CONFIRM'),
      text: this.translate.instant('CICLOS.DELETE_TEXT'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('COMMON.YES_DELETE'),
      cancelButtonText: this.translate.instant('COMMON.CANCEL'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.ciclosService.deleteCiclo(ciclo.id).subscribe({
          next: () => {
            this.snackBar.open(
              this.translate.instant('CICLOS.DELETED'),
              this.translate.instant('COMMON.CLOSE'),
              { duration: 3000 },
            );
            this.loadCiclos();
          },
          error: (err) => {
            console.error('Errorea zikloa ezabatzean:', err);
            this.snackBar.open(
              this.translate.instant('CICLOS.ERROR_DELETE'),
              this.translate.instant('COMMON.CLOSE'),
              { duration: 3000 },
            );
          },
        });
      }
    });
  }

  /**
   * Erabiltzailea administratzailea den egiaztatzen du
   * @returns true administratzailea bada
   */
  isAdmin(): boolean {
    const user = this.authService.currentUser();
    return user?.tipo_id === 1 || user?.tipo_id === 2;
  }
}
