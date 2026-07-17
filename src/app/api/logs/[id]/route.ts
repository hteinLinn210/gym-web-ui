import { NextResponse } from 'next/server';
// @ts-ignore
import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const dbPath = path.resolve(process.cwd(), '../data/gym_logs.db');

function getDb() {
  return new DatabaseSync(dbPath);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (process.env.VERCEL === '1') {
    return NextResponse.json({ success: true, localSync: false, message: 'SQLite skipped on Vercel' });
  }
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const db = getDb();
    // Delete feedbacks associated with this log
    const feedbackStmt = db.prepare('DELETE FROM workout_feedbacks WHERE log_id = ?');
    feedbackStmt.run(id);

    // Delete the log itself
    const logStmt = db.prepare('DELETE FROM workout_logs WHERE id = ?');
    const info = logStmt.run(id);
    db.close();

    return NextResponse.json({ success: true, changes: info.changes });
  } catch (error: any) {
    console.error('Local DELETE log error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (process.env.VERCEL === '1') {
    return NextResponse.json({ success: true, localSync: false, message: 'SQLite skipped on Vercel' });
  }
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const { day_split, timestamp, metrics } = body;

    if (!day_split || !metrics) {
      return NextResponse.json({ error: 'Missing day_split or metrics' }, { status: 400 });
    }

    const db = getDb();
    const stmt = db.prepare(
      'UPDATE workout_logs SET day_split = ?, timestamp = ?, metrics = ? WHERE id = ?'
    );
    const info = stmt.run(
      day_split,
      timestamp,
      typeof metrics === 'string' ? metrics : JSON.stringify(metrics),
      id
    );
    db.close();

    return NextResponse.json({ success: true, changes: info.changes });
  } catch (error: any) {
    console.error('Local PUT log error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
