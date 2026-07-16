import { openDb } from './db.js';
import { addAttendance } from './services/attendanceService.js';

const db = openDb();
db.exec('DELETE FROM attendance');

const records = [
  { date: '2026-07-01', clockIn: '09:00', clockOut: '18:00', note: '' },
  { date: '2026-07-02', clockIn: '09:15', clockOut: '17:45', note: '朝会遅刻' },
  { date: '2026-07-03', clockIn: '10:00', clockOut: '19:30', note: '' },
  { date: '2026-07-06', clockIn: '09:00', clockOut: '15:00', note: '半休' },
  { date: '2026-07-07', clockIn: '09:00', clockOut: '18:30', note: '' },
  { date: '2026-07-08', clockIn: '09:00', clockOut: null, note: '打刻忘れ' },
  { date: '2026-07-09', clockIn: '08:30', clockOut: '17:30', note: '' },
  { date: '2026-07-10', clockIn: '09:00', clockOut: '20:00', note: 'リリース対応' }
];

for (const r of records) {
  addAttendance(db, r);
}

console.log(`サンプルデータ ${records.length} 件を投入しました（data/kintai.db）`);
