export enum UserRole {
  GOD = 'GOD',
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  surname: string;
  role: UserRole;
  photo?: string;
  // Campos específicos de estudiantes
  cycle?: string;
  course?: string;
  isDual?: boolean;
  group?: string;
}
