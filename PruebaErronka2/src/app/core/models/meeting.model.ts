export enum MeetingStatus {
  PENDING = 'pendiente',
  ACCEPTED = 'aceptada',
  REJECTED = 'denegada',
  CONFLICT = 'conflicto',
}

export interface Meeting {
  id_reunion?: number;
  titulo: string;
  asunto: string;
  fecha: Date | string;
  aula: string;
  id_centro?: number;
  profesor_id: number;
  alumno_id: number;
  estado: MeetingStatus | string;

  // Para compatibilidad con frontend (opcional)
  title?: string;
  topic?: string;
  date?: Date | string;
  hour?: number;
  classroom?: string;
  status?: string;
  center?: string;
  address?: string;
}
