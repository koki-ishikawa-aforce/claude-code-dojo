import { describe, expect, it } from 'vitest';
import type { AttendanceRecord } from '../src/models/attendance.js';
import { buildMonthlySummary, calcWorkedMinutes } from '../src/services/summaryService.js';

function record(partial: Partial<AttendanceRecord> & Pick<AttendanceRecord, 'date'>): AttendanceRecord {
  return {
    id: 1,
    clockIn: '09:00',
    clockOut: '18:00',
    note: '',
    ...partial
  };
}

describe('calcWorkedMinutes', () => {
  it('拘束時間から休憩を控除した実働時間を返す', () => {
    // 9:00-18:00 = 拘束540分、休憩60分 → 実働480分
    expect(calcWorkedMinutes(record({ date: '2026-07-01' }))).toBe(480);
  });
});

describe('buildMonthlySummary', () => {
  it('実働時間を合計する', () => {
    const records = [
      // 拘束540分 - 休憩60分 = 480分
      record({ id: 1, date: '2026-07-01', clockIn: '09:00', clockOut: '18:00' }),
      // 拘束480分 - 休憩45分 = 435分
      record({ id: 2, date: '2026-07-02', clockIn: '09:00', clockOut: '17:00' })
    ];
    const summary = buildMonthlySummary('2026-07', records);
    expect(summary.workDays).toBe(2);
    expect(summary.totalWorkedMinutes).toBe(915);
    expect(summary.averageWorkedMinutes).toBe(457);
  });

  it('対象月以外のレコードは集計しない', () => {
    const records = [record({ id: 1, date: '2026-06-30' })];
    const summary = buildMonthlySummary('2026-07', records);
    expect(summary.workDays).toBe(0);
    expect(summary.totalWorkedMinutes).toBe(0);
  });

  it('レコードが空なら平均は0', () => {
    const summary = buildMonthlySummary('2026-07', []);
    expect(summary.averageWorkedMinutes).toBe(0);
  });
});
