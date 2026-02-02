import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
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

/** Gelaxka baten datuak ordutegi grid-ean */
interface ScheduleCell {
  horario: Horario | null;
  isEmpty: boolean;
}

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatTooltipModule,
    TranslateModule,
  ],
  template: `
    <div class="schedule-container">
      <!-- Goiburua -->
      <div class="schedule-header">
        <h1>{{ 'HORARIOS' | translate }}</h1>
        @if (isAdmin()) {
          <button mat-raised-button color="primary" class="add-button" (click)="openNewDialog()">
            <mat-icon>add</mat-icon>
            {{ 'COMMON.ADD' | translate }}
          </button>
        }
      </div>

      <!-- Kargatzean -->
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
        </div>
      } @else {
        <!-- Ordutegi Grid-a -->
        <mat-card class="schedule-card">
          <div class="schedule-grid">
            <!-- Goiburuko errenkada: orduak -->
            <div class="grid-header-corner">
              <mat-icon>schedule</mat-icon>
            </div>
            @for (hora of horas; track hora) {
              <div class="grid-header-cell">
                <span class="hora-label">{{ hora }}.</span>
                <span class="hora-time">{{ getHoraTime(hora) }}</span>
              </div>
            }

            <!-- Egun errenkadak -->
            @for (dia of dias; track dia) {
              <div class="grid-day-header">
                {{ getDiaLabel(dia) }}
              </div>
              @for (hora of horas; track hora) {
                <div
                  class="grid-cell"
                  [class.has-content]="getCell(dia, hora).horario"
                  [class.empty-cell]="!getCell(dia, hora).horario"
                  (click)="
                    isAdmin() && !getCell(dia, hora).horario && openNewDialogWithParams(dia, hora)
                  "
                >
                  @if (getCell(dia, hora).horario; as h) {
                    <div class="cell-content" [matTooltip]="getCellTooltip(h)">
                      <div class="cell-module">{{ getModuleLabel(h.modulo_nombre) }}</div>
                      <div class="cell-teacher">{{ getTeacherLabel(h.profesor_nombre) }}</div>
                      <div class="cell-room">{{ h.aula || '-' }}</div>
                      @if (h.observaciones) {
                        <mat-icon class="cell-note">info_outline</mat-icon>
                      }
                      @if (isAdmin()) {
                        <div class="cell-actions">
                          <button
                            mat-icon-button
                            (click)="editHorario(h); $event.stopPropagation()"
                          >
                            <mat-icon>edit</mat-icon>
                          </button>
                          <button
                            mat-icon-button
                            color="warn"
                            (click)="deleteHorario(h); $event.stopPropagation()"
                          >
                            <mat-icon>delete</mat-icon>
                          </button>
                        </div>
                      }
                    </div>
                  } @else if (isAdmin()) {
                    <div class="empty-slot">
                      <mat-icon>add</mat-icon>
                    </div>
                  }
                </div>
              }
            }
          </div>
        </mat-card>
      }
    </div>
  `,
  styles: [
    `
      .schedule-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 20px;
      }

      .schedule-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .schedule-header h1 {
        font-size: 2rem;
        font-weight: 500;
        color: var(--primary-color);
        margin: 0;
      }

      .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
      }

      .schedule-card {
        overflow-x: auto;
        padding: 0 !important;
      }

      .schedule-grid {
        display: grid;
        grid-template-columns: 100px repeat(6, 1fr);
        min-width: 800px;
      }

      .grid-header-corner {
        background: var(--primary-color);
        color: white;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-bottom: 2px solid var(--primary-color);
      }

      .grid-header-cell {
        background: var(--primary-color);
        color: white;
        padding: 12px 8px;
        text-align: center;
        border-left: 1px solid rgba(255, 255, 255, 0.2);
        border-bottom: 2px solid var(--primary-color);
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .hora-label {
        font-weight: 600;
        font-size: 1rem;
      }

      .hora-time {
        font-size: 0.7rem;
        opacity: 0.85;
      }

      .add-button {
        color: white !important;
      }

      .grid-day-header {
        background: #f5f5f5;
        padding: 16px 8px;
        font-weight: 600;
        color: var(--primary-color);
        display: flex;
        align-items: center;
        justify-content: center;
        border-bottom: 1px solid #e0e0e0;
        border-right: 1px solid #e0e0e0;
        font-size: 0.85rem;
      }

      .grid-cell {
        min-height: 90px;
        padding: 8px;
        border-right: 1px solid #e0e0e0;
        border-bottom: 1px solid #e0e0e0;
        position: relative;
        transition: background-color 0.2s;
      }

      .grid-cell.has-content {
        background: #e3f2fd;
      }

      .grid-cell.empty-cell {
        background: white;
      }

      .grid-cell.empty-cell:hover {
        background: #fafafa;
        cursor: pointer;
      }

      .cell-content {
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .cell-module {
        font-weight: 600;
        font-size: 0.8rem;
        color: var(--primary-color);
        line-height: 1.2;
      }

      .cell-teacher {
        font-size: 0.75rem;
        color: var(--text-secondary);
      }

      .cell-room {
        font-size: 0.7rem;
        color: var(--text-secondary);
        background: white;
        padding: 2px 6px;
        border-radius: 4px;
        display: inline-block;
        width: fit-content;
        margin-top: auto;
      }

      .cell-note {
        position: absolute;
        top: 4px;
        right: 4px;
        font-size: 14px;
        width: 14px;
        height: 14px;
        color: var(--accent-color);
      }

      .cell-actions {
        position: absolute;
        bottom: 2px;
        right: 2px;
        display: none;
        gap: 0;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 4px;
      }

      .grid-cell:hover .cell-actions {
        display: flex;
      }

      .cell-actions button {
        width: 28px;
        height: 28px;
        line-height: 28px;
      }

      .cell-actions mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .empty-slot {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        opacity: 0;
        transition: opacity 0.2s;
      }

      .grid-cell.empty-cell:hover .empty-slot {
        opacity: 0.3;
      }

      .empty-slot mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        color: var(--text-secondary);
      }

      /* Responsive */
      @media (max-width: 768px) {
        .schedule-grid {
          grid-template-columns: 70px repeat(6, 1fr);
          min-width: 600px;
        }

        .grid-day-header {
          font-size: 0.7rem;
          padding: 12px 4px;
        }

        .hora-label {
          font-size: 0.85rem;
        }

        .hora-time {
          display: none;
        }

        .cell-module {
          font-size: 0.7rem;
        }

        .cell-teacher,
        .cell-room {
          font-size: 0.65rem;
        }
      }
    `,
  ],
})
export class HorariosComponent implements OnInit {
  horarios = signal<Horario[]>([]);
  profesores = signal<Usuario[]>([]);
  modulos = signal<Modulo[]>([]);
  loading = signal(true);

  private horariosService = inject(HorariosService);
  private usersService = inject(UsersService);
  private modulosService = inject(ModulosService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);
  private router = inject(Router);

  /** Asteko egunak (datu-basean gordetzen diren bezala) */
  dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];

  /** Egun izenak itzulpenetarako mapa */
  private daysTranslationMap: { [key: string]: string } = {
    LUNES: 'DAYS.MONDAY',
    MARTES: 'DAYS.TUESDAY',
    MIERCOLES: 'DAYS.WEDNESDAY',
    JUEVES: 'DAYS.THURSDAY',
    VIERNES: 'DAYS.FRIDAY',
  };

  /** Eskola orduak */
  horas = [1, 2, 3, 4, 5, 6];

  /** Orduen ordu errealak */
  horasTimes: { [key: number]: string } = {
    1: '08:00 - 09:00',
    2: '09:00 - 10:00',
    3: '10:15 - 11:15',
    4: '11:15 - 12:15',
    5: '12:30 - 13:30',
    6: '13:30 - 14:30',
  };

  /** Ordutegi matrizea egun eta orduen arabera */
  private scheduleMatrix = computed(() => {
    const matrix: { [key: string]: ScheduleCell } = {};

    // Hasieratu gelaxka guztiak hutsik
    for (const dia of this.dias) {
      for (const hora of this.horas) {
        matrix[`${dia}-${hora}`] = { horario: null, isEmpty: true };
      }
    }

    // Bete horarioekin
    for (const h of this.horarios()) {
      const key = `${h.dia}-${h.hora}`;
      if (matrix[key]) {
        matrix[key] = { horario: h, isEmpty: false };
      }
    }

    return matrix;
  });

  ngOnInit(): void {
    // Ikasleak ezin dute ordutegi orrira sartu
    const user = this.authService.currentUser();
    if (user?.tipo_id === 4) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadData();
  }

  /** Gelaxka bat lortu egun eta ordua erabiliz */
  getCell(dia: string, hora: number): ScheduleCell {
    return this.scheduleMatrix()[`${dia}-${hora}`] || { horario: null, isEmpty: true };
  }

  /** Orduaren denbora lortu */
  getHoraTime(hora: number): string {
    return this.horasTimes[hora] || '';
  }

  /** Egunaren etiketa lortu hizkuntza aktiboan */
  getDiaLabel(dia: string): string {
    const translationKey = this.daysTranslationMap[dia];
    return translationKey ? this.translate.instant(translationKey) : dia;
  }

  /** Gelaxkaren tooltip-a sortu */
  getCellTooltip(h: Horario): string {
    let tooltip = `${h.modulo_nombre || this.translate.instant('SCHEDULE.NO_MODULE')}\n${h.profesor_nombre || this.translate.instant('SCHEDULE.NO_TEACHER')}\n${h.aula || '-'}`;
    if (h.observaciones) {
      tooltip += `\n\n${h.observaciones}`;
    }
    return tooltip;
  }

  /** Moduluaren izena lortu edo fallback */
  getModuleLabel(nombre: string | null | undefined): string {
    return nombre || this.translate.instant('SCHEDULE.NO_MODULE');
  }

  /** Irakaslearen izena lortu edo fallback */
  getTeacherLabel(nombre: string | null | undefined): string {
    return nombre || this.translate.instant('SCHEDULE.NO_TEACHER');
  }

  loadData(): void {
    this.loading.set(true);
    Promise.all([
      new Promise<void>((resolve) => {
        this.horariosService.getAllHorarios().subscribe({
          next: (horarios) => {
            this.horarios.set(horarios);
            resolve();
          },
          error: (err) => {
            console.error('Errorea ordutegiak kargatzean:', err);
            resolve();
          },
        });
      }),
      new Promise<void>((resolve) => {
        this.usersService.filterUserByRole(3).subscribe({
          next: (users) => {
            this.profesores.set(users);
            resolve();
          },
          error: (err) => {
            console.error('Errorea irakasleak kargatzean:', err);
            resolve();
          },
        });
      }),
      new Promise<void>((resolve) => {
        this.modulosService.getAllModulos().subscribe({
          next: (modulos) => {
            this.modulos.set(modulos);
            resolve();
          },
          error: (err) => {
            console.error('Errorea moduluak kargatzean:', err);
            resolve();
          },
        });
      }),
    ]).then(() => {
      this.loading.set(false);
    });
  }

  /** Ordutegia berria sortzeko dialogoa irekitzen du parametroekin */
  openNewDialogWithParams(dia: string, hora: number): void {
    this.openNewDialog(dia, hora);
  }

  /** Ordutegia berria sortzeko dialogoa irekitzen du */
  openNewDialog(defaultDia?: string, defaultHora?: number): void {
    Swal.fire({
      title: this.translate.instant('HORARIOS.NEW'),
      html: `
        <select id="dia" class="swal2-input">
          <option value="">${this.translate.instant('HORARIOS.SELECT_DAY')}</option>
          ${this.dias.map((d) => `<option value="${d}" ${d === defaultDia ? 'selected' : ''}>${this.getDiaLabel(d)}</option>`).join('')}
        </select>
        <select id="hora" class="swal2-input">
          <option value="">${this.translate.instant('HORARIOS.SELECT_HOUR')}</option>
          ${this.horas.map((h) => `<option value="${h}" ${h === defaultHora ? 'selected' : ''}>${h}. ${this.translate.instant('HORARIOS.HOUR_N')} (${this.horasTimes[h]})</option>`).join('')}
        </select>
        <select id="profe_id" class="swal2-input">
          <option value="">${this.translate.instant('HORARIOS.SELECT_TEACHER')}</option>
          ${this.profesores()
            .map((p) => `<option value="${p.id}">${p.nombre}</option>`)
            .join('')}
        </select>
        <select id="modulo_id" class="swal2-input">
          <option value="">${this.translate.instant('HORARIOS.SELECT_MODULE')}</option>
          ${this.modulos()
            .map((m) => `<option value="${m.id}">${m.nombre}</option>`)
            .join('')}
        </select>
        <input type="text" id="aula" class="swal2-input" placeholder="${this.translate.instant('SCHEDULE.CLASSROOM')}">
        <textarea id="observaciones" class="swal2-textarea" placeholder="${this.translate.instant('SCHEDULE.OBSERVATIONS')}"></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('COMMON.CREATE'),
      cancelButtonText: this.translate.instant('COMMON.CANCEL'),
    }).then((result) => {
      if (result.isConfirmed) {
        const horario = {
          dia: (document.getElementById('dia') as HTMLSelectElement)?.value,
          hora: parseInt((document.getElementById('hora') as HTMLSelectElement)?.value),
          profe_id: parseInt((document.getElementById('profe_id') as HTMLSelectElement)?.value),
          modulo_id: parseInt((document.getElementById('modulo_id') as HTMLSelectElement)?.value),
          aula: (document.getElementById('aula') as HTMLInputElement)?.value,
          observaciones: (document.getElementById('observaciones') as HTMLTextAreaElement)?.value,
        };
        this.createHorario(horario);
      }
    });
  }

  /** Ordutegia berria sortzen du datu-basean */
  createHorario(horario: any): void {
    this.horariosService.createHorario(horario).subscribe({
      next: () => {
        this.snackBar.open(
          this.translate.instant('HORARIOS.CREATED'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 },
        );
        this.loadData();
      },
      error: (err) => {
        console.error('Errorea ordutegia sortzean:', err);
        this.snackBar.open(
          this.translate.instant('HORARIOS.ERROR_CREATE'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 },
        );
      },
    });
  }

  /** Ordutegia editatzeko dialogoa irekitzen du */
  editHorario(horario: Horario): void {
    Swal.fire({
      title: this.translate.instant('HORARIOS.EDIT'),
      html: `
        <select id="dia" class="swal2-input">
          ${this.dias.map((d) => `<option value="${d}" ${d === horario.dia ? 'selected' : ''}>${this.getDiaLabel(d)}</option>`).join('')}
        </select>
        <select id="hora" class="swal2-input">
          ${this.horas.map((h) => `<option value="${h}" ${h === horario.hora ? 'selected' : ''}>${h}. ${this.translate.instant('HORARIOS.HOUR_N')} (${this.horasTimes[h]})</option>`).join('')}
        </select>
        <select id="profe_id" class="swal2-input">
          ${this.profesores()
            .map(
              (p) =>
                `<option value="${p.id}" ${p.id === horario.profe_id ? 'selected' : ''}>${p.nombre}</option>`,
            )
            .join('')}
        </select>
        <select id="modulo_id" class="swal2-input">
          ${this.modulos()
            .map(
              (m) =>
                `<option value="${m.id}" ${m.id === horario.modulo_id ? 'selected' : ''}>${m.nombre}</option>`,
            )
            .join('')}
        </select>
        <input type="text" id="aula" class="swal2-input" placeholder="${this.translate.instant('SCHEDULE.CLASSROOM')}" value="${horario.aula}">
        <textarea id="observaciones" class="swal2-textarea" placeholder="${this.translate.instant('SCHEDULE.OBSERVATIONS')}">${horario.observaciones || ''}</textarea>
      `,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('COMMON.UPDATE'),
      cancelButtonText: this.translate.instant('COMMON.CANCEL'),
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = {
          dia: (document.getElementById('dia') as HTMLSelectElement)?.value,
          hora: parseInt((document.getElementById('hora') as HTMLSelectElement)?.value),
          profe_id: parseInt((document.getElementById('profe_id') as HTMLSelectElement)?.value),
          modulo_id: parseInt((document.getElementById('modulo_id') as HTMLSelectElement)?.value),
          aula: (document.getElementById('aula') as HTMLInputElement)?.value,
          observaciones: (document.getElementById('observaciones') as HTMLTextAreaElement)?.value,
        };
        this.horariosService.updateHorario(horario.id, updated as any).subscribe({
          next: () => {
            this.snackBar.open(
              this.translate.instant('HORARIOS.UPDATED'),
              this.translate.instant('COMMON.CLOSE'),
              { duration: 3000 },
            );
            this.loadData();
          },
          error: (err) => {
            console.error('Errorea ordutegia eguneratzean:', err);
            this.snackBar.open(
              this.translate.instant('HORARIOS.ERROR_UPDATE'),
              this.translate.instant('COMMON.CLOSE'),
              { duration: 3000 },
            );
          },
        });
      }
    });
  }

  /** Ordutegia ezabatzeko baieztapena eskatzen du */
  deleteHorario(horario: Horario): void {
    Swal.fire({
      title: this.translate.instant('HORARIOS.DELETE_CONFIRM'),
      text: this.translate.instant('HORARIOS.DELETE_TEXT'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('COMMON.YES_DELETE'),
      cancelButtonText: this.translate.instant('COMMON.CANCEL'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.horariosService.deleteHorario(horario.id).subscribe({
          next: () => {
            this.snackBar.open(
              this.translate.instant('HORARIOS.DELETED'),
              this.translate.instant('COMMON.CLOSE'),
              { duration: 3000 },
            );
            this.loadData();
          },
          error: (err) => {
            console.error('Errorea ordutegia ezabatzean:', err);
            this.snackBar.open(
              this.translate.instant('HORARIOS.ERROR_DELETE'),
              this.translate.instant('COMMON.CLOSE'),
              { duration: 3000 },
            );
          },
        });
      }
    });
  }

  /** Erabiltzailea administratzailea den egiaztatzen du */
  isAdmin(): boolean {
    const user = this.authService.currentUser();
    return user?.tipo_id === 1 || user?.tipo_id === 2;
  }
}
