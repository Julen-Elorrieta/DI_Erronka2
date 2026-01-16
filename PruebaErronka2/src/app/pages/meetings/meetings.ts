import {
  Component,
  OnInit,
  signal,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import * as L from 'leaflet';
import 'leaflet.markercluster';

@Component({
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
    DatePipe,
  ],
  templateUrl: './meetings.html',
  styleUrls: ['./meetings.css']
})
export class Meetings implements OnInit, AfterViewInit {
  // ...existing code...
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  private http = inject(HttpClient);

  // Signals
  activeTab = signal(0);
  centers = signal<any[]>([]);
  meetings = signal<any[]>([]);
  loading = signal(false);

  // Filters
  selectedTitularidad = '';
  selectedTerritorio = '';
  selectedMunicipio = '';
  titularidades: string[] = [];
  territorios: string[] = [];
  municipios: string[] = [];
  searchName = '';

  // Pagination
  pageSize = 10;
  pageIndex = 0;

  displayedColumns = ['name', 'DTITUC', 'DTERRC', 'DMUNIC', 'actions'];

  hasActiveFilters(): boolean {
    return !!(
      this.selectedTitularidad ||
      this.selectedTerritorio ||
      this.selectedMunicipio ||
      (this.searchName && this.searchName.trim() !== '')
    );
  }

  // Map
  private map: L.Map | undefined;
  private markerClusterGroup: any;
  private markers: L.Marker[] = [];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.loadCenters();
    this.loadMeetings();
    this.loadFilters();
  }

  ngAfterViewInit() {
    this.initializeMap();
    // Invalida el tamaño del mapa al cambiar de pestaña para evitar glitches
    setTimeout(() => {
      if (this.map) this.map.invalidateSize();
    }, 300);
  }

  private initializeMap() {
    if (!this.mapContainer || this.map) return;
    this.map = L.map(this.mapContainer.nativeElement, {
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
      inertia: true,
      worldCopyJump: true,
      preferCanvas: true,
    }).setView([42.85, -2.5], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);
    this.markerClusterGroup = L.markerClusterGroup({
      animate: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
    });
    this.map.addLayer(this.markerClusterGroup);
  }

  private updateMarkers() {
    if (!this.map || !this.markerClusterGroup) return;
    this.markerClusterGroup.clearLayers();
    this.markers = [];
    let filtered = this.centers();
    if (this.selectedTitularidad) {
      filtered = filtered.filter((c) => c.DTITUC === this.selectedTitularidad);
    }
    if (this.selectedTerritorio) {
      filtered = filtered.filter((c) => c.DTERRC === this.selectedTerritorio);
    }
    if (this.selectedMunicipio) {
      filtered = filtered.filter((c) => c.DMUNIC === this.selectedMunicipio);
    }
    if (this.searchName && this.searchName.trim() !== '') {
      const search = this.searchName.trim().toLowerCase();
      filtered = filtered.filter((c) => (c.NOM || '').toLowerCase().includes(search));
    }
    filtered.forEach((center) => {
      if (center.LATITUD && center.LONGITUD) {
        const marker = L.marker([center.LONGITUD, center.LATITUD], {
          riseOnHover: true,
          keyboard: false,
        });
        marker.bindPopup(`<b>${center.NOM}</b><br>${center.CCEN}`);
        this.markerClusterGroup!.addLayer(marker);
        this.markers.push(marker);
      }
    });
    // Autoajustar vista a los marcadores si hay alguno
    if (this.markers.length > 0) {
      const group = new L.FeatureGroup(this.markers);
      this.map.fitBounds(group.getBounds(), { padding: [30, 30], animate: true, duration: 0.7 });
    }
  }

  loadCenters() {
    this.loading.set(true);
    this.http.get<any[]>(`${environment.apiUrl}/CENTROS`).subscribe({
      next: (data) => {
        this.centers.set(data);
        this.loading.set(false);
        this.updateMarkers();
      },
      error: (err) => {
        console.error('Error loading centers:', err);
        this.snackBar.open('Error loading centers', 'Close');
        this.loading.set(false);
      },
    });
  }

  loadMeetings() {
    // Si tienes reuniones en el JSON, usa el endpoint correspondiente. Si no, puedes dejarlo vacío o eliminarlo.
    this.meetings.set([]);
  }

  loadFilters() {
    this.http.get<any[]>(`${environment.apiUrl}/CENTROS`).subscribe({
      next: (data) => {
        this.updateFilterOptions(data);
      },
      error: (err) => {
        console.error('Error loading filters:', err);
      },
    });
  }

  updateFilterOptions(data: any[]) {
    let filtered = data;
    if (this.selectedTitularidad) {
      filtered = filtered.filter((r) => r.DTITUC === this.selectedTitularidad);
    }
    if (this.selectedTerritorio) {
      filtered = filtered.filter((r) => r.DTERRC === this.selectedTerritorio);
    }
    this.titularidades = [
      ...new Set(
        data
          .filter((r) => !this.selectedTerritorio || r.DTERRC === this.selectedTerritorio)
          .map((r) => r.DTITUC),
      ),
    ];
    this.territorios = [
      ...new Set(
        data
          .filter((r) => !this.selectedTitularidad || r.DTITUC === this.selectedTitularidad)
          .map((r) => r.DTERRC),
      ),
    ];
    this.municipios = [...new Set(filtered.map((r) => r.DMUNIC))];
  }

  canCreateMeeting(): boolean {
    return true; // Stub
  }

  openCreateMeetingDialog(center?: any) {
    // Stub
  }

  openCenterDetail(center: any) {
    // Stub
  }

  focusOnCenter(center: any) {
    if (this.map && center.LATITUD && center.LONGITUD) {
      this.map.flyTo([center.LONGITUD, center.LATITUD], 15, {
        animate: true,
        duration: 0.7,
        easeLinearity: 0.25,
      });
      // Abrir popup del marcador correspondiente
      const marker = this.markers.find((m) => {
        const latlng = m.getLatLng();
        return latlng.lat === center.LONGITUD && latlng.lng === center.LATITUD;
      });
      if (marker) marker.openPopup();
    }
  }

  applyFilters() {
    // El filtrado se hace en el frontend, pero también actualizamos las opciones de los combos
    this.pageIndex = 0;
    this.http.get<any[]>(`${environment.apiUrl}/CENTROS`).subscribe({
      next: (data) => {
        this.updateFilterOptions(data);
        this.updateMarkersWithFilters();
      },
      error: (err) => {
        console.error('Error updating filter options:', err);
      },
    });
  }

  updateMarkersWithFilters() {
    if (!this.map) return;
    // Remove existing markers
    this.markers.forEach((marker) => this.map!.removeLayer(marker));
    this.markers = [];
    // Add new markers based on filtered centers
    let filtered = this.centers();
    if (this.selectedTitularidad) {
      filtered = filtered.filter((c) => c.DTITUC === this.selectedTitularidad);
    }
    if (this.selectedTerritorio) {
      filtered = filtered.filter((c) => c.DTERRC === this.selectedTerritorio);
    }
    if (this.selectedMunicipio) {
      filtered = filtered.filter((c) => c.DMUNIC === this.selectedMunicipio);
    }
    if (this.searchName && this.searchName.trim() !== '') {
      const search = this.searchName.trim().toLowerCase();
      filtered = filtered.filter((c) => (c.NOM || '').toLowerCase().includes(search));
    }
    filtered.forEach((center) => {
      if (center.LATITUD && center.LONGITUD) {
        const marker = L.marker([center.LONGITUD, center.LATITUD]).addTo(this.map!);
        marker.bindPopup(`${center.NOM} (${center.CCEN})`);
        this.markers.push(marker);
      }
    });
  }

  onTerritorioChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.selectedTitularidad = '';
    this.selectedTerritorio = '';
    this.selectedMunicipio = '';
    this.municipios = [];
    this.applyFilters();
  }

  getPaginatedCenters() {
    let filtered = this.centers();
    if (this.selectedTitularidad) {
      filtered = filtered.filter((c) => c.DTITUC === this.selectedTitularidad);
    }
    if (this.selectedTerritorio) {
      filtered = filtered.filter((c) => c.DTERRC === this.selectedTerritorio);
    }
    if (this.selectedMunicipio) {
      filtered = filtered.filter((c) => c.DMUNIC === this.selectedMunicipio);
    }
    if (this.searchName && this.searchName.trim() !== '') {
      const search = this.searchName.trim().toLowerCase();
      filtered = filtered.filter((c) => (c.NOM || '').toLowerCase().includes(search));
    }
    // Actualizar los marcadores del mapa cada vez que se filtra
    this.updateMarkersWithFilters();
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return filtered.slice(start, end);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getStatusClass(status: string): string {
    return 'status-' + (status ? status.toLowerCase() : 'unknown');
  }
}
