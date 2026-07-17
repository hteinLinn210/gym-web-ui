const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Find the latest logged workout
  const { data: log, error: logError } = await supabase
    .from('workout_logs')
    .select('id, day_split')
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  if (logError || !log) {
    console.error("Error finding latest log in database:", logError?.message || "No logs found");
    process.exit(1);
  }

  console.log(`Found latest log: ID ${log.id} (${log.day_split})`);

  // Read feedback files
  const artifactsDir = path.resolve(__dirname, '../artifacts');
  const kinesiologyMarkdown = fs.readFileSync(path.join(artifactsDir, 'kinesiology.md'), 'utf-8');
  const nutritionMarkdown = fs.readFileSync(path.join(artifactsDir, 'nutrition.md'), 'utf-8');
  const hypeMarkdown = fs.readFileSync(path.join(artifactsDir, 'hype.md'), 'utf-8');

  const feedbacks = [
    { log_id: log.id, type: 'kinesiology', content: kinesiologyMarkdown },
    { log_id: log.id, type: 'nutrition', content: nutritionMarkdown },
    { log_id: log.id, type: 'hype', content: hypeMarkdown }
  ];

  for (const fb of feedbacks) {
    const { error } = await supabase
      .from('workout_feedbacks')
      .upsert(fb, { onConflict: 'log_id,type' });

    if (error) {
      console.error(`Failed to seed ${fb.type} feedback for Log ID ${log.id}:`, error.message);
    } else {
      console.log(`Successfully seeded ${fb.type} feedback for Log ID ${log.id}!`);
    }
  }
}

run();
