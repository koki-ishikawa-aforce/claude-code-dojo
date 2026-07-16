import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export type Db = Database.Database;

/**
 * SQLite データベースを開き、テーブルを初期化して返す。
 * @param file DBファイルパス。':memory:' でインメモリDB（テスト用）
 */
export function openDb(file: string = 'data/kintai.db'): Db {
  if (file !== ':memory:') {
    mkdirSync(dirname(file), { recursive: true });
  }
  const db = new Database(file);
  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      clock_in TEXT NOT NULL,
      clock_out TEXT,
      note TEXT NOT NULL DEFAULT ''
    )
  `);
  return db;
}
