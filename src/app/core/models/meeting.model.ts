/**
 * Bileraren egoera motak
 * Bilera batek izan ditzakeen egoerak definitzen ditu
 */
export enum MeetingStatus {
  PENDING = 'pendiente', // Zain
  ACCEPTED = 'aceptada', // Onartuta
  REJECTED = 'denegada', // Ukatua
  CONFLICT = 'conflicto', // Gatazka
}

/**
 * Bileraren interfazea
 * Bilera baten datu guztiak definitzen ditu
 */
export interface Meeting {
  id_reunion?: number;
  titulo: string; // Izenburua
  asunto: string; // Gaia
  fecha: Date | string; // Data
  aula: string; // Gela
  id_centro?: number; // Zentroaren IDa
  profesor_id: number; // Irakaslearen IDa
  alumno_id: number; // Ikaslearen IDa
  estado: MeetingStatus | string; // Egoera

  // Frontend-ekin bateragarritasunerako (aukerakoa)
  title?: string;
  topic?: string;
  date?: Date | string;
  hour?: number;
  classroom?: string;
  status?: string;
  center?: string;
  address?: string;
}
