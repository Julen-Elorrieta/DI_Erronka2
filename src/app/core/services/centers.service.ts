import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { EducationalCenter, CenterFilter } from '../models/center.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CentersService {
  private readonly API_URL = `${environment.apiUrl}/centers`;
  private readonly USE_MOCK = environment.production ? false : (environment as any).enableMockData ?? true;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los centros educativos con filtros
   */
  getCenters(filter?: CenterFilter): Observable<EducationalCenter[]> {
    if (this.USE_MOCK) {
      return this.getMockCenters().pipe(
        map(centers => this.applyFilters(centers, filter)),
        delay(300)
      );
    }
    return this.http.get<EducationalCenter[]>(this.API_URL);
  }

  /**
   * Obtiene un centro por ID
   */
  getCenterById(id: string): Observable<EducationalCenter | null> {
    if (this.USE_MOCK) {
      return this.getMockCenters().pipe(
        map(centers => centers.find(c => c.id === id) || null),
        delay(200)
      );
    }
    return this.http.get<EducationalCenter>(`${this.API_URL}/${id}`);
  }

  /**
   * Obtiene valores únicos de DTITUC (tipos de titularidad)
   */
  getTitularidades(): Observable<string[]> {
    if (this.USE_MOCK) {
      return of(['Público', 'Privado', 'Concertado']);
    }
    return this.http.get<string[]>(`${this.API_URL}/titularidades`);
  }

  /**
   * Obtiene valores únicos de DTERR (territorios)
   */
  getTerritorios(): Observable<string[]> {
    if (this.USE_MOCK) {
      return of(['Araba/Álava', 'Bizkaia', 'Gipuzkoa']);
    }
    return this.http.get<string[]>(`${this.API_URL}/territorios`);
  }

  /**
   * Obtiene valores únicos de municipios por territorio
   */
  getMunicipios(territorio?: string): Observable<string[]> {
    if (this.USE_MOCK) {
      const municipios: Record<string, string[]> = {
        'Bizkaia': ['Bilbao', 'Barakaldo', 'Getxo', 'Portugalete', 'Santurtzi', 'Basauri', 'Leioa', 'Galdakao', 'Durango', 'Ermua'],
        'Gipuzkoa': ['Donostia-San Sebastián', 'Irun', 'Errenteria', 'Zarautz', 'Eibar', 'Tolosa', 'Hernani', 'Hondarribia', 'Azpeitia'],
        'Araba/Álava': ['Vitoria-Gasteiz', 'Llodio', 'Amurrio', 'Salvatierra', 'Oyón']
      };
      
      if (territorio && municipios[territorio]) {
        return of(municipios[territorio]).pipe(delay(100));
      }
      
      // Retornar todos los municipios
      const allMunicipios = Object.values(municipios).flat();
      return of(allMunicipios).pipe(delay(100));
    }
    return this.http.get<string[]>(`${this.API_URL}/municipios`, {
      params: territorio ? { territorio } : {}
    });
  }

  private applyFilters(centers: EducationalCenter[], filter?: CenterFilter): EducationalCenter[] {
    if (!filter) return centers;

    let filtered = centers;

    if (filter.dtituc) {
      filtered = filtered.filter(c => c.dtituc === filter.dtituc);
    }

    if (filter.dterr) {
      filtered = filtered.filter(c => c.dterr === filter.dterr);
    }

    if (filter.dmunic) {
      filtered = filtered.filter(c => c.dmunic === filter.dmunic);
    }

    if (filter.search) {
      const term = filter.search.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.address.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  /**
   * MOCK: Datos de centros del País Vasco
   */
  private getMockCenters(): Observable<EducationalCenter[]> {
    const mockCenters: EducationalCenter[] = [
      {
        id: '1',
        code: '014777',
        name: 'CIFP Elorrieta-Errekamari LHII',
        dtituc: 'Público',
        dterr: 'Bizkaia',
        dmunic: 'Bilbao',
        address: 'Calle Lehendakari Aguirre, 184',
        postalCode: '48015',
        phone: '944765000',
        email: 'info@elorrieta-errekamari.hezkuntza.net',
        coordinates: { latitude: 43.2627, longitude: -2.9253 }
      },
      {
        id: '2',
        code: '014775',
        name: 'CIFP Txurdinaga LHII',
        dtituc: 'Público',
        dterr: 'Bizkaia',
        dmunic: 'Bilbao',
        address: 'Gabriel Aresti, 5',
        postalCode: '48004',
        phone: '944123456',
        coordinates: { latitude: 43.2720, longitude: -2.9127 }
      },
      {
        id: '3',
        code: '014780',
        name: 'IES Miguel de Unamuno BHI',
        dtituc: 'Público',
        dterr: 'Bizkaia',
        dmunic: 'Bilbao',
        address: 'Elcano, 16',
        postalCode: '48008',
        coordinates: { latitude: 43.2589, longitude: -2.9340 }
      },
      {
        id: '4',
        code: '014201',
        name: 'Colegio Vizcaya Ikastetxea',
        dtituc: 'Concertado',
        dterr: 'Bizkaia',
        dmunic: 'Bilbao',
        address: 'Campo Volantín, 18',
        postalCode: '48007',
        coordinates: { latitude: 43.2611, longitude: -2.9401 }
      },
      {
        id: '5',
        code: '014350',
        name: 'Colegio San Viator Ikastetxea',
        dtituc: 'Concertado',
        dterr: 'Bizkaia',
        dmunic: 'Basauri',
        address: 'Uribarri, 26',
        postalCode: '48970',
        coordinates: { latitude: 43.2357, longitude: -2.8859 }
      },
      {
        id: '6',
        code: '015001',
        name: 'CIFP Usurbil LHII',
        dtituc: 'Público',
        dterr: 'Gipuzkoa',
        dmunic: 'Donostia-San Sebastián',
        address: 'Zubimusu, 8',
        postalCode: '20170',
        coordinates: { latitude: 43.2765, longitude: -2.0463 }
      },
      {
        id: '7',
        code: '015100',
        name: 'IES Usandizaga-Peñaflorida-Amara BHI',
        dtituc: 'Público',
        dterr: 'Gipuzkoa',
        dmunic: 'Donostia-San Sebastián',
        address: 'Paseo de Anoeta, 30',
        postalCode: '20014',
        coordinates: { latitude: 43.3050, longitude: -1.9792 }
      },
      {
        id: '8',
        code: '010100',
        name: 'CIFP Ciudad Jardín LHII',
        dtituc: 'Público',
        dterr: 'Araba/Álava',
        dmunic: 'Vitoria-Gasteiz',
        address: 'Ciudad Jardín, 15',
        postalCode: '01010',
        coordinates: { latitude: 42.8467, longitude: -2.6726 }
      },
      {
        id: '9',
        code: '010200',
        name: 'IES Federico Baraibar BHI',
        dtituc: 'Público',
        dterr: 'Araba/Álava',
        dmunic: 'Vitoria-Gasteiz',
        address: 'Nieves Cano, 14',
        postalCode: '01006',
        coordinates: { latitude: 42.8512, longitude: -2.6834 }
      },
      {
        id: '10',
        code: '014800',
        name: 'CIFP Nicolás Larburu LHII',
        dtituc: 'Público',
        dterr: 'Bizkaia',
        dmunic: 'Barakaldo',
        address: 'Maestro Zubeldia, 3',
        postalCode: '48901',
        coordinates: { latitude: 43.2971, longitude: -2.9863 }
      },
      {
        id: '11',
        code: '014850',
        name: 'Colegio Salesianos Deusto',
        dtituc: 'Concertado',
        dterr: 'Bizkaia',
        dmunic: 'Bilbao',
        address: 'Avda. Lehendakari Aguirre, 75',
        postalCode: '48014',
        coordinates: { latitude: 43.2698, longitude: -2.9445 }
      },
      {
        id: '12',
        code: '015150',
        name: 'Colegio La Salle Donostia',
        dtituc: 'Concertado',
        dterr: 'Gipuzkoa',
        dmunic: 'Donostia-San Sebastián',
        address: 'Aldakonea, 4',
        postalCode: '20012',
        coordinates: { latitude: 43.3124, longitude: -1.9872 }
      },
      {
        id: '13',
        code: '014810',
        name: 'IES Ibarrekolanda BHI',
        dtituc: 'Público',
        dterr: 'Bizkaia',
        dmunic: 'Bilbao',
        address: 'Ibarrekolanda, 97',
        postalCode: '48015',
        coordinates: { latitude: 43.2545, longitude: -2.9367 }
      },
      {
        id: '14',
        code: '015200',
        name: 'IES Eibar BHI',
        dtituc: 'Público',
        dterr: 'Gipuzkoa',
        dmunic: 'Eibar',
        address: 'Otaola, 29',
        postalCode: '20600',
        coordinates: { latitude: 43.1847, longitude: -2.4712 }
      },
      {
        id: '15',
        code: '010300',
        name: 'Colegio Urkide Ikastetxea',
        dtituc: 'Privado',
        dterr: 'Araba/Álava',
        dmunic: 'Vitoria-Gasteiz',
        address: 'Landázuri, 7',
        postalCode: '01008',
        coordinates: { latitude: 42.8534, longitude: -2.6752 }
      }
    ];

    return of(mockCenters);
  }
}
