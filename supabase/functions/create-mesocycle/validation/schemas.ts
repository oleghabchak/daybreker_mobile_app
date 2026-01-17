// @ts-ignore Deno import
import { z } from "https://esm.sh/zod@3.22.4";

// UUID validation helper
const uuidSchema = (fieldName: string) => 
  z.string().uuid(`${fieldName} must be a valid UUID`);

// Complete mesocycle creation schema
export const CreateCompleteMesocycleSchema = z.object({
  // Mesocycle fields
  user_id: uuidSchema("user_id"),
  name: z.string().min(1, "name is required"),
  start_date: z.string().refine((val: string) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, { message: "start_date must be a valid date" }),
  num_weeks: z.number().int().min(4).max(8),
  goal: z.string().min(1, "goal is required"),
  status: z.string().optional(),
  workout_days: z.array(z.string()).optional(),
  days_per_week: z.number().int().min(1).max(7).optional(),
  muscle_emphasis: z.array(z.string()).optional(),
  length_weeks: z.number().int().optional(),
  minutes_per_session: z.number().positive().optional(),
  weight_now: z.number().nonnegative().optional(),
  joint_pain_now: z.array(z.string()).optional(),
  split_type: z.string().optional(),
  exercise_variation: z.number().int().optional(),
  
  // Optional nested data arrays
  workouts_data: z.array(z.object({
    user_id: uuidSchema("user_id").optional(),
    workout_day: z.number().int().positive(),
    workout_week: z.number().int().positive(),
    started_at: z.string().refine((val: string) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, { message: "started_at must be a valid date" }),
    is_public: z.boolean().optional(),
    created_at: z.string().optional(),
    last_modified: z.string().optional(),
  })).optional(),
  
  exercises_data: z.array(z.object({
    workout_id: uuidSchema("workout_id").optional(),
    exercise_id: uuidSchema("exercise_id"),
    order_index: z.number().int().nonnegative(),
    soreness_from_last: z.number().int().min(1).max(5).optional(),
    created_at: z.string().optional(),
    last_modified: z.string().optional(),
  })).optional(),
  
  sets_data: z.array(z.object({
    workout_exercise_id: uuidSchema("workout_exercise_id").optional(),
    set_number: z.number().int().positive(),
    target_reps: z.number().int().positive(),
    weight_kg: z.number().nonnegative(),
    target_rir_raw: z.number().int().nonnegative(),
    status: z.string().optional(),
    set_type: z.string().optional(),
    created_at: z.string().optional(),
    last_modified: z.string().optional(),
  })).optional(),
});

export type CreateCompleteMesocycleRequest = z.infer<typeof CreateCompleteMesocycleSchema>;

