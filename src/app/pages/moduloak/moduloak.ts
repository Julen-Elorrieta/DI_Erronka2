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
        <h1>{{ 'MODULOS' | translate }}</h1>
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
        <table mat-table [dataSource]="modulos()" class="modulos-table">
          <ng-container matColumnDef="nombre">
            <th mat-header-cell *matHeaderCellDef>{{ 'MODULOS.NOMBRE' | translate }}</th>
            <td mat-cell *matCellDef="let element">{{ element.nombre }}</td>
          </ng-container>

          <ng-container matColumnDef="nombre_eus">
            <th mat-header-cell *matHeaderCellDef>{{ 'MODULOS.BASQUE' | translate }}</th>
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

          @if (isAdmin()) {
            <ng-container matColumnDef="actions">
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
    `,
  ],
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

  /**
   * Moduluak datu-basetik kargatzen ditu
   */
  loadModulos(): void {
    this.loading.set(true);
    this.modulosService.getAllModulos().subscribe({
      next: (modulos) => {
        this.modulos.set(modulos);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Errorea moduluak kargatzean:', err);
        this.loading.set(false);
        this.snackBar.open(
          this.translate.instant('ERROR.LOADING_MODULES'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 },
        );
      },
    });
  }

  /**
   * Zikloak kargatzen ditu aukerak bistaratzeko
   */
  loadCiclos(): void {
    this.ciclosService.getAllCiclos().subscribe({
      next: (ciclos) => this.ciclos.set(ciclos),
      error: (err) => console.error('Errorea zikloak kargatzean:', err),
    });
  }

  /**
   * Modulu berria sortzeko dialogoa irekitzen du
   */
  openNewDialog(): void {
    Swal.fire({
      title: this.translate.instant('MODULOS.NEW'),
      html: `
        <input type="text" id="nombre" class="swal2-input" placeholder="${this.translate.instant('MODULOS.NOMBRE')}">
        <input type="text" id="nombre_eus" class="swal2-input" placeholder="${this.translate.instant('MODULOS.NOMBRE_EUS')}">
        <input type="number" id="horas" class="swal2-input" placeholder="${this.translate.instant('MODULOS.HORAS')}">
        <select id="ciclo_id" class="swal2-input">
          <option value="">${this.translate.instant('MODULOS.SELECT_CICLO')}</option>
          ${this.ciclos()
            .map((c) => `<option value="${c.id}">${c.nombre}</option>`)
            .join('')}
        </select>
        <input type="number" id="curso" class="swal2-input" placeholder="${this.translate.instant('MODULOS.CURSO_HINT')}">
      `,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('COMMON.CREATE'),
      cancelButtonText: this.translate.instant('COMMON.CANCEL'),
    }).then((result) => {
      if (result.isConfirmed) {
        const modulo = {
          nombre: (document.getElementById('nombre') as HTMLInputElement)?.value,
          nombre_eus: (document.getElementById('nombre_eus') as HTMLInputElement)?.value,
          horas: parseInt((document.getElementById('horas') as HTMLInputElement)?.value),
          ciclo_id: parseInt((document.getElementById('ciclo_id') as HTMLSelectElement)?.value),
          curso: parseInt((document.getElementById('curso') as HTMLInputElement)?.value),
        };
        this.createModulo(modulo);
      }
    });
  }

  /**
   * Modulu berria sortzen du datu-basean
   * @param modulo Sortu beharreko moduluaren datuak
   */
  createModulo(modulo: any): void {
    this.modulosService.createModulo(modulo).subscribe({
      next: () => {
        this.snackBar.open(
          this.translate.instant('MODULOS.CREATED'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 },
        );
        this.loadModulos();
      },
      error: (err) => {
        console.error('Errorea modulua sortzean:', err);
        this.snackBar.open(
          this.translate.instant('MODULOS.ERROR_CREATE'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 },
        );
      },
    });
  }

  /**
   * Modulua editatzeko dialogoa irekitzen du
   * @param modulo Editatu beharreko modulua
   */
  editModulo(modulo: Modulo): void {
    Swal.fire({
      title: this.translate.instant('MODULOS.EDIT'),
      html: `
        <input type="text" id="nombre" class="swal2-input" placeholder="${this.translate.instant('MODULOS.NOMBRE')}" value="${modulo.nombre}">
        <input type="text" id="nombre_eus" class="swal2-input" placeholder="${this.translate.instant('MODULOS.NOMBRE_EUS')}" value="${modulo.nombre_eus || ''}">
        <input type="number" id="horas" class="swal2-input" placeholder="${this.translate.instant('MODULOS.HORAS')}" value="${modulo.horas}">
        <select id="ciclo_id" class="swal2-input">
          ${this.ciclos()
            .map(
              (c) =>
                `<option value="${c.id}" ${c.id === modulo.ciclo_id ? 'selected' : ''}>${c.nombre}</option>`,
            )
            .join('')}
        </select>
        <input type="number" id="curso" class="swal2-input" placeholder="${this.translate.instant('MODULOS.CURSO')}" value="${modulo.curso}">
      `,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('COMMON.UPDATE'),
      cancelButtonText: this.translate.instant('COMMON.CANCEL'),
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = {
          nombre: (document.getElementById('nombre') as HTMLInputElement)?.value,
          nombre_eus: (document.getElementById('nombre_eus') as HTMLInputElement)?.value,
          horas: parseInt((document.getElementById('horas') as HTMLInputElement)?.value),
          ciclo_id: parseInt((document.getElementById('ciclo_id') as HTMLSelectElement)?.value),
          curso: parseInt((document.getElementById('curso') as HTMLInputElement)?.value),
        };
        this.modulosService.updateModulo(modulo.id, updated as any).subscribe({
          next: () => {
            this.snackBar.open(
              this.translate.instant('MODULOS.UPDATED'),
              this.translate.instant('COMMON.CLOSE'),
              { duration: 3000 },
            );
            this.loadModulos();
          },
          error: (err) => {
            console.error('Errorea modulua eguneratzean:', err);
            this.snackBar.open(
              this.translate.instant('MODULOS.ERROR_UPDATE'),
              this.translate.instant('COMMON.CLOSE'),
              { duration: 3000 },
            );
          },
        });
      }
    });
  }

  /**
   * Modulua ezabatzeko baieztapena eskatzen du
   * @param modulo Ezabatu beharreko modulua
   */
  deleteModulo(modulo: Modulo): void {
    Swal.fire({
      title: this.translate.instant('MODULOS.DELETE_CONFIRM'),
      text: this.translate.instant('MODULOS.DELETE_TEXT'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('COMMON.YES_DELETE'),
      cancelButtonText: this.translate.instant('COMMON.CANCEL'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.modulosService.deleteModulo(modulo.id).subscribe({
          next: () => {
            this.snackBar.open(
              this.translate.instant('MODULOS.DELETED'),
              this.translate.instant('COMMON.CLOSE'),
              { duration: 3000 },
            );
            this.loadModulos();
          },
          error: (err) => {
            console.error('Errorea modulua ezabatzean:', err);
            this.snackBar.open(
              this.translate.instant('MODULOS.ERROR_DELETE'),
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
