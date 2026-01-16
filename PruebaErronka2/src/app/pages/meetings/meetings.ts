import {
  Component,
  OnInit,
  signal,
  computed,
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
  styleUrl: './meetings.css',
})
export class Meetings implements OnInit, AfterViewInit {
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

  // Pagination
  pageSize = 10;
  pageIndex = 0;

  displayedColumns = ['name', 'DTITUC', 'DTERRC', 'DMUNIC', 'actions'];

  // Map
  private map: L.Map | undefined;
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
  }

  private initializeMap() {
    if (!this.mapContainer) return;
    this.map = L.map(this.mapContainer.nativeElement).setView([42.85, -2.5], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private updateMarkers() {
    if (!this.map) return;
    // Remove existing markers
    this.markers.forEach(marker => this.map!.removeLayer(marker));
    this.markers = [];
    // Add new markers
    this.centers().forEach(center => {
      if (center.LATITUD && center.LONGITUD) {
        const marker = L.marker([center.LONGITUD, center.LATITUD]).addTo(this.map!);
        marker.bindPopup(`${center.NOM} (${center.CCEN})`);
        this.markers.push(marker);
      }
    });
  }

  loadCenters() {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/meetings`).subscribe({
      next: (data) => {
        this.centers.set(data.CENTROS);
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
    this.http.get<any[]>(`${environment.apiUrl}/meetings?type=meetings`).subscribe({
      next: (data) => {
        this.meetings.set(data);
      },
      error: (err) => {
        console.error('Error loading meetings:', err);
        this.snackBar.open('Error loading meetings', 'Close');
      },
    });
  }

  loadFilters() {
    this.http.get<any>(`${environment.apiUrl}/meetings?type=filters`).subscribe({
      next: (data) => {
        this.titularidades = data.titularidades || [];
        this.territorios = data.territorios || [];
        // Load all municipios
        this.http.get<any>(`${environment.apiUrl}/meetings?type=municipios`).subscribe({
          next: (municipiosData) => {
            this.municipios = municipiosData || [];
          },
          error: (err) => {
            console.error('Error loading municipios:', err);
          },
        });
      },
      error: (err) => {
        console.error('Error loading filters:', err);
      },
    });
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
      this.map.flyTo([center.LONGITUD, center.LATITUD], 15);
    }
  }

  applyFilters() {
    const params: any = {};
    if (this.selectedTitularidad) params.titularidad = this.selectedTitularidad;
    if (this.selectedTerritorio) params.territorio = this.selectedTerritorio;
    if (this.selectedMunicipio) params.municipio = this.selectedMunicipio;

    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/meetings`, { params }).subscribe({
      next: (data) => {
        this.centers.set(data.CENTROS);
        this.loading.set(false);
        this.updateMarkers();
      },
      error: (err) => {
        console.error('Error filtering centers:', err);
        this.loading.set(false);
      },
    });
  }

  onTerritorioChange() {
    this.selectedMunicipio = '';
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
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return this.centers().slice(start, end);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getStatusClass(status: string): string {
    return 'status-' + (status ? status.toLowerCase() : 'unknown');
  }
}
