import express from 'express';
import { openDb } from './db.js';
import { createAttendanceRouter } from './routes/attendance.js';

const app = express();
app.use(express.json());

const db = openDb();
app.use('/api', createAttendanceRouter(db));

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`勤怠集計API起動: http://localhost:${port}`);
});
