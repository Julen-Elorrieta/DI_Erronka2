export enum MeetingStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  CANCELLED = 'CANCELLED',
  CONFLICT = 'CONFLICT'
}

export interface Meeting {
  id: number;
  title: string;
  topic: string;
  date: Date;
  hour: number; // 1-6
  classroom: string;
  status: MeetingStatus;
  location: {
    center: string;
    address: string;
    latitude?: number;
    longitude?: number;
  };
  participants: {
    teacherId: number;
    studentId: number;
  };
}
