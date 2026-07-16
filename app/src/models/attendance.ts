export interface AttendanceRecord {
  id: number;
  date: string; // YYYY-MM-DD
  clockIn: string; // HH:MM
  clockOut: string | null; // HH:MM（未退勤は null）
  note: string;
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  workDays: number;
  totalWorkedMinutes: number;
  averageWorkedMinutes: number;
}
