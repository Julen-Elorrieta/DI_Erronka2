export interface EducationalCenter {
  id: string;
  code: string;
  name: string;
  dtituc: string;  // Tipo titularidad (Público, Privado, etc.)
  dterr: string;   // Territorio (Araba, Bizkaia, Gipuzkoa)
  dmunic: string;  // Municipio
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
