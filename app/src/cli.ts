import { openDb } from './db.js';
import { addAttendance, listAttendance } from './services/attendanceService.js';
import { buildMonthlySummary } from './services/summaryService.js';
import { formatMinutes } from './utils/time.js';

const [command, ...args] = process.argv.slice(2);
const db = openDb();

switch (command) {
  case 'add': {
    const [date, clockIn, clockOut, note] = args;
    if (!date || !clockIn) {
      console.error('usage: npm run cli -- add <date> <clockIn> [clockOut] [note]');
      process.exit(1);
    }
    const record = addAttendance(db, { date, clockIn, clockOut: clockOut ?? null, note });
    console.log(`登録しました: #${record.id} ${record.date} ${record.clockIn}〜${record.clockOut ?? '(未退勤)'}`);
    break;
  }
  case 'list': {
    const [month] = args;
    if (!month) {
      console.error('usage: npm run cli -- list <YYYY-MM>');
      process.exit(1);
    }
    for (const r of listAttendance(db, month)) {
      console.log(`#${r.id} ${r.date} ${r.clockIn}〜${r.clockOut ?? '(未退勤)'} ${r.note}`);
    }
    break;
  }
  case 'summary': {
    const [month] = args;
    if (!month) {
      console.error('usage: npm run cli -- summary <YYYY-MM>');
      process.exit(1);
    }
    const s = buildMonthlySummary(month, listAttendance(db, month));
    console.log(`${s.month} の勤務実績`);
    console.log(`  勤務日数: ${s.workDays}日`);
    console.log(`  実働合計: ${formatMinutes(s.totalWorkedMinutes)}`);
    console.log(`  1日平均: ${formatMinutes(s.averageWorkedMinutes)}`);
    break;
  }
  default:
    console.error('usage: npm run cli -- <add|list|summary> ...');
    process.exit(1);
}
