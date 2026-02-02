/**
 * Ordutegiaren slot interfazea
 * Ordutegiaren gelaxka bakoitzaren datuak definitzen ditu
 */
export interface ScheduleSlot {
  day: number;    // 0-4 (Astelehena-Ostirala)
  hour: number;   // 1-6 ordua
  type: 'CLASS' | 'TUTORIA' | 'GUARDIA' | 'MEETING' | 'EMPTY';
  subject?: string;   // Ikasgaia
  cycle?: string;     // Zikloa
  course?: string;    // Kurtsoa
  meetingId?: number; // Bileraren IDa
}

/**
 * Erabiltzailearen ordutegia
 * Slot guztiak biltzen ditu
 */
export interface Schedule {
  userId: number;
  slots: ScheduleSlot[];
}
