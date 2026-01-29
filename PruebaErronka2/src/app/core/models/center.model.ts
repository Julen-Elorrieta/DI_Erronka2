export interface EducationalCenter {
  id: string;
  code: string;
  name: string;
  dtituc: string; // Titulartasun mota (Publikoa, Pribatua, etab.)
  dterr: string; // Lurraldea (Araba, Bizkaia, Gipuzkoa)
  dmunic: string; // Udalerria
  address: string;
  postalCode: string;
  phone?: string;
  email?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface CenterFilter {
  dtituc?: string;
  dterr?: string;
  dmunic?: string;
  search?: string;
}
