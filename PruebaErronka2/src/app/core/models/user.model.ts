export interface User {
  id: number;
  email: string;
  username: string;
  password: string;
  nombre: string;
  apellidos: string;
  dni: string;
  direccion: string;
  telefono1: string;
  telefono2: string;
  tipo_id: number;
  argazkia_url?: string;
  created_at: string;
  updated_at: string;
}
