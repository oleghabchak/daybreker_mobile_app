# Exercise Input Documentation

## Overview

This document outlines the exercise input system for tracking workout feedback and user metrics during exercise execution.

## Feedback Metrics

### Pump
- **Purpose**: Tracks muscle pump sensation during exercise
- **Options**: None, Light, Strong, Max
- **Implementation**: Stored as integer values in `workout_exercises.pump`
- **Default**: 'none'

### Effort
- **Purpose**: Measures perceived exertion during exercise
- **Options**: Easy, Medium, Hard, Brutal
- **Implementation**: Stored as integer values in `workout_exercises.effort`
- **Default**: 'easy'

### Joint Pain
- **Purpose**: Tracks joint discomfort during exercise execution
- **Options**: None, Light, Strong, Max
- **Implementation**: Stored as integer values in `workout_exercises.joint_pain`
- **Default**: 'none'

## Data Structure

### WorkoutExerciseData Interface
```typescript
interface WorkoutExerciseData {
  exercise_id: string;
  exercise: ExerciseLibraryData | null;
  workout_exercise_id: string;
  order_index: number;
  superset_group: string | null;
  soreness_from_last: number;
  pump: number | null;
  effort: number | null;
  joint_pain: number | null;
  recovery_gate: number | null;
  stimulus_score: number | null;
  workout_day: number;
  workout_week: number;
  sets: WorkoutSetData[];
  muscle_groups: { primary: string[]; secondary: string[] };
}
```

### Database Schema
```sql
CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts NOT NULL,
  exercise_id TEXT REFERENCES exercise_library NOT NULL,
  order_index INTEGER NOT NULL,
  superset_group TEXT,
  soreness_from_last INTEGER,
  pump INTEGER,
  effort INTEGER,
  joint_pain INTEGER,
  recovery_gate INTEGER,
  stimulus_score INTEGER,
  -- ... other fields
);
```

## Implementation Files

### Core Definitions
- **`src/enums/feedback_options.emun.ts`** - Feedback option definitions and types
- **`src/types/mesocycle_types.ts`** - TypeScript interfaces for workout data
- **`database/schema.sql`** - Database schema definitions

### UI Components
- **`src/screens/exercise/exerciseComponents/ExerciseCard.tsx`** - Exercise input interface
- **`src/components/bottomSheets/CreateMesocycleIntake.tsx`** - Joint pain intake form

### Data Services
- **`src/services/_mesocycleAPIService.ts`** - API service for workout data
- **`database/functions/get_mesocycles_with_sets.sql`** - Database functions for data retrieval

## Usage Patterns

### Exercise Execution
1. User performs exercise
2. System prompts for feedback on pump, effort, and joint pain
3. Data is stored in `workout_exercises` table
4. Used for training analysis and program adjustments

### Mesocycle Intake
1. User reports pre-existing joint pain during mesocycle setup
2. Stored in `joint_pain_now` field for program customization
3. Used to filter exercises and adjust training parameters

## Related Documentation
- [Database Schema](database-schema.md)
- [Data Dictionary](data-dictionary.md)
- [New Mesocycle Intake Form](new_mesocycle_intake_form)

---

## UX copy and tooltip reference

Use this section as the source of truth for wording in the UI (labels, help text, and tooltips). Keep copy short, plain, and action-oriented. Avoid jargon unless it helps users choose accurately.

### Writing guidelines
- **Be specific**: Define what to consider and what to ignore.
- **Keep it short**: Prefer 1 short sentence. Max 2 when needed.
- **Use second person**: Speak to the user (“you”).
- **Disambiguate terms**: Distinguish muscle sensations from joint pain.
- **Consistency**: Reuse the same words for the same concepts across screens.

---

### Pump
- **Field label**: Pump
- **Helper text (optional)**: 
- **Tooltip (copy/paste)**: “How much muscle pump did you feel? Rate the tight, swollen feeling in the target muscle right after the set. None (0) to Max (3)."

Scale definitions and option-level microcopy:

| Label | Value | Tooltip microcopy |
| --- | --- | --- |
| None | `none` | No tightness or swelling in the target muscle. |
| Light | `light` | Mild tightness; brief pump that fades quickly. |
| Strong | `strong` | Clear swelling/tightness; muscle feels full. |
| Max | `max` | Extreme pump; very tight; may limit range or control. |

Notes:
- Focus on the working muscle(s), not overall fatigue.
- This is about sensation, not performance or pain.

---

### Effort
- **Field label**: Effort
- **Helper text (optional)**: 
- **Tooltip (copy/paste)**: “How much effort did that exercise require? Rate the overall difficulty. Easy (0) to Brutal (3).”

Tie to Reps In Reserve (RIR) for clarity (if shown near RIR fields, keep wording consistent):

| Label | Value | Guidance |
| --- | --- | --- |
| Easy | `easy` | Comfortable; plenty left. Roughly ≥3 RIR. |
| Medium | `med` | Working but steady. Roughly 2–3 RIR. |
| Hard | `hard` | Challenging; focus required. Roughly 1–2 RIR. |
| Brutal | `brutal` | Near limit. Roughly 0–1 RIR. |

Notes:
- Effort is global difficulty for the set. RIR is a distinct field; values should make sense together.
- If unsure, pick what best matches your last 2–3 reps.

---

### Joint Pain
- **Field label**: Joint Pain
- **Helper text (optional)**: 
- **Tooltip (copy/paste)**: “Any joint pain during the set? Rate joint pain (not muscle burn). None (0) to Max (3).”

Scale definitions and option-level microcopy:

| Label | Value | Tooltip microcopy |
| --- | --- | --- |
| None | `none` | No joint pain. |
| Light | `mild` | Dull/achy; does not change your technique. |
| Strong | `sharp` | Sharp or stabbing; affects movement or control. |
| Max | `max` | Stop the exercise; unsafe to continue. |

Notes:
- This is specifically about joints (e.g., knee, shoulder), not muscle burn or pump.
- If you felt pain in a specific joint, log the location separately when prompted (e.g., intake form `joint_pain_now`).

---

### Soreness (pre-exercise)
- **Field label**: Soreness
- **Helper text (optional)**: 
- **Tooltip (copy/paste)**: “How sore are the target muscles from your last session? Rate soreness before starting this exercise. None (0) to Max (3).”

Scale definitions and option-level microcopy:

| Label | Value | Tooltip microcopy |
| --- | --- | --- |
| None | `0` | No lingering soreness. Feels fully recovered. |
| Light | `1` | Mild tightness/stiffness; warms up quickly. |
| Strong | `2` | Noticeable soreness; affects comfort or control. |
| Max | `3` | Severe soreness; consider modifying, reducing load, or delaying. |

Notes:
- Logged before the first working set of the exercise.
- Targets the trained muscles, not joint pain.
- Stored as integer in `workout_exercises.soreness_from_last`.

---

## Label and value alignment

UI shows the labels in this document. Under the hood, the app uses the following values from `FeedbackOptions`:

```typescript
// src/enums/feedback_options.emun.ts
FeedbackOptions.pump.options    // values: none | light | strong | max
FeedbackOptions.effort.options  // values: easy | med | hard | brutal
FeedbackOptions.jointPain.options // values: none | mild | sharp | max

// Soreness (pre-exercise) is stored as an integer, not in FeedbackOptions
// values: 0 | 1 | 2 | 3  (None | Light | Strong | Max)
// field: soreness_from_last
```

Recommendations:
- When adding new UI, always read labels from `FeedbackOptions` to avoid drift.
- Do not persist labels; persist the `value` field.
- Keep tooltip copy in sync with this file; if you change a label or meaning, update both here and in `FeedbackOptions`.

---

## Placement notes (for implementers)
- `ExerciseCard` uses `FeedbackOptions` to render pump/effort/joint pain menus. Use the “Tooltip (copy/paste)” lines above in any contextual help.
- For joint-related onboarding (e.g., `CreateMesocycleIntake`), keep wording consistent with the Joint Pain definitions here.
- If RIR is displayed nearby, ensure Effort guidance references the same mental model (RIR ranges) without duplicating the RIR field.
