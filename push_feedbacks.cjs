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

async function run() {
  // Find the latest logged workout (which is Day 2)
  const { data: log, error: logError } = await supabase
    .from('workout_logs')
    .select('id, day_split')
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  if (logError || !log) {
    console.error("Error finding latest log in database:", logError?.message || "No logs found");
    return;
  }

  console.log(`Found latest log: ID ${log.id} (${log.day_split})`);

  const kinesiologyMarkdown = `# Kinesiologist Analysis: Pull Day (Back & Arms)
Overall Status: **Progressive Overload Achieved**

### Executive Summary
- **Wins:** You achieved a top set of **55kg** on Lat Pulldowns. Rows remained stable at **35kg** for a solid 30-rep volume.
- **Arm Progression:** Preacher curls peaked at **30kg** for 8 reps, demonstrating exceptional mechanical output.

### Progression Table
| Exercise | Target Reps | Logged Set 1 | Logged Set 2 | Logged Set 3 | Overload Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Lat Pulldown | 8-12 reps | 12 @ 45kg | 10 @ 50kg | 8 @ 55kg | **Overload Met** (+5kg top set) |
| Machine Row | 8-12 reps | 10 @ 35kg | 10 @ 35kg | 10 @ 35kg | **Volume Stable** |
| Preacher Curl | 10-12 reps | 12 @ 20kg | 10 @ 25kg | 8 @ 30kg | **Overload Met** (+5kg peak) |

> [!TIP]
> **Double Progression Directives:**
> - [ ] **Lat Pulldowns:** Increase top set to **57.5kg** for 6-8 reps next session.
> - [ ] **Machine Rows:** Try for 11 reps on the first set at **35kg** before moving to 40kg.
> - [ ] **Preacher Curls:** Keep weight at **30kg** but target 9 reps on set 3.`;

  const nutritionMarkdown = `# Nutrition Specialist: Pull Day Fuel Plan
Target Muscle Groups: **Lats, Rhomboids, Rear Delts, Biceps**

### Exertion Level: **High**
Pull days draw heavily on glycogen reserves in your upper body. We must prioritize insulin sensitivity and protein synthesis.

### Post-Workout Action Checklist
- **Anabolic Window:** Consume a fast-digesting protein source within 45 minutes of training.
- **Glycogen Replenishment:** Pair with low-glycemic carbohydrates to restock liver and muscle glycogen.

### Recommended Post-Workout Meals
- **Option 1 (Clean Solid):** 200g Grilled Chicken Breast, 150g Jasmine Rice, 80g Avocado (healthy fats for joint recovery).
- **Option 2 (Fast Shake):** 2 scoops Whey Isolate, 1 large Banana, 40g Cream of Rice.`;

  const hypeMarkdown = `# Hype-Man: energy check! ⚡
**YOU ABSOLUTELY CRUSHED THOSE PULLDOWNS!**

55kg on the final set? That is absolute savage work. Your lats are going to grow wider than a doorway if you keep pulling like this!

### Key Win
You didn't back down when it got heavy. Going from 45kg to 55kg and keeping it at 8 reps is pure grit. 

### Motivation
"If you want to build a back like a barn door, you have to row and pulldown like you mean it." Next week, we go for **57.5kg**. Zero excuses. Let's get it!`;

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
      console.error(`Failed to seed ${fb.type} feedback:`, error.message);
    } else {
      console.log(`Successfully seeded ${fb.type} feedback!`);
    }
  }
  console.log("Feedback seeding completed successfully.");
}

run();
