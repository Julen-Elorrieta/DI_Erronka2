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

// Interfazeak
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


// Cache utilitatea
function getCachedCenters(): Center[] | null {
  try {
    const cache = localStorage.getItem('centersCache');
    if (!cache) return null;
    const { data, timestamp } = JSON.parse(cache);
    return Date.now() - timestamp < 10 * 60 * 1000 ? data : null;
  } catch {
    return null;
  }
}

function setCachedCenters(data: Center[]): void {
  try {
    localStorage.setItem('centersCache', JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {
    console.warn('Ezin izan da cache-an gorde', e);
  }
}

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
  private readonly MAPBOX_TOKEN =
    'pk.eyJ1IjoianVsZW5uMDYiLCJhIjoiY21rejZycDJqMGRhdzNoc2txaHlyNXF1NiJ9.a593UB3NIwgSFiMVXRahcA';

  authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly dialog = inject(MatDialog);
  private readonly meetingsService = inject(MeetingsService);

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

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

  readonly filters$ = combineLatest([
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

  readonly processedData$ = combineLatest([
    this.centersSource$,
    this.filters$,
    this.paginationSource$,
  ]).pipe(
    map(([centers, filters, pagination]) => {
      const filtered = this.filterCenters(centers, filters);
      const filterOptions = this.calculateFilterOptions(centers, filters);
      const start = pagination.pageIndex * pagination.pageSize;
      return {
        filtered,
        paginated: filtered.slice(start, start + pagination.pageSize),
        total: filtered.length,
        hasActiveFilters: !!(
          filters.searchText ||
          filters.titularidad ||
          filters.territorio ||
          filters.municipio
        ),
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
  readonly displayedColumns = ['name', 'DTITUC', 'DTERRC', 'DMUNIC', 'actions'];
  readonly pageSizeOptions = [5, 10, 25, 50];
  readonly trackByCenter = (_: number, center: Center) => center.CCEN || center.id || _;
  readonly trackByMeeting = (_: number, meeting: Meeting) => meeting.id || _;

  private map: mapboxgl.Map | null = null;
  private markers = new Map<string, mapboxgl.Marker>();

  constructor() {
    if (!this.authService.isLoggedIn()) this.router.navigate(['/login']);
    mapboxgl.accessToken = this.MAPBOX_TOKEN;
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupFilterCascade();
    this.processedData$
      .pipe(
        takeUntil(this.destroy$),
        filter(() => !!this.mapContainer),
        take(1),
      )
      .subscribe(() => setTimeout(() => this.initializeMap(), 200));
    this.mapMarkersUpdate$.subscribe((centers) => this.updateMapMarkers(centers));
  }

  ngAfterViewInit(): void {
    this.activeTab$
      .pipe(
        filter((tab) => tab === 0),
        debounceTime(300),
        takeUntil(this.destroy$),
      )
      .subscribe(() => this.map?.resize());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.markers.clear();
  }

  private loadInitialData(): void {
    const cached = getCachedCenters();
    if (cached?.length) {
      this.centersSource$.next(this.preprocessCenters(cached));
      setTimeout(() => this.fetchCentersFromAPI(true), 1000);
    } else {
      this.fetchCentersFromAPI(false);
    }
    this.loadMeetings();
  }

  private fetchCentersFromAPI(silent: boolean): void {
    if (!silent) this.loadingSource$.next(true);
    this.http
      .get<Center[]>(ApiUtil.buildUrl('/centers'))
      .pipe(
        map((centers) => this.preprocessCenters(centers)),
        tap((centers) => setCachedCenters(centers)),
        catchError((err) => {
          console.error('Errorea zentroak kargatzean:', err);
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

  private loadMeetings(): void {
    this.loadingMeetingsSource$.next(true);
    this.http
      .get<any[]>(ApiUtil.buildUrl('/centers', { type: 'meetings' }))
      .pipe(
        map((reuniones) =>
          reuniones.map((r) => ({
            id: r.id_reunion?.toString() || '',
            title: r.titulo || r.asunto || `Bilera ${r.id_reunion || 'ID gabe'}`,
            date: new Date(r.fecha),
            hour: this.extractTime(r.fecha),
            classroom: r.aula || 'Gela esleitu gabe',
            center: r.id_centro?.toString() || '',
            centerName: this.getCenterName(r.id_centro),
            status: r.estado || 'pendiente',
            subject: r.asunto || '',
            teacherId: r.profesor_id || undefined,
            studentId: r.alumno_id || undefined,
          })),
        ),
        catchError((err) => {
          console.error('Errorea bilerak kargatzean:', err);
          this.snackBar.open(
            this.translate.instant('ERROR.LOADING_MEETINGS') || 'Errorea bilerak kargatzean',
            this.translate.instant('COMMON.CLOSE') || 'Itxi',
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

  private extractTime(fecha: string | Date | null | undefined): string {
    if (!fecha) return '00:00';
    try {
      const date = new Date(fecha);
      return isNaN(date.getTime())
        ? '00:00'
        : date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '00:00';
    }
  }

  private getCenterName(centroId: number | null | undefined): string {
    if (!centroId) return 'Zentro zehaztu gabe';
    const center = this.centersSource$.value.find((c) => c.CCEN === centroId.toString());
    return center?.NOM || `Zentroa ${centroId}`;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pendiente: 'Zain',
      aceptada: 'Onartuta',
      denegada: 'Ukatua',
      conflicto: 'Gatazka',
    };
    return labels[status] || status;
  }

  canChangeStatus(_: Meeting): boolean {
    return true;
  }

  getAvailableStatusActions(meeting: Meeting) {
    const current = meeting.status.toLowerCase();
    return [
      { status: 'aceptada', label: 'Onartu', icon: 'check_circle', color: 'accent' },
      { status: 'denegada', label: 'Ukatu', icon: 'cancel', color: 'warn' },
      { status: 'conflicto', label: 'Gatazka markatu', icon: 'warning', color: 'warn' },
      { status: 'pendiente', label: 'Zain markatu', icon: 'schedule', color: 'basic' },
    ].filter((a) => a.status !== current);
  }

  private preprocessCenters(centers: Center[]): Center[] {
    return centers.map((c) => ({
      ...c,
      _searchableText: [c.NOM || '', c.CCEN || '', c.DMUNIC || '', c.DTERRC || '', c.DTITUC || '']
        .join(' ')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''),
    }));
  }

  private filterCenters(centers: Center[], filters: FilterState): Center[] {
    return centers.filter((c) => {
      if (filters.searchText && !c._searchableText?.includes(filters.searchText)) return false;
      if (filters.titularidad && c.DTITUC !== filters.titularidad) return false;
      if (filters.territorio && c.DTERRC !== filters.territorio) return false;
      if (filters.municipio && c.DMUNIC !== filters.municipio) return false;
      return true;
    });
  }

  private calculateFilterOptions(centers: Center[], currentFilters: FilterState) {
    let available = centers;
    if (currentFilters.territorio)
      available = available.filter((c) => c.DTERRC === currentFilters.territorio);
    if (currentFilters.titularidad)
      available = available.filter((c) => c.DTITUC === currentFilters.titularidad);

    return {
      titularidades: [
        ...new Set(
          centers
            .filter((c) => !currentFilters.territorio || c.DTERRC === currentFilters.territorio)
            .map((c) => c.DTITUC),
        ),
      ].sort(),
      territorios: [
        ...new Set(
          centers
            .filter((c) => !currentFilters.titularidad || c.DTITUC === currentFilters.titularidad)
            .map((c) => c.DTERRC),
        ),
      ].sort(),
      municipios: [...new Set(available.map((c) => c.DMUNIC))].sort(),
    };
  }

  private setupFilterCascade(): void {
    combineLatest([this.territorioSource$, this.processedData$])
      .pipe(
        map(([, data]) => {
          const current = this.municipioSource$.value;
          return current && !data.filterOptions.municipios.includes(current) ? '' : current;
        }),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      )
      .subscribe((municipio) => {
        if (municipio !== this.municipioSource$.value) this.municipioSource$.next(municipio);
      });
  }

  private initializeMap(): void {
    if (!this.mapContainer || this.map) return;
    try {
      this.map = new mapboxgl.Map({
        container: this.mapContainer.nativeElement,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-2.5, 42.85],
        zoom: 8,
      });
      this.map.addControl(new mapboxgl.NavigationControl());
      this.map.addControl(new mapboxgl.FullscreenControl());
      this.map.on('load', () => {
        console.log('Mapbox mapa kargatuta');
        this.mapInitialized$.next(true);
      });
      this.map.on('error', (e) => console.error('Mapbox errorea:', e));
    } catch (error) {
      console.error('Errorea mapa hasieratzen:', error);
      this.mapInitialized$.next(false);
    }
  }

  private updateMapMarkers(centers: Center[]): void {
    if (!this.map) return;
    const valid = centers.filter(
      (c) =>
        c.LONGITUD &&
        c.LATITUD &&
        !isNaN(c.LONGITUD) &&
        !isNaN(c.LATITUD) &&
        c.LONGITUD !== 0 &&
        c.LATITUD !== 0,
    );
    const newIds = new Set(valid.map((c) => c.CCEN));
    this.markers.forEach((marker, id) => {
      if (!newIds.has(id)) {
        marker.remove();
        this.markers.delete(id);
      }
    });
    valid.forEach((c) => {
      if (!this.markers.has(c.CCEN)) {
        const [lng, lat] = [c.LATITUD, c.LONGITUD]; // Mapbox [lng, lat] formatuan
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="min-width: 200px; padding: 8px;">
            <strong style="font-size: 14px;">${c.NOM}</strong><br>
            <small style="color: #666;">${c.CCEN}</small><br>
            <span style="font-size: 13px;">${c.DMUNIC} - ${c.DTERRC}</span>
          </div>
        `);
        try {
          const marker = new mapboxgl.Marker({ color: '#3F51B5' })
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(this.map!);
          this.markers.set(c.CCEN, marker);
        } catch (error) {
          console.error(`Errorea markatzailea gehitzen ${c.NOM}:`, error);
        }
      }
    });
    if (valid.length) this.fitMapBounds(valid);
  }

  private fitMapBounds(centers: Center[]): void {
    if (!this.map || !centers.length) return;
    const bounds = new mapboxgl.LngLatBounds();
    centers.forEach((c) => {
      if (c.LATITUD && c.LONGITUD) {
        try {
          bounds.extend([c.LATITUD, c.LONGITUD]);
        } catch (error) {
          console.error(`Errorea bounds hedatzen ${c.NOM}:`, error);
        }
      }
    });
    try {
      this.map.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 15,
      });
    } catch (error) {
      console.error('Errorea mapa bounds doitzen:', error);
    }
  }

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
    this.paginationSource$.next({ pageIndex: event.pageIndex, pageSize: event.pageSize });
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

  private showSnackBar(message: string, error = false): void {
    this.snackBar.open(message, this.translate.instant('COMMON.CLOSE') || 'Itxi', {
      duration: 3000,
      panelClass: error ? 'error-snackbar' : 'success-snackbar',
    });
  }

  private handleMeetingOperation<T>(
    op: Observable<T>,
    successMsg: string,
    errorMsg: string,
    opName: string,
  ): void {
    op.subscribe({
      next: () => {
        this.showSnackBar(this.translate.instant(successMsg) || successMsg);
        this.loadMeetings();
      },
      error: (err) => {
        console.error(`Errorea ${opName}:`, err);
        this.showSnackBar(this.translate.instant(errorMsg) || errorMsg, true);
      },
    });
  }

  openCreateMeetingDialog(_?: Center): void {
    const dialogRef = this.dialog.open(MeetingDialogComponent, { width: '500px', data: null });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const user = this.authService.getUser();
        const data = {
          ...result,
          profesor_id: user?.tipo_id === 3 ? user?.id : undefined,
          alumno_id: user?.tipo_id === 4 ? user?.id : undefined,
        };
        this.handleMeetingOperation(
          this.meetingsService.createMeeting(data),
          'SUCCESS.MEETING_CREATED',
          'ERROR.CREATING_MEETING',
          'createMeeting',
        );
      }
    });
  }

  openEditMeetingDialog(meeting: Meeting): void {
    const dialogRef = this.dialog.open(MeetingDialogComponent, { width: '500px', data: meeting });
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
          'Ziur zaude bilera ezabatu nahi duzula?',
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
    console.log('Zentroaren xehetasunak', center);
  }

  focusOnCenter(center: Center): void {
    if (this.map && center.LONGITUD && center.LATITUD) {
      this.map.flyTo({ center: [center.LATITUD, center.LONGITUD], zoom: 15, essential: true });
      this.markers.get(center.CCEN)?.togglePopup();
    }
  }

  getStatusClass(status: string): string {
    return `status-${status?.toLowerCase() || 'unknown'}`;
  }
}
