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
  STUDENT = 'STUDENT'
}
