export interface ICreateWorkoutSetParams {
  workout_exercise_id?: string;
  set_number: number;
  target_reps?: number | null;
  actual_reps?: number | null;
  weight_kg?: number | null;
  target_rir_raw?: number | null;
  achieved_rir_raw?: number | null;
  tempo_seconds?: number | null;
  rest_seconds?: number | null;
  technique_rating?: number | null;
  range_of_motion_full?: boolean | null;
  status: string;
  set_type?: string;
  calibration_data?: any;
  auto_generate_warmups?: boolean;
}
