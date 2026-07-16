import { Router } from 'express';
import type { Db } from '../db.js';
import { addAttendance, listAttendance } from '../services/attendanceService.js';
import { buildMonthlySummary } from '../services/summaryService.js';

export function createAttendanceRouter(db: Db): Router {
  const router = Router();

  router.get('/attendance', (req, res) => {
    const month = String(req.query.month ?? '');
    res.json(listAttendance(db, month));
  });

  router.post('/attendance', (req, res) => {
    const { date, clockIn, clockOut, note } = req.body;
    const record = addAttendance(db, { date, clockIn, clockOut, note });
    res.status(201).json(record);
  });

  router.get('/summary/:month', (req, res) => {
    const month = req.params.month;
    const records = listAttendance(db, month);
    res.json(buildMonthlySummary(month, records));
  });

  return router;
}
