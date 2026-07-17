import { NextResponse } from 'next/server';
// @ts-ignore
import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const dbPath = path.resolve(process.cwd(), '../data/gym_logs.db');

function getDb() {
  return new DatabaseSync(dbPath);
}

export async function GET() {
  if (process.env.VERCEL === '1') {
    return NextResponse.json([]);
  }
  try {
    const db = getDb();
    const query = db.prepare('SELECT * FROM workout_templates');
    const templates = query.all();
    db.close();
    return NextResponse.json(templates);
  } catch (error: any) {
    console.error('Local GET templates error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (process.env.VERCEL === '1') {
    return NextResponse.json({ success: true, localSync: false, message: 'SQLite skipped on Vercel' });
  }
  try {
    const body = await request.json();
    const { day_name, split_name, exercises } = body;

    if (!day_name || !split_name || !exercises) {
      return NextResponse.json({ error: 'Missing day_name, split_name, or exercises' }, { status: 400 });
    }

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO workout_templates (day_name, split_name, exercises)
      VALUES (?, ?, ?)
      ON CONFLICT(day_name) DO UPDATE SET
        split_name = excluded.split_name,
        exercises = excluded.exercises
    `);
    stmt.run(
      day_name,
      split_name,
      typeof exercises === 'string' ? exercises : JSON.stringify(exercises)
    );
    db.close();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Local PUT template error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
