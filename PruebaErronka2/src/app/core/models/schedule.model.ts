export interface ScheduleSlot {
  day: number; // 0-4 (Astelehena-Ostirala)
  hour: number; // 1-6
  type: 'CLASS' | 'TUTORIA' | 'GUARDIA' | 'MEETING' | 'EMPTY';
  subject?: string;
  cycle?: string;
  course?: string;
  meetingId?: number;
}

export interface Schedule {
  userId: number;
  slots: ScheduleSlot[];
}
