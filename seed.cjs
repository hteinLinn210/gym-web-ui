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
    split_name: "Day 1: Push (Machine & Aesthetic Focus)",
    exercises: [
      { name: "Machine Incline Chest Press", sets: 3, reps: "8-12", weight: "40kg" },
      { name: "Machine Flat Chest Press", sets: 3, reps: "8-12", weight: "45kg" },
      { name: "Pec Deck OR High-to-Low Cable Fly", sets: 3, reps: "10-15", weight: "25kg" },
      { name: "Machine Shoulder Press", sets: 3, reps: "8-12", weight: "30kg" },
      { name: "Single-Arm Cable Lateral Raise", sets: 4, reps: "12-15", weight: "10kg" },
      { name: "Overhead Cable Triceps Extension (Rope)", sets: 3, reps: "10-12", weight: "15kg" },
      { name: "Cable Triceps Pushdown", sets: 3, reps: "12-15", weight: "20kg" },
      { name: "Cardio: Stairmaster", sets: 1, reps: "1", weight: "0kg", duration: "20-30 mins" }
    ]
  },
  {
    day_name: "Day 2",
    split_name: "Day 2: Pull (Back Thickness & Arms)",
    exercises: [
      { name: "Lat Pulldown (Wide/Neutral Grip)", sets: 3, reps: "8-12", weight: "45kg" },
      { name: "Plate-Loaded Machine Row", sets: 3, reps: "8-12", weight: "40kg" },
      { name: "Reverse Grip Lat Pulldown", sets: 3, reps: "8-12", weight: "45kg" },
      { name: "Cable Reverse Fly", sets: 3, reps: "12-15", weight: "15kg" },
      { name: "Machine OR Cable Preacher Curl", sets: 3, reps: "10-12", weight: "20kg" },
      { name: "Incline Dumbbell Hammer Curl", sets: 3, reps: "12-15", weight: "12kg" },
      { name: "Cardio: Stairmaster", sets: 1, reps: "1", weight: "0kg", duration: "20 mins" }
    ]
  },
  {
    day_name: "Day 3",
    split_name: "Day 3: Legs (Quad Focus) & Abs",
    exercises: [
      { name: "Machine Hack Squat", sets: 3, reps: "8-12", weight: "50kg" },
      { name: "Leg Press (Standard Stance)", sets: 3, reps: "8-12", weight: "80kg" },
      { name: "Leg Extension", sets: 3, reps: "12-15", weight: "30kg" },
      { name: "Seated Calf Raise", sets: 4, reps: "12-15", weight: "20kg" },
      { name: "Hanging Leg Raise", sets: 3, reps: "15", weight: "0kg" }
    ]
  },
  {
    day_name: "Day 4",
    split_name: "Day 4: Active Rest & Recovery",
    exercises: [
      { name: "Light Cardio", sets: 1, reps: "1", weight: "0kg", duration: "30 mins" },
      { name: "Mobility Routine", sets: 1, reps: "1", weight: "0kg", duration: "15 mins" }
    ]
  },
  {
    day_name: "Day 5",
    split_name: "Day 5: Upper Body (Balanced Power)",
    exercises: [
      { name: "Flat Dumbbell Press", sets: 3, reps: "6-10", weight: "16kg" },
      { name: "Seated Cable Row", sets: 3, reps: "8-12", weight: "40kg" },
      { name: "Machine Shoulder Press", sets: 3, reps: "8-12", weight: "30kg" },
      { name: "Single-Arm Cable Pulldown", sets: 3, reps: "10-12", weight: "20kg" },
      { name: "Cable Lateral Raise", sets: 4, reps: "12-15", weight: "10kg" },
      { name: "EZ Bar Curl", sets: 3, reps: "8-12", weight: "15kg" },
      { name: "Overhead Dumbbell Triceps Extension", sets: 3, reps: "10-12", weight: "14kg" },
      { name: "Cardio: Stairmaster", sets: 1, reps: "1", weight: "0kg", duration: "20 mins" }
    ]
  },
  {
    day_name: "Day 6",
    split_name: "Day 6: Lower Body (Posterior Chain) & Core",
    exercises: [
      { name: "Machine Hip Thrust", sets: 3, reps: "8-12", weight: "60kg" },
      { name: "Reverse / Lying Leg Curl", sets: 3, reps: "10-12", weight: "30kg" },
      { name: "High-Stance Machine Leg Press", sets: 3, reps: "8-10", weight: "80kg" },
      { name: "Standing Machine Calf Raise", sets: 4, reps: "12-15", weight: "30kg" },
      { name: "Abdominal Crunch Machine", sets: 3, reps: "12-15", weight: "25kg" }
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
