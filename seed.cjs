const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env from .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const templates = [
  {
    day_name: "Day 1",
    split_name: "Day 1: Push (High-Efficiency Aesthetic Focus)",
    exercises: [
      { name: "Machine Incline Chest Press", sets: 3, reps: "8-10", weight: "0kg" },
      { name: "Machine Flat Chest Press", sets: 3, reps: "8-10", weight: "0kg" },
      { name: "Pec Deck", sets: 3, reps: "12-15", weight: "0kg" },
      { name: "Machine Shoulder Press", sets: 3, reps: "8-10", weight: "0kg" },
      { name: "Standing Lateral Raise Machine", sets: 3, reps: "12-15", weight: "0kg" },
      { name: "Overhead Cable Triceps Extension (Rope)", sets: 3, reps: "10-12", weight: "0kg" },
      { name: "Cardio: Stairmaster", sets: 1, reps: "1", weight: "0kg", duration: "15 mins" }
    ]
  },
  {
    day_name: "Day 2",
    split_name: "Day 2: Pull (High-Efficiency V-Taper Focus)",
    exercises: [
      { name: "Seated Cable Row", sets: 3, reps: "8-10", weight: "0kg" },
      { name: "Lat Pulldown (Wide or Neutral Grip)", sets: 3, reps: "8-10", weight: "0kg" },
      { name: "Front Pulldown Machine (Reverse Grip)", sets: 3, reps: "10-12", weight: "0kg" },
      { name: "Rear Delt Fly (Pec Deck Machine reversed)", sets: 3, reps: "12-15", weight: "0kg" },
      { name: "Longhead Bicep Machine", sets: 3, reps: "10-12", weight: "0kg" },
      { name: "EZ-Bar Preacher Curl", sets: 3, reps: "10-12", weight: "0kg" },
      { name: "Cardio: Stairmaster", sets: 1, reps: "1", weight: "0kg", duration: "15 mins" }
    ]
  },
  {
    day_name: "Day 3",
    split_name: "Day 3: Legs (Quad Focus) & Abs",
    exercises: [
      { name: "Machine Hack Squat", sets: 3, reps: "8-10", weight: "0kg" },
      { name: "Leg Press (Standard Stance)", sets: 3, reps: "8-10", weight: "0kg" },
      { name: "Leg Extension", sets: 3, reps: "12-15", weight: "0kg" },
      { name: "Standing Calf Raise", sets: 3, reps: "12-15", weight: "0kg" },
      { name: "Crunch Machine", sets: 3, reps: "12-15", weight: "0kg" },
      { name: "Cardio: Stairmaster", sets: 1, reps: "1", weight: "0kg", duration: "15 mins" }
    ]
  },
  {
    day_name: "Day 4",
    split_name: "Day 4: Rest & Active Recovery",
    exercises: [
      { name: "Low-Intensity Steady-State (LISS) Walk", sets: 1, reps: "1", weight: "0kg", duration: "30-45 mins" },
      { name: "Lower-Body Mobility Routine", sets: 1, reps: "1", weight: "0kg", duration: "15 mins" }
    ]
  },
  {
    day_name: "Day 5",
    split_name: "Day 5: Upper Body (Balanced Power)",
    exercises: [
      { name: "Machine Flat Chest Press", sets: 3, reps: "8-10", weight: "0kg" },
      { name: "Seated Cable Row", sets: 3, reps: "8-10", weight: "0kg" },
      { name: "Machine Shoulder Press", sets: 3, reps: "8-10", weight: "0kg" },
      { name: "Lat Pulldown (Wide Overhand Grip)", sets: 3, reps: "8-10", weight: "0kg" },
      { name: "Cable Lateral Raise", sets: 3, reps: "12-15", weight: "0kg" },
      { name: "EZ-Bar Bicep Curl", sets: 3, reps: "10-12", weight: "0kg" },
      { name: "Overhead Dumbbell Triceps Extension", sets: 3, reps: "10-12", weight: "0kg" },
      { name: "Cardio: Stairmaster", sets: 1, reps: "1", weight: "0kg", duration: "15 mins" }
    ]
  },
  {
    day_name: "Day 6",
    split_name: "Day 6: Lower Body (Posterior Chain) & Core",
    exercises: [
      { name: "Machine Hip Thrust", sets: 3, reps: "8-10", weight: "0kg" },
      { name: "Reverse / Lying Leg Curl", sets: 3, reps: "10-12", weight: "0kg" },
      { name: "High-Stance Machine Leg Press", sets: 3, reps: "8-10", weight: "0kg" },
      { name: "Standing Machine Calf Raise", sets: 3, reps: "12-15", weight: "0kg" },
      { name: "Abdominal Crunch Machine", sets: 3, reps: "12-15", weight: "0kg" },
      { name: "Cardio: Stairmaster", sets: 1, reps: "1", weight: "0kg", duration: "15 mins" }
    ]
  }
];

async function seed() {
  console.log("Seeding workout splits/templates to Supabase...");
  for (const t of templates) {
    const { error } = await supabase
      .from('workout_templates')
      .upsert(t, { onConflict: 'day_name' });

    if (error) {
      console.error(`Failed to seed ${t.day_name}:`, error.message);
    } else {
      console.log(`Successfully seeded ${t.day_name}: ${t.split_name}`);
    }
  }
  console.log("Seeding finished!");
}

seed();
