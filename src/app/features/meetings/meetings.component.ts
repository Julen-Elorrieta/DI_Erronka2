import { Component, OnInit, signal, computed, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Meeting, MeetingStatus } from '../../core/models/meeting.model';
import { EducationalCenter, CenterFilter } from '../../core/models/center.model';
import { MeetingsService } from '../../core/services/meetings.service';
import { CentersService } from '../../core/services/centers.service';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';
import { MeetingFormDialogComponent } from './meeting-form-dialog.component';
import { CenterDetailDialogComponent } from './center-detail-dialog.component';

declare var mapboxgl: any;

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
    TranslateModule
  ],
  templateUrl: './meetings.component.html',
  styleUrl: './meetings.component.css'
})
export class MeetingsComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  
  // Estado
  meetings = signal<Meeting[]>([]);
  centers = signal<EducationalCenter[]>([]);
  loading = signal(false);
  activeTab = signal(0);
  
  // Filtros
  titularidades: string[] = [];
  territorios: string[] = [];
  municipios: string[] = [];
  
  selectedTitularidad = '';
  selectedTerritorio = '';
  selectedMunicipio = '';
  searchTerm = '';
  
  // Paginación
  pageSize = 10;
  pageIndex = 0;
  
  // Mapa
  private map: any;
  private markers: any[] = [];
  
  displayedColumns: string[] = ['name', 'dtituc', 'dterr', 'dmunic', 'actions'];
  
  UserRole = UserRole;
  
  isTeacher = computed(() => this.authService.currentUser()?.role === UserRole.TEACHER);
  canCreateMeeting = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === UserRole.TEACHER || role === UserRole.GOD || role === UserRole.ADMIN;
  });

  constructor(
    private meetingsService: MeetingsService,
    private centersService: CentersService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadCenters();
    this.loadMeetings();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
    }, 500);
  }

  private loadFilterOptions(): void {
    this.centersService.getTitularidades().subscribe(t => this.titularidades = t);
    this.centersService.getTerritorios().subscribe(t => this.territorios = t);
    this.centersService.getMunicipios().subscribe(m => this.municipios = m);
  }

  loadCenters(): void {
    this.loading.set(true);
    
    const filter: CenterFilter = {};
    if (this.selectedTitularidad) filter.dtituc = this.selectedTitularidad;
    if (this.selectedTerritorio) filter.dterr = this.selectedTerritorio;
    if (this.selectedMunicipio) filter.dmunic = this.selectedMunicipio;
    if (this.searchTerm) filter.search = this.searchTerm;
    
    this.centersService.getCenters(filter).subscribe({
      next: (centers) => {
        this.centers.set(centers);
        this.loading.set(false);
        this.updateMapMarkers();
      },
      error: () => {
        this.loading.set(false);
        this.showError('Error al cargar centros');
      }
    });
  }

  loadMeetings(): void {
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      this.meetingsService.getUserMeetings(userId).subscribe({
        next: (meetings) => this.meetings.set(meetings),
        error: () => this.showError('Error al cargar reuniones')
      });
    }
  }

  onTerritorioChange(): void {
    if (this.selectedTerritorio) {
      this.centersService.getMunicipios(this.selectedTerritorio).subscribe(m => {
        this.municipios = m;
        this.selectedMunicipio = '';
        this.applyFilters();
      });
    } else {
      this.centersService.getMunicipios().subscribe(m => {
        this.municipios = m;
        this.selectedMunicipio = '';
        this.applyFilters();
      });
    }
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.loadCenters();
  }

  clearFilters(): void {
    this.selectedTitularidad = '';
    this.selectedTerritorio = '';
    this.selectedMunicipio = '';
    this.searchTerm = '';
    this.centersService.getMunicipios().subscribe(m => this.municipios = m);
    this.loadCenters();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getPaginatedCenters(): EducationalCenter[] {
    const start = this.pageIndex * this.pageSize;
    return this.centers().slice(start, start + this.pageSize);
  }

  // Mapa Mapbox
  private initMap(): void {
    if (!this.mapContainer) return;
    
    // Token público de Mapbox (en producción usar uno propio)
    const mapboxToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
    
    try {
      mapboxgl.accessToken = mapboxToken;
      
      this.map = new mapboxgl.Map({
        container: this.mapContainer.nativeElement,
        style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        center: [-2.9253, 43.2627], // Centro en Bilbao
        zoom: 9
      });

      this.map.addControl(new mapboxgl.NavigationControl());
      
      this.map.on('load', () => {
        this.updateMapMarkers();
      });
    } catch (error) {
      console.error('Error inicializando mapa:', error);
    }
  }

  private updateMapMarkers(): void {
    if (!this.map) return;
    
    // Limpiar marcadores existentes
    this.markers.forEach(m => m.remove());
    this.markers = [];
    
    // Añadir marcadores para centros con coordenadas
    this.centers().forEach(center => {
      if (center.coordinates) {
        const el = document.createElement('div');
        el.className = 'map-marker';
        el.innerHTML = '<span class="marker-icon">🏫</span>';
        el.style.cursor = 'pointer';
        
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="popup-content">
              <h4>${center.name}</h4>
              <p>${center.address}</p>
              <p><strong>${center.dmunic}</strong> - ${center.dtituc}</p>
            </div>
          `);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([center.coordinates.longitude, center.coordinates.latitude])
          .setPopup(popup)
          .addTo(this.map);
        
        this.markers.push(marker);
      }
    });

    // Ajustar vista para mostrar todos los marcadores
    if (this.markers.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      this.centers().forEach(c => {
        if (c.coordinates) {
          bounds.extend([c.coordinates.longitude, c.coordinates.latitude]);
        }
      });
      this.map.fitBounds(bounds, { padding: 50 });
    }
  }

  focusOnCenter(center: EducationalCenter): void {
    if (this.map && center.coordinates) {
      this.map.flyTo({
        center: [center.coordinates.longitude, center.coordinates.latitude],
        zoom: 15,
        duration: 1500
      });
    }
  }

  openCenterDetail(center: EducationalCenter): void {
    this.dialog.open(CenterDetailDialogComponent, {
      width: '600px',
      data: { center }
    });
  }

  openCreateMeetingDialog(center?: EducationalCenter): void {
    if (!this.canCreateMeeting()) {
      this.showError('Solo los profesores pueden crear reuniones');
      return;
    }

    const dialogRef = this.dialog.open(MeetingFormDialogComponent, {
      width: '600px',
      data: { meeting: null, center }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.meetingsService.createMeeting(result).subscribe({
          next: () => {
            this.showSuccess('Reunión creada correctamente');
            this.loadMeetings();
          },
          error: () => this.showError('Error al crear reunión')
        });
      }
    });
  }

  getStatusClass(status: MeetingStatus): string {
    return `status-${status.toLowerCase()}`;
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 5000,
      panelClass: ['snackbar-error']
    });
  }
}
