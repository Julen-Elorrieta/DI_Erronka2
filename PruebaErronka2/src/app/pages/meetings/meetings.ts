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
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import * as L from 'leaflet';
import 'leaflet.markercluster';

import {
  BehaviorSubject,
  Observable,
  combineLatest,
  Subject,
  of,
} from 'rxjs';
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
  // Campo de búsqueda preprocesado
  _searchableText?: string;
}

interface Meeting {
  id: string;
  title: string;
  date: Date;
  hour: string;
  classroom: string;
  center: string;
  status: string;
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
    localStorage.setItem(
      'centersCache',
      JSON.stringify({ data, timestamp: Date.now() })
    );
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
    TranslateModule,
  ],
  templateUrl: './meetings.html',
  styleUrls: ['./meetings.css'],
  changeDetection: ChangeDetectionStrategy.OnPush, // ✅ OnPush activado
})
export class Meetings implements OnInit, AfterViewInit, OnDestroy {
  // ============================================================================
  // INYECCIÓN DE DEPENDENCIAS
  // ============================================================================
  private readonly http = inject(HttpClient);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  // ============================================================================
  // SUBJECTS PARA STREAMS REACTIVOS
  // ============================================================================
  private readonly destroy$ = new Subject<void>();
  
  // Estado de datos
  private readonly centersSource$ = new BehaviorSubject<Center[]>([]);
  private readonly meetingsSource$ = new BehaviorSubject<Meeting[]>([]);
  private readonly loadingSource$ = new BehaviorSubject<boolean>(false);
  
  // Estado de filtros
  private readonly searchTextSource$ = new BehaviorSubject<string>('');
  private readonly titularidadSource$ = new BehaviorSubject<string>('');
  private readonly territorioSource$ = new BehaviorSubject<string>('');
  private readonly municipioSource$ = new BehaviorSubject<string>('');
  
  // Estado de paginación
  private readonly paginationSource$ = new BehaviorSubject<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  
  // Estado de tabs
  private readonly activeTabSource$ = new BehaviorSubject<number>(0);

  // Estado del mapa
  private readonly mapInitialized$ = new BehaviorSubject<boolean>(false);

  // ============================================================================
  // OBSERVABLES PÚBLICOS (para el template con async pipe)
  // ============================================================================
  
  // Stream combinado de filtros (con cache para evitar recálculos)
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
    shareReplay(1)
  );

  // Stream de datos procesados (filtrado, paginación, opciones)
  readonly processedData$: Observable<ProcessedData> = combineLatest([
    this.centersSource$,
    this.filters$,
    this.paginationSource$,
  ]).pipe(
    map(([centers, filters, pagination]) => {
      // Filtrado con campo de búsqueda preprocesado
      const filtered = this.filterCenters(centers, filters);
      
      // Opciones de filtro dinámicas
      const filterOptions = this.calculateFilterOptions(centers, filters);
      
      // Paginación
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
    shareReplay(1)
  );

  // Stream separado para actualizar marcadores del mapa
  private readonly mapMarkersUpdate$ = combineLatest([
    this.processedData$,
    this.mapInitialized$,
  ]).pipe(
    filter(([_, initialized]) => initialized),
    map(([data, _]) => data.filtered),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    takeUntil(this.destroy$)
  );

  // Observables individuales derivados
  readonly loading$ = this.loadingSource$.asObservable();
  readonly meetings$ = this.meetingsSource$.asObservable();
  readonly activeTab$ = this.activeTabSource$.asObservable();
  readonly pagination$ = this.paginationSource$.asObservable();

  // ============================================================================
  // CONSTANTES PARA EL TEMPLATE
  // ============================================================================
  readonly displayedColumns = ['name', 'DTITUC', 'DTERRC', 'DMUNIC', 'actions'];
  readonly pageSizeOptions = [5, 10, 25, 50];

  // ✅ TrackBy function para MatTable (se usa con CDK Virtual Scroll si es necesario)
  readonly trackByCenter = (index: number, center: Center): string => {
    return center.CCEN || center.id || `${index}`;
  };

  readonly trackByMeeting = (index: number, meeting: Meeting): string => {
    return meeting.id || `${index}`;
  };

  // ============================================================================
  // MAPA LEAFLET
  // ============================================================================
  private map: L.Map | null = null;
  private markerClusterGroup: any = null;
  private currentMarkers: Set<string> = new Set();

  // ============================================================================
  // LIFECYCLE HOOKS
  // ============================================================================

  ngOnInit(): void {
    // ✅ Fix de iconos de Leaflet (problema conocido)
    this.fixLeafletIcons();
    
    this.loadInitialData();
    this.setupFilterCascade();
    
    // Suscribirse a actualizaciones del mapa CUANDO haya datos
    this.processedData$
      .pipe(
        takeUntil(this.destroy$),
        // Esperar a que el ViewChild esté disponible
        filter(() => !!this.mapContainer),
        take(1) // Solo la primera vez
      )
      .subscribe(() => {
        console.log('Datuak eskuragarri, mapa hasieratzen...');
        setTimeout(() => {
          this.initializeMap();
        }, 200);
      });
    
    // Actualizar marcadores cuando cambie la lista filtrada
    this.mapMarkersUpdate$.subscribe(centers => {
      this.updateMapMarkers(centers);
    });
  }

  ngAfterViewInit(): void {
    console.log('AfterViewInit exekutatuta');
    console.log('- MapContainer eskuragarri:', !!this.mapContainer);
    
    // Ya no inicializamos aquí, esperamos a que haya datos en ngOnInit
    
    // Invalidar tamaño cuando cambia el tab
    this.activeTab$
      .pipe(
        filter(tab => tab === 0),
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.map) {
          console.log('Maparen tamaina baliogabetzen');
          this.map.invalidateSize();
        }
      });
  }

  ngOnDestroy(): void {
    // ✅ Limpieza completa de memoria
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  // ============================================================================
  // CARGA DE DATOS
  // ============================================================================

  private loadInitialData(): void {
    // Intentar cargar desde caché primero
    const cached = getCachedCenters();
    if (cached && cached.length > 0) {
      this.centersSource$.next(this.preprocessCenters(cached));
      // Recargar en background
      setTimeout(() => this.fetchCentersFromAPI(true), 1000);
    } else {
      this.fetchCentersFromAPI(false);
    }
    
    // Cargar meetings (si aplica)
    this.loadMeetings();
  }

  private fetchCentersFromAPI(silent: boolean): void {
    if (!silent) {
      this.loadingSource$.next(true);
    }

    this.http
      .get<Center[]>(`${environment.apiUrl}/meetings`)
      .pipe(
        map(centers => this.preprocessCenters(centers)),
        tap(centers => setCachedCenters(centers)),
        catchError(err => {
          console.error('Error loading centers:', err);
          this.snackBar.open(
            this.translate.instant('ERROR.LOADING_CENTERS'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 3000 }
          );
          return of([]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(centers => {
        this.centersSource$.next(centers);
        this.loadingSource$.next(false);
      });
  }

  private loadMeetings(): void {
    // Implementar carga de meetings si es necesario
    this.meetingsSource$.next([]);
  }

  // ============================================================================
  // PREPROCESAMIENTO DE DATOS (para optimizar búsqueda)
  // ============================================================================

  private preprocessCenters(centers: Center[]): Center[] {
    return centers.map(center => ({
      ...center,
      // ✅ Campo de búsqueda unificado preprocesado
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
        .replace(/[\u0300-\u036f]/g, ''), // Eliminar acentos
    }));
  }

  // ============================================================================
  // FILTRADO CON CACHÉ
  // ============================================================================

  private filterCenters(centers: Center[], filters: FilterState): Center[] {
    return centers.filter(center => {
      // Búsqueda de texto en campo preprocesado
      if (filters.searchText && !center._searchableText?.includes(filters.searchText)) {
        return false;
      }
      
      // Filtros exactos
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
    return !!(
      filters.searchText ||
      filters.titularidad ||
      filters.territorio ||
      filters.municipio
    );
  }

  // ============================================================================
  // OPCIONES DE FILTRO DINÁMICAS (en cascada)
  // ============================================================================

  private calculateFilterOptions(
    centers: Center[],
    currentFilters: FilterState
  ): { titularidades: string[]; territorios: string[]; municipios: string[] } {
    // Filtrar centros según filtros activos (en cascada)
    let availableCenters = centers;

    if (currentFilters.territorio) {
      availableCenters = availableCenters.filter(
        c => c.DTERRC === currentFilters.territorio
      );
    }

    if (currentFilters.titularidad) {
      availableCenters = availableCenters.filter(
        c => c.DTITUC === currentFilters.titularidad
      );
    }

    // Extraer opciones únicas
    const titularidades = [
      ...new Set(
        centers
          .filter(c => !currentFilters.territorio || c.DTERRC === currentFilters.territorio)
          .map(c => c.DTITUC)
      ),
    ].sort();

    const territorios = [
      ...new Set(
        centers
          .filter(c => !currentFilters.titularidad || c.DTITUC === currentFilters.titularidad)
          .map(c => c.DTERRC)
      ),
    ].sort();

    const municipios = [...new Set(availableCenters.map(c => c.DMUNIC))].sort();

    return { titularidades, territorios, municipios };
  }

  // ============================================================================
  // CASCADA DE FILTROS
  // ============================================================================

  private setupFilterCascade(): void {
    // Cuando cambia territorio, limpiar municipio si ya no está disponible
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
        takeUntil(this.destroy$)
      )
      .subscribe(municipio => {
        if (municipio !== this.municipioSource$.value) {
          this.municipioSource$.next(municipio);
        }
      });
  }

  // ============================================================================
  // MAPA LEAFLET OPTIMIZADO
  // ============================================================================

  private fixLeafletIcons(): void {
    // Fix conocido de Leaflet para iconos de marcadores
    try {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      console.log('Leaflet ikonoak konfiguratuta');
    } catch (error) {
      console.error('Errorea ikonoak konfiguratzerakoan:', error);
    }
  }

  private initializeMap(): void {
    console.log('📍 Intentando inicializar mapa...');
    console.log('- MapContainer:', this.mapContainer);
    console.log('- Mapa ya existe:', !!this.map);

    if (!this.mapContainer) {
      console.error('❌ MapContainer no está disponible');
      return;
    }

    if (this.map) {
      console.warn('⚠️ Mapa ya inicializado');
      return;
    }

    try {
      const container = this.mapContainer.nativeElement;
      console.log('- Container element:', container);
      console.log('- Container dimensions:', {
        width: container.offsetWidth,
        height: container.offsetHeight
      });

      // Crear mapa
      this.map = L.map(container, {
        preferCanvas: true,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true,
      }).setView([42.85, -2.5], 8);

      console.log('✅ Instancia de mapa creada');

      // Añadir tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(this.map);

      console.log('✅ Tiles añadidos al mapa');

      // Crear cluster group
      this.markerClusterGroup = (L as any).markerClusterGroup({
        animate: true,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        maxClusterRadius: 50,
        chunkedLoading: true,
      });

      this.map.addLayer(this.markerClusterGroup);
      console.log('✅ Cluster group añadido');

      // Invalidar tamaño después de un momento
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          console.log('✅ Tamaño del mapa invalidado');
        }
      }, 250);

      // Marcar como inicializado
      this.mapInitialized$.next(true);
      console.log('✅ Mapa completamente inicializado');

    } catch (error) {
      console.error('❌ Error inicializando mapa:', error);
      this.mapInitialized$.next(false);
    }
  }

  private updateMapMarkers(centers: Center[]): void {
    if (!this.map || !this.markerClusterGroup) {
      console.warn('Mapa oraindik hasieratu gabe, itxaroten...');
      return;
    }

    console.log(`Markatzaileak eguneratzen: ${centers.length} zentro`);

    // ✅ Actualización incremental de marcadores
    const newMarkerIds = new Set(
      centers
        .filter(c => c.LATITUD && c.LONGITUD)
        .map(c => c.CCEN)
    );

    console.log(`- Markatzaile baliodunak: ${newMarkerIds.size}`);

    // Remover marcadores que ya no están en la lista filtrada
    let removed = 0;
    this.markerClusterGroup.eachLayer((layer: any) => {
      const markerId = layer.options.centerId;
      if (!newMarkerIds.has(markerId)) {
        this.markerClusterGroup.removeLayer(layer);
        this.currentMarkers.delete(markerId);
        removed++;
      }
    });

    if (removed > 0) {
      console.log(`- Kendutako markatzaileak: ${removed}`);
    }

    // Añadir nuevos marcadores en lotes (para no bloquear UI)
    const markersToAdd = centers.filter(
      c => c.LATITUD && c.LONGITUD && !this.currentMarkers.has(c.CCEN)
    );

    if (markersToAdd.length > 0) {
      console.log(`- Gehitzeko markatzaileak: ${markersToAdd.length}`);
      this.addMarkersInBatches(markersToAdd);
    } else {
      console.log('- Ez dago markatzaile berririk gehitzeko');
    }
  }

  private addMarkersInBatches(centers: Center[]): void {
    const batchSize = 50;
    let index = 0;

    const addBatch = () => {
      const batch = centers.slice(index, index + batchSize);
      
      batch.forEach(center => {
        const marker = L.marker([center.LATITUD, center.LONGITUD], {
          riseOnHover: true,
          centerId: center.CCEN,
        } as any);

        marker.bindPopup(`
          <div style="min-width: 200px;">
            <strong>${center.NOM}</strong><br>
            <small>${center.CCEN}</small><br>
            ${center.DMUNIC} - ${center.DTERRC}
          </div>
        `);

        this.markerClusterGroup.addLayer(marker);
        this.currentMarkers.add(center.CCEN);
      });

      index += batchSize;

      if (index < centers.length) {
        requestAnimationFrame(addBatch);
      } else {
        console.log(`${centers.length} markatzaile gehituta guztira`);
        // Ajustar vista a los marcadores
        this.fitMapBounds();
      }
    };

    if (centers.length > 0) {
      addBatch();
    }
  }

  private fitMapBounds(): void {
    if (!this.map || !this.markerClusterGroup) return;

    const bounds = this.markerClusterGroup.getBounds();
    if (bounds.isValid()) {
      this.map.fitBounds(bounds, {
        padding: [30, 30],
        maxZoom: 15,
        animate: true,
      });
    }
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS PARA EL TEMPLATE (solo emiten a subjects)
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

  // ============================================================================
  // MÉTODOS DE ACCIÓN
  // ============================================================================

  canCreateMeeting(): boolean {
    return true; // Implementar lógica de permisos
  }

  openCreateMeetingDialog(center?: Center): void {
    // Implementar diálogo
    console.log('Create meeting', center);
  }

  openCenterDetail(center: Center): void {
    // Implementar detalle
    console.log('Center detail', center);
  }

  focusOnCenter(center: Center): void {
    if (this.map && center.LATITUD && center.LONGITUD) {
      this.map.flyTo([center.LATITUD, center.LONGITUD], 15, {
        animate: true,
        duration: 0.7,
      });

      // Abrir popup del marcador
      this.markerClusterGroup.eachLayer((layer: any) => {
        if (layer.options.centerId === center.CCEN) {
          layer.openPopup();
        }
      });
    }
  }

  getStatusClass(status: string): string {
    return `status-${status?.toLowerCase() || 'unknown'}`;
  }
}