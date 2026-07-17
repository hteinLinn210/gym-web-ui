import { NextResponse } from 'next/server';
// @ts-ignore
import { DatabaseSync } from 'node:sqlite';
import path from 'path';

// Resolve SQLite DB path relative to the workspace root
const dbPath = path.resolve(process.cwd(), '../data/gym_logs.db');

function getDb() {
  const db = new DatabaseSync(dbPath);
  // Ensure tables exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS workout_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      day_split TEXT,
      metrics TEXT
    );
    CREATE TABLE IF NOT EXISTS workout_templates (
      day_name TEXT PRIMARY KEY,
      split_name TEXT,
      exercises TEXT
    );
    CREATE TABLE IF NOT EXISTS workout_feedbacks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      log_id INTEGER,
      type TEXT,
      content TEXT,
      UNIQUE(log_id, type)
    );
  `);
  return db;
}

export async function GET() {
  if (process.env.VERCEL === '1') {
    return NextResponse.json([]);
  }
  try {
    const db = getDb();
    const query = db.prepare('SELECT * FROM workout_logs ORDER BY timestamp DESC LIMIT 20');
    const logs = query.all();
    db.close();
    return NextResponse.json(logs);
  } catch (error: any) {
    console.error('Local GET logs error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (process.env.VERCEL === '1') {
    return NextResponse.json({ success: true, localSync: false, message: 'SQLite skipped on Vercel' });
  }
  try {
    const body = await request.json();
    const { id, day_split, timestamp, metrics } = body;
    
    if (!day_split || !metrics) {
      return NextResponse.json({ error: 'Missing day_split or metrics' }, { status: 400 });
    }

    const db = getDb();
    const ts = timestamp || new Date().toISOString();
    const metricsStr = typeof metrics === 'string' ? metrics : JSON.stringify(metrics);
    
    let newId;
    if (id) {
      const stmt = db.prepare(
        'INSERT OR REPLACE INTO workout_logs (id, day_split, timestamp, metrics) VALUES (?, ?, ?, ?)'
      );
      stmt.run(id, day_split, ts, metricsStr);
      newId = id;
    } else {
      const stmt = db.prepare(
        'INSERT INTO workout_logs (day_split, timestamp, metrics) VALUES (?, ?, ?)'
      );
      const info = stmt.run(day_split, ts, metricsStr);
      newId = info.lastInsertRowid;
    }
    
    db.close();
    return NextResponse.json({ success: true, id: Number(newId) });
  } catch (error: any) {
    console.error('Local POST log error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
