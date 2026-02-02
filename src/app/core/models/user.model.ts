/**
 * Erabiltzailearen interfazea
 * Erabiltzailearen datu guztiak definitzen ditu
 */
export interface User {
  id: number;
  email: string;
  username: string;
  password: string;
  nombre: string;      // Izena
  apellidos: string;   // Abizenak
  dni: string;         // NAN
  direccion: string;   // Helbidea
  telefono1: string;   // Lehen telefonoa
  telefono2: string;   // Bigarren telefonoa
  tipo_id: number;     // Rol mota (1=GOD, 2=ADMIN, 3=IRAKASLEA, 4=IKASLEA)
  argazkia_url?: string; // Argazkiaren URLa
  created_at: string;
  updated_at: string;
}

/**
 * tipo_id zenbakitik UserRole enum-a lortzen du
 * @param tipo_id Erabiltzaile motaren IDa
 * @returns UserRole enum balioa
 */
export function getUserRoleFromTipoId(tipo_id: number): UserRole {
  switch (tipo_id) {
    case 1:
      return UserRole.GOD;
    case 2:
      return UserRole.ADMIN;
    case 3:
      return UserRole.TEACHER;
    case 4:
      return UserRole.STUDENT;
    default:
      throw new Error('Unknown tipo_id for UserRole: ' + tipo_id);
  }
}

export enum UserRole {
  GOD = 'GOD',
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}
