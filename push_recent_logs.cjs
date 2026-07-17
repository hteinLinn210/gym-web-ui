const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const logs = [
  {
    day_split: "Day 1",
    metrics: JSON.stringify({
      exercises: [
        {
          name: "Machine Incline Chest Press",
          sets: [
            { set: 1, reps: 12, weight: "25kg" },
            { set: 2, reps: 10, weight: "30kg" },
            { set: 3, reps: 8, weight: "35kg" }
          ]
        },
        {
          name: "Machine Flat Chest Press",
          sets: [
            { set: 1, reps: 10, weight: "40kg" },
            { set: 2, reps: 10, weight: "40kg" },
            { set: 3, reps: 10, weight: "40kg" }
          ]
        },
        {
          name: "Pec Deck OR High-to-Low Cable Fly",
          sets: [
            { set: 1, reps: 12, weight: "15kg" },
            { set: 2, reps: 12, weight: "15kg" },
            { set: 3, reps: 12, weight: "15kg" }
          ]
        },
        {
          name: "Cardio: Stairmaster",
          duration: "15 mins",
          status: "completed"
        }
      ]
    })
  },
  {
    day_split: "Day 2",
    metrics: JSON.stringify({
      exercises: [
        {
          name: "Lat Pulldown (Wide/Neutral Grip)",
          sets: [
            { set: 1, reps: 12, weight: "45kg" },
            { set: 2, reps: 10, weight: "50kg" },
            { set: 3, reps: 8, weight: "55kg" }
          ]
        },
        {
          name: "Plate-Loaded Machine Row",
          sets: [
            { set: 1, reps: 10, weight: "35kg" },
            { set: 2, reps: 10, weight: "35kg" },
            { set: 3, reps: 10, weight: "35kg" }
          ]
        },
        {
          name: "Reverse Grip Lat Pulldown",
          sets: [
            { set: 1, reps: 12, weight: "40kg" },
            { set: 2, reps: 10, weight: "45kg" },
            { set: 3, reps: 10, weight: "45kg" }
          ]
        },
        {
          name: "Cable Reverse Fly",
          sets: [
            { set: 1, reps: 15, weight: "7.5kg" },
            { set: 2, reps: 12, weight: "10kg" },
            { set: 3, reps: 12, weight: "10kg" }
          ]
        },
        {
          name: "Machine OR Cable Preacher Curl",
          sets: [
            { set: 1, reps: 12, weight: "20kg" },
            { set: 2, reps: 10, weight: "25kg" },
            { set: 3, reps: 8, weight: "30kg" }
          ]
        },
        {
          name: "Incline Dumbbell Hammer Curl",
          sets: [
            { set: 1, reps: 12, weight: "10kg" },
            { set: 2, reps: 12, weight: "10kg" },
            { set: 3, reps: 12, weight: "10kg" }
          ]
        },
        {
          name: "Cardio: Stairmaster",
          duration: "20 mins",
          status: "completed"
        }
      ]
    })
  }
];

async function push() {
  console.log("Pushing recent logs to Supabase...");
  for (const l of logs) {
    const { error } = await supabase
      .from('workout_logs')
      .insert([l]);

    if (error) {
      console.error(`Failed to push log for ${l.day_split}:`, error.message);
    } else {
      console.log(`Successfully pushed log for ${l.day_split}`);
    }
  }
  console.log("Finished pushing logs!");
}

push();
