const { createClient } = require('@supabase/supabase-js');
const { DatabaseSync } = require('node:sqlite');
const dotenv = require('dotenv');
const path = require('path');

// Resolve paths
const envPath = path.resolve(__dirname, '.env.local');
const dbPath = path.resolve(__dirname, '../data/gym_logs.db');

dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Supabase environment variables not found in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function sync() {
  console.log("=== Syncing Supabase Data to Local SQLite ===");
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Local SQLite: ${dbPath}\n`);

  try {
    const db = new DatabaseSync(dbPath);

    // 1. Ensure tables exist
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

    // Clear existing local data to ensure perfect sync
    db.exec('DELETE FROM workout_logs');
    db.exec('DELETE FROM workout_templates');
    db.exec('DELETE FROM workout_feedbacks');

    // 2. Fetch and Sync Templates
    console.log("Syncing workout templates...");
    const { data: templates, error: tErr } = await supabase.from('workout_templates').select('*');
    if (tErr) throw tErr;

    const tStmt = db.prepare('INSERT OR REPLACE INTO workout_templates (day_name, split_name, exercises) VALUES (?, ?, ?)');
    for (const t of templates) {
      tStmt.run(t.day_name, t.split_name, typeof t.exercises === 'string' ? t.exercises : JSON.stringify(t.exercises));
    }
    console.log(`Synced ${templates.length} templates.`);

    // 3. Fetch and Sync Logs
    console.log("Syncing workout logs...");
    const { data: logs, error: lErr } = await supabase.from('workout_logs').select('*');
    if (lErr) throw lErr;

    const lStmt = db.prepare('INSERT OR REPLACE INTO workout_logs (id, timestamp, day_split, metrics) VALUES (?, ?, ?, ?)');
    for (const l of logs) {
      lStmt.run(l.id, l.timestamp, l.day_split, typeof l.metrics === 'string' ? l.metrics : JSON.stringify(l.metrics));
    }
    console.log(`Synced ${logs.length} logs.`);

    // 4. Fetch and Sync Feedbacks
    console.log("Syncing workout feedbacks...");
    const { data: feedbacks, error: fErr } = await supabase.from('workout_feedbacks').select('*');
    if (fErr) throw fErr;

    const fStmt = db.prepare('INSERT OR REPLACE INTO workout_feedbacks (id, log_id, type, content) VALUES (?, ?, ?, ?)');
    for (const f of feedbacks) {
      fStmt.run(f.id, f.log_id, f.type, f.content);
    }
    console.log(`Synced ${feedbacks.length} feedbacks.`);

    db.close();
    console.log("\n✅ Local SQLite database successfully synchronized with Supabase!");
  } catch (err) {
    console.error("Sync failed:", err.message);
  }
}

sync();
