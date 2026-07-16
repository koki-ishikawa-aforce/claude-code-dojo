import type { Db } from '../db.js';
import type { AttendanceRecord } from '../models/attendance.js';

interface AttendanceRow {
  id: number;
  date: string;
  clock_in: string;
  clock_out: string | null;
  note: string;
}

function toRecord(row: AttendanceRow): AttendanceRecord {
  return {
    id: row.id,
    date: row.date,
    clockIn: row.clock_in,
    clockOut: row.clock_out,
    note: row.note
  };
}

/**
 * 勤怠記録を1件登録する。
 */
export function addAttendance(
  db: Db,
  input: { date: string; clockIn: string; clockOut?: string | null; note?: string }
): AttendanceRecord {
  const result = db
    .prepare('INSERT INTO attendance (date, clock_in, clock_out, note) VALUES (?, ?, ?, ?)')
    .run(input.date, input.clockIn, input.clockOut ?? null, input.note ?? '');
  return {
    id: Number(result.lastInsertRowid),
    date: input.date,
    clockIn: input.clockIn,
    clockOut: input.clockOut ?? null,
    note: input.note ?? ''
  };
}

/**
 * 指定月（YYYY-MM）の勤怠記録を日付順に取得する。
 */
export function listAttendance(db: Db, month: string): AttendanceRecord[] {
  const rows = db
    .prepare("SELECT * FROM attendance WHERE date LIKE ? || '-%' ORDER BY date")
    .all(month) as AttendanceRow[];
  return rows.map(toRecord);
}
