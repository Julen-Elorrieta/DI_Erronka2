import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

// ⚠️ REEMPLAZAR: Importar Mapbox en lugar de Leaflet
import mapboxgl from 'mapbox-gl';

import { BehaviorSubject, Observable, combineLatest, Subject, of } from 'rxjs';
import {
  map,
  distinctUntilChanged,
  debounceTime,
  tap,
  takeUntil,
  catchError,
  filter,
  take,
  shareReplay,
} from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { MeetingsService } from '../../core/services/meetings.service';
import { MeetingDialogComponent } from './meetingDialog';
import { Router } from '@angular/router';
import { ApiUtil } from '../../core/utils/api.util';

// ============================================================================
// INTERFACES
// ============================================================================

interface Center {
  id?: string;
  CCEN: string;
  NOM: string;
  DTITUC: string;
  DTERRC: string;
  DMUNIC: string;
  LATITUD: number;
  LONGITUD: number;
  _searchableText?: string;
}

interface Meeting {
  id: string;
  title: string;
  date: Date;
  hour: string;
  classroom: string;
  center: string;
  centerName: string;
  status: string;
  subject: string;
  teacherId?: number;
  studentId?: number;
}

interface FilterState {
  searchText: string;
  titularidad: string;
  territorio: string;
  municipio: string;
}

interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

interface ProcessedData {
  filtered: Center[];
  paginated: Center[];
  total: number;
  hasActiveFilters: boolean;
  filterOptions: {
    titularidades: string[];
    territorios: string[];
    municipios: string[];
  };
}

// ============================================================================
// UTILIDADES DE CACHÉ
// ============================================================================

function getCachedCenters(): Center[] | null {
  try {
    const cache = localStorage.getItem('centersCache');
    if (!cache) return null;
    const { data, timestamp } = JSON.parse(cache);
    if (Date.now() - timestamp < 10 * 60 * 1000) {
      return data;
    }
  } catch {
    return null;
  }
  return null;
}

function setCachedCenters(data: Center[]): void {
  try {
    localStorage.setItem('centersCache', JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {
    console.warn('Could not cache centers', e);
  }
}

// ============================================================================
// COMPONENTE OPTIMIZADO
// ============================================================================

@Component({
  selector: 'app-meetings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatMenuModule,
    TranslateModule,
  ],
  templateUrl: './meetings.html',
  styleUrls: ['./meetings.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Meetings implements OnInit, AfterViewInit, OnDestroy {
  authService: AuthService = inject(AuthService);
  router: Router = inject(Router);

  // ⚠️ AÑADIR: Token de Mapbox (reemplazar con tu token real)
  private readonly MAPBOX_TOKEN =
    'pk.eyJ1IjoianVsZW5uMDYiLCJhIjoiY21rejZycDJqMGRhdzNoc2txaHlyNXF1NiJ9.a593UB3NIwgSFiMVXRahcA';

  constructor() {
    this.authenticate();
    // ⚠️ AÑADIR: Configurar token de Mapbox
    mapboxgl.accessToken = this.MAPBOX_TOKEN;
  }

  authenticate(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  // ============================================================================
  // INYECCIÓN DE DEPENDENCIAS
  // ============================================================================
  private readonly http = inject(HttpClient);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly dialog = inject(MatDialog);
  private readonly meetingsService = inject(MeetingsService);

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  // ============================================================================
  // SUBJECTS PARA STREAMS REACTIVOS
  // ============================================================================
  private readonly destroy$ = new Subject<void>();

  private readonly centersSource$ = new BehaviorSubject<Center[]>([]);
  private readonly meetingsSource$ = new BehaviorSubject<Meeting[]>([]);
  private readonly loadingSource$ = new BehaviorSubject<boolean>(false);
  private readonly loadingMeetingsSource$ = new BehaviorSubject<boolean>(false);

  private readonly searchTextSource$ = new BehaviorSubject<string>('');
  private readonly titularidadSource$ = new BehaviorSubject<string>('');
  private readonly territorioSource$ = new BehaviorSubject<string>('');
  private readonly municipioSource$ = new BehaviorSubject<string>('');

  private readonly paginationSource$ = new BehaviorSubject<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  private readonly activeTabSource$ = new BehaviorSubject<number>(0);
  private readonly mapInitialized$ = new BehaviorSubject<boolean>(false);

  // ============================================================================
  // OBSERVABLES PÚBLICOS
  // ============================================================================

  readonly filters$: Observable<FilterState> = combineLatest([
    this.searchTextSource$.pipe(debounceTime(300), distinctUntilChanged()),
    this.titularidadSource$.pipe(distinctUntilChanged()),
    this.territorioSource$.pipe(distinctUntilChanged()),
    this.municipioSource$.pipe(distinctUntilChanged()),
  ]).pipe(
    map(([searchText, titularidad, territorio, municipio]) => ({
      searchText: searchText.trim().toLowerCase(),
      titularidad,
      territorio,
      municipio,
    })),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    shareReplay(1),
  );

  readonly processedData$: Observable<ProcessedData> = combineLatest([
    this.centersSource$,
    this.filters$,
    this.paginationSource$,
  ]).pipe(
    map(([centers, filters, pagination]) => {
      const filtered = this.filterCenters(centers, filters);
      const filterOptions = this.calculateFilterOptions(centers, filters);
      const start = pagination.pageIndex * pagination.pageSize;
      const paginated = filtered.slice(start, start + pagination.pageSize);

      return {
        filtered,
        paginated,
        total: filtered.length,
        hasActiveFilters: this.checkActiveFilters(filters),
        filterOptions,
      };
    }),
    shareReplay(1),
  );

  private readonly mapMarkersUpdate$ = combineLatest([
    this.processedData$,
    this.mapInitialized$,
  ]).pipe(
    filter(([_, initialized]) => initialized),
    map(([data, _]) => data.filtered),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    takeUntil(this.destroy$),
  );

  readonly loading$ = this.loadingSource$.asObservable();
  readonly loadingMeetings$ = this.loadingMeetingsSource$.asObservable();
  readonly meetings$ = this.meetingsSource$.asObservable();
  readonly activeTab$ = this.activeTabSource$.asObservable();
  readonly pagination$ = this.paginationSource$.asObservable();

  // ============================================================================
  // CONSTANTES PARA EL TEMPLATE
  // ============================================================================
  readonly displayedColumns = ['name', 'DTITUC', 'DTERRC', 'DMUNIC', 'actions'];
  readonly pageSizeOptions = [5, 10, 25, 50];

  readonly trackByCenter = (index: number, center: Center): string => {
    return center.CCEN || center.id || `${index}`;
  };

  readonly trackByMeeting = (index: number, meeting: Meeting): string => {
    return meeting.id || `${index}`;
  };

  // ============================================================================
  // ⚠️ REEMPLAZAR: Mapa Mapbox en lugar de Leaflet
  // ============================================================================
  private map: mapboxgl.Map | null = null;
  private markers: Map<string, mapboxgl.Marker> = new Map();

  // ============================================================================
  // LIFECYCLE HOOKS
  // ============================================================================

  ngOnInit(): void {
    this.loadInitialData();
    this.setupFilterCascade();

    this.processedData$
      .pipe(
        takeUntil(this.destroy$),
        filter(() => !!this.mapContainer),
        take(1),
      )
      .subscribe(() => {
        setTimeout(() => {
          this.initializeMap();
        }, 200);
      });

    this.mapMarkersUpdate$.subscribe((centers) => {
      this.updateMapMarkers(centers);
    });
  }

  ngAfterViewInit(): void {
    this.activeTab$
      .pipe(
        filter((tab) => tab === 0),
        debounceTime(300),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        if (this.map) {
          this.map.resize();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // ⚠️ ACTUALIZAR: Limpiar mapa Mapbox
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.markers.clear();
  }

  // ============================================================================
  // CARGA DE DATOS
  // ============================================================================

  private loadInitialData(): void {
    const cached = getCachedCenters();
    if (cached && cached.length > 0) {
      this.centersSource$.next(this.preprocessCenters(cached));
      setTimeout(() => this.fetchCentersFromAPI(true), 1000);
    } else {
      this.fetchCentersFromAPI(false);
    }

    this.loadMeetings();
  }

  private fetchCentersFromAPI(silent: boolean): void {
    if (!silent) {
      this.loadingSource$.next(true);
    }

    this.http
      .get<Center[]>(ApiUtil.buildUrl('/centers'))
      .pipe(
        map((centers) => this.preprocessCenters(centers)),
        tap((centers) => setCachedCenters(centers)),
        catchError((err) => {
          console.error('Error loading centers:', err);
          this.snackBar.open(
            this.translate.instant('ERROR.LOADING_CENTERS'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 3000 },
          );
          return of([]);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((centers) => {
        this.centersSource$.next(centers);
        this.loadingSource$.next(false);
      });
  }

  // ============================================================================
  // CARGA DE REUNIONES DESDE LA BD
  // ============================================================================

  private loadMeetings(): void {
    this.loadingMeetingsSource$.next(true);

    this.http
      .get<any[]>(ApiUtil.buildUrl('/centers', { type: 'meetings' }))
      .pipe(
        map((reuniones) => this.transformMeetingsData(reuniones)),
        catchError((err) => {
          console.error('Error loading meetings:', err);
          this.snackBar.open(
            this.translate.instant('ERROR.LOADING_MEETINGS') || 'Error al cargar reuniones',
            this.translate.instant('COMMON.CLOSE') || 'Cerrar',
            { duration: 3000 },
          );
          return of([]);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((meetings) => {
        this.meetingsSource$.next(meetings);
        this.loadingMeetingsSource$.next(false);
      });
  }

  private transformMeetingsData(reuniones: any[]): Meeting[] {
    return reuniones.map((reunion) => ({
      id: reunion.id_reunion?.toString() || '',
      title: reunion.titulo || reunion.asunto || `Reunión ${reunion.id_reunion}`,
      date: new Date(reunion.fecha),
      hour: this.extractTime(reunion.fecha),
      classroom: reunion.aula || 'Sin aula asignada',
      center: reunion.id_centro?.toString() || '',
      centerName: this.getCenterName(reunion.id_centro),
      status: reunion.estado || 'pendiente',
      subject: reunion.asunto || '',
      teacherId: reunion.profesor_id,
      studentId: reunion.alumno_id,
    }));
  }

  private extractTime(fecha: string): string {
    try {
      const date = new Date(fecha);
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '00:00';
    }
  }

  private getCenterName(centroId: number): string {
    const centers = this.centersSource$.value;
    const center = centers.find((c) => c.CCEN === centroId.toString());
    return center?.NOM || `Centro ${centroId}`;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pendiente: 'Pendiente',
      aceptada: 'Aceptada',
      denegada: 'Denegada',
      conflicto: 'Conflicto',
    };
    return labels[status] || status;
  }

  canChangeStatus(_meeting: Meeting): boolean {
    return true;
  }

  getAvailableStatusActions(
    meeting: Meeting,
  ): Array<{ status: string; label: string; icon: string; color: string }> {
    const currentStatus = meeting.status.toLowerCase();

    const allActions = [
      { status: 'aceptada', label: 'Aceptar', icon: 'check_circle', color: 'accent' },
      { status: 'denegada', label: 'Denegar', icon: 'cancel', color: 'warn' },
      { status: 'conflicto', label: 'Marcar conflicto', icon: 'warning', color: 'warn' },
      { status: 'pendiente', label: 'Marcar pendiente', icon: 'schedule', color: 'basic' },
    ];

    return allActions.filter((action) => action.status !== currentStatus);
  }

  // ============================================================================
  // PREPROCESAMIENTO DE DATOS
  // ============================================================================

  private preprocessCenters(centers: Center[]): Center[] {
    return centers.map((center) => ({
      ...center,
      _searchableText: [
        center.NOM || '',
        center.CCEN || '',
        center.DMUNIC || '',
        center.DTERRC || '',
        center.DTITUC || '',
      ]
        .join(' ')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''),
    }));
  }

  // ============================================================================
  // FILTRADO
  // ============================================================================

  private filterCenters(centers: Center[], filters: FilterState): Center[] {
    return centers.filter((center) => {
      if (filters.searchText && !center._searchableText?.includes(filters.searchText)) {
        return false;
      }

      if (filters.titularidad && center.DTITUC !== filters.titularidad) {
        return false;
      }

      if (filters.territorio && center.DTERRC !== filters.territorio) {
        return false;
      }

      if (filters.municipio && center.DMUNIC !== filters.municipio) {
        return false;
      }

      return true;
    });
  }

  private checkActiveFilters(filters: FilterState): boolean {
    return !!(filters.searchText || filters.titularidad || filters.territorio || filters.municipio);
  }

  private calculateFilterOptions(
    centers: Center[],
    currentFilters: FilterState,
  ): { titularidades: string[]; territorios: string[]; municipios: string[] } {
    let availableCenters = centers;

    if (currentFilters.territorio) {
      availableCenters = availableCenters.filter((c) => c.DTERRC === currentFilters.territorio);
    }

    if (currentFilters.titularidad) {
      availableCenters = availableCenters.filter((c) => c.DTITUC === currentFilters.titularidad);
    }

    const titularidades = [
      ...new Set(
        centers
          .filter((c) => !currentFilters.territorio || c.DTERRC === currentFilters.territorio)
          .map((c) => c.DTITUC),
      ),
    ].sort();

    const territorios = [
      ...new Set(
        centers
          .filter((c) => !currentFilters.titularidad || c.DTITUC === currentFilters.titularidad)
          .map((c) => c.DTERRC),
      ),
    ].sort();

    const municipios = [...new Set(availableCenters.map((c) => c.DMUNIC))].sort();

    return { titularidades, territorios, municipios };
  }

  private setupFilterCascade(): void {
    combineLatest([this.territorioSource$, this.processedData$])
      .pipe(
        map(([, data]) => {
          const currentMunicipio = this.municipioSource$.value;
          if (currentMunicipio && !data.filterOptions.municipios.includes(currentMunicipio)) {
            return '';
          }
          return currentMunicipio;
        }),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      )
      .subscribe((municipio) => {
        if (municipio !== this.municipioSource$.value) {
          this.municipioSource$.next(municipio);
        }
      });
  }

  // ============================================================================
  // ⚠️ REEMPLAZAR COMPLETAMENTE: Mapa Mapbox
  // ============================================================================

  private initializeMap(): void {
    if (!this.mapContainer || this.map) return;

    try {
      const container = this.mapContainer.nativeElement;

      this.map = new mapboxgl.Map({
        container: container,
        style: 'mapbox://styles/mapbox/streets-v12', // Estilo del mapa
        center: [-2.5, 42.85], // [lng, lat] - Centro en País Vasco
        zoom: 8,
      });

      // Añadir controles de navegación
      this.map.addControl(new mapboxgl.NavigationControl());

      // Añadir control de pantalla completa
      this.map.addControl(new mapboxgl.FullscreenControl());

      this.map.on('load', () => {
        this.mapInitialized$.next(true);
      });
    } catch (error) {
      console.error('Error inicializando mapa Mapbox:', error);
      this.mapInitialized$.next(false);
    }
  }

  private updateMapMarkers(centers: Center[]): void {
    if (!this.map) return;

    const validCenters = centers.filter((c) => c.LONGITUD && c.LATITUD);
    const newMarkerIds = new Set(validCenters.map((c) => c.CCEN));

    // Eliminar marcadores que ya no están en la lista filtrada
    this.markers.forEach((marker, id) => {
      if (!newMarkerIds.has(id)) {
        marker.remove();
        this.markers.delete(id);
      }
    });

    // Añadir nuevos marcadores
    validCenters.forEach((center) => {
      if (!this.markers.has(center.CCEN)) {
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="min-width: 200px; padding: 8px;">
            <strong style="font-size: 14px;">${center.NOM}</strong><br>
            <small style="color: #666;">${center.CCEN}</small><br>
            <span style="font-size: 13px;">${center.DMUNIC} - ${center.DTERRC}</span>
          </div>
        `);

        const marker = new mapboxgl.Marker({ color: '#3F51B5' })
          .setLngLat([center.LATITUD, center.LONGITUD]) // Mapbox usa [lng, lat]
          .setPopup(popup)
          .addTo(this.map!);

        this.markers.set(center.CCEN, marker);
      }
    });

    // Ajustar vista del mapa a los marcadores
    if (validCenters.length > 0) {
      this.fitMapBounds(validCenters);
    }
  }

  private fitMapBounds(centers: Center[]): void {
    if (!this.map || centers.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    centers.forEach((center) => {
      if (center.LATITUD && center.LONGITUD) {
        bounds.extend([center.LATITUD, center.LONGITUD]);
      }
    });

    this.map.fitBounds(bounds, {
      padding: { top: 50, bottom: 50, left: 50, right: 50 },
      maxZoom: 15,
    });
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS PARA EL TEMPLATE
  // ============================================================================

  onSearchChange(value: string): void {
    this.searchTextSource$.next(value);
    this.resetPagination();
  }

  onTitularidadChange(value: string): void {
    this.titularidadSource$.next(value);
    this.resetPagination();
  }

  onTerritorioChange(value: string): void {
    this.territorioSource$.next(value);
    this.resetPagination();
  }

  onMunicipioChange(value: string): void {
    this.municipioSource$.next(value);
    this.resetPagination();
  }

  clearFilters(): void {
    this.searchTextSource$.next('');
    this.titularidadSource$.next('');
    this.territorioSource$.next('');
    this.municipioSource$.next('');
    this.resetPagination();
  }

  onPageChange(event: PageEvent): void {
    this.paginationSource$.next({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
    });
  }

  onTabChange(index: number): void {
    this.activeTabSource$.next(index);
  }

  private resetPagination(): void {
    const current = this.paginationSource$.value;
    this.paginationSource$.next({ ...current, pageIndex: 0 });
  }

  canCreateMeeting(): boolean {
    return true;
  }

  // ============================================================================
  // MÉTODOS HELPER - ERROR HANDLING Y DIALOG GENÉRICOS
  // ============================================================================

  private showSnackBar(message: string, error: boolean = false): void {
    this.snackBar.open(message, this.translate.instant('COMMON.CLOSE') || 'Cerrar', {
      duration: 3000,
      panelClass: error ? 'error-snackbar' : 'success-snackbar',
    });
  }

  private handleMeetingOperation<T>(
    operation: Observable<T>,
    successMsg: string,
    errorMsg: string,
    operationName: string,
  ): void {
    operation.subscribe({
      next: (_response) => {
        this.showSnackBar(this.translate.instant(successMsg) || successMsg);
        this.loadMeetings();
      },
      error: (err) => {
        console.error(`Error in ${operationName}:`, err);
        this.showSnackBar(this.translate.instant(errorMsg) || errorMsg, true);
      },
    });
  }

  openCreateMeetingDialog(_center?: Center): void {
    const dialogRef = this.dialog.open(MeetingDialogComponent, {
      width: '500px',
      data: null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const currentUser = this.authService.getUser();
        const meetingData = {
          ...result,
          profesor_id: currentUser?.tipo_id === 3 ? currentUser?.id : undefined,
          alumno_id: currentUser?.tipo_id === 4 ? currentUser?.id : undefined,
        };

        this.handleMeetingOperation(
          this.meetingsService.createMeeting(meetingData),
          'SUCCESS.MEETING_CREATED',
          'ERROR.CREATING_MEETING',
          'createMeeting',
        );
      }
    });
  }

  openEditMeetingDialog(meeting: Meeting): void {
    const dialogRef = this.dialog.open(MeetingDialogComponent, {
      width: '500px',
      data: meeting,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.handleMeetingOperation(
          this.meetingsService.updateMeeting(parseInt(meeting.id), result),
          'SUCCESS.MEETING_UPDATED',
          'ERROR.UPDATING_MEETING',
          'updateMeeting',
        );
      }
    });
  }

  deleteMeeting(meeting: Meeting): void {
    if (
      confirm(
        this.translate.instant('CONFIRM.DELETE_MEETING') ||
          '¿Está seguro de que desea eliminar esta reunión?',
      )
    ) {
      this.handleMeetingOperation(
        this.meetingsService.deleteMeeting(parseInt(meeting.id)),
        'SUCCESS.MEETING_DELETED',
        'ERROR.DELETING_MEETING',
        'deleteMeeting',
      );
    }
  }

  updateMeetingStatus(meeting: Meeting, newStatus: string): void {
    this.handleMeetingOperation(
      this.meetingsService.updateMeetingStatus(parseInt(meeting.id), newStatus),
      'SUCCESS.STATUS_UPDATED',
      'ERROR.UPDATING_STATUS',
      'updateMeetingStatus',
    );
  }

  openCenterDetail(center: Center): void {
    console.log('Center detail', center);
  }

  focusOnCenter(center: Center): void {
    if (this.map && center.LONGITUD && center.LATITUD) {
      this.map.flyTo({
        center: [center.LATITUD, center.LONGITUD],
        zoom: 15,
        essential: true,
      });

      // Abrir el popup del marcador correspondiente
      const marker = this.markers.get(center.CCEN);
      if (marker) {
        marker.togglePopup();
      }
    }
  }

  getStatusClass(status: string): string {
    return `status-${status?.toLowerCase() || 'unknown'}`;
  }
}
