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
  const kinesiologyMarkdown = `# Kinesiologist Analysis: Active Rest & Recovery (Day 4)
Overall Status: **Recovery Plan Completed**

### Executive Summary
- **Protocol Adherence:** You successfully completed 30 minutes of Light Cardio and 15 minutes of the Mobility Routine.
- **Purpose:** This low-intensity protocol keeps the nervous system active, flushes metabolic waste, and promotes blood flow without raising cortisol.

### Activity Tracker
| Session Type | Logged Duration | Status | Key Benefits |
| :--- | :--- | :--- | :--- |
| Light Cardio | 30 mins | **Completed** | Enhanced blood flow & active calorie burn |
| Mobility Routine | 15 mins | **Completed** | Hip flexor and ankle decompression |

> [!TIP]
> **Active Rest Advice:**
> - [ ] Keep tomorrow's heavy lifting split clean by doing another light mobility stretch tonight.
> - [ ] Focus on deep nasal breathing to keep the parasympathetic nervous system dominant.`;

  const nutritionMarkdown = `# Nutrition Specialist: Recovery Day Fuel Plan
Target Muscle Groups: **Systemic recovery / Joint decompression**

### Exertion Level: **Low**
Today is about recovery. Energy expenditure is lower than lifting days.

### Nutritional Guidelines
- **Protein Intake:** Maintain your full protein target (2g per kg of bodyweight) to prevent muscle breakdown.
- **Calorie Control:** Keep carbs moderate, focusing on healthy fats and micronutrient-rich vegetables.
- **Joint Support:** Supplement with omega-3 fish oils (2-3g) and keep water intake high (3.5L+).`;

  const hypeMarkdown = `# Hype-Man: REST DAY CHECK! 😴
**RECOVERY IS WHERE THE GAINS ARE MADE!**

You think champions only work when lifting? Absolutely not. Real savages know when to let their bodies rebuild. You executed the 30-min cardio and 15-min mobility loop perfectly.

### Key Win
Disciplined rest. Most people fail because they overtrain and burn out. You followed the plan.

### Motivation
"Work hard, rest harder." Tomorrow, we get back to the iron. Let's conquer the next session!`;

  const feedbacks = [
    { log_id: 5, type: 'kinesiology', content: kinesiologyMarkdown },
    { log_id: 5, type: 'nutrition', content: nutritionMarkdown },
    { log_id: 5, type: 'hype', content: hypeMarkdown }
  ];

  for (const fb of feedbacks) {
    const { error } = await supabase
      .from('workout_feedbacks')
      .upsert(fb, { onConflict: 'log_id,type' });

    if (error) {
      console.error(`Failed to seed ${fb.type} feedback for Day 4:`, error.message);
    } else {
      console.log(`Successfully seeded ${fb.type} feedback for Day 4!`);
    }
  }
}

run();
