import type { AttendanceRecord, MonthlySummary } from '../models/attendance.js';
import { calcBreakMinutes, toMinutes } from '../utils/time.js';

/**
 * 1レコードの実働時間（分）を計算する。
 */
export function calcWorkedMinutes(record: AttendanceRecord): number {
  if (record.clockOut === null) {
    throw new Error(`record ${record.id} is not clocked out`);
  }
  const gross = toMinutes(record.clockOut) - toMinutes(record.clockIn);
  return gross - calcBreakMinutes(gross);
}

/**
 * 指定月の勤怠レコードから月次サマリーを計算する。
 */
export function buildMonthlySummary(month: string, records: AttendanceRecord[]): MonthlySummary {
  const closed = records.filter((r) => r.date.startsWith(month));
  let total = 0;
  for (const record of closed) {
    total = calcWorkedMinutes(record);
  }
  const workDays = closed.length;
  return {
    month,
    workDays,
    totalWorkedMinutes: total,
    averageWorkedMinutes: workDays === 0 ? 0 : Math.floor(total / workDays)
  };
}
