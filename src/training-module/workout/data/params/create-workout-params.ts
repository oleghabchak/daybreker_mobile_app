export interface ICreateWorkoutParams {
  user_id: string;
  mesocycle_block_id: string;
  started_at?: string;
  completed_at?: string | null;
  abandoned_at?: string | null;
  abandon_reason?: string | null;
  pre_workout_fatigue?: number | null;
  location?: string | null;
  is_public?: boolean;
  notes?: string | null;
  workout_day: number;
  workout_week: number;

  created_at?: string;
  last_modified?: string;
}
