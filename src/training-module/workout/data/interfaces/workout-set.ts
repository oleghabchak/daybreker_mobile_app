import { ExerciseStatus } from '../../../../enums/exercise.enum';

export interface IWorkoutSet {
  id: string;
  workout_exercise_id?: string;
  set_number: number;
  target_reps: number;
  actual_reps: number;
  weight_kg: number;
  target_rir_raw: number;
  achieved_rir_raw: number;
  target_rir_bucket: number;
  achieved_rir_bucket: number;
  tempo_seconds: number;
  rest_seconds: number;
  technique_rating: number;
  range_of_motion_full: boolean;
  e1rm: number;
  total_volume: number;
  is_effective_set: boolean;
  created_at: string;
  last_modified: string;
  status: ExerciseStatus;
  set_type?: 'warmup' | 'working' | 'calibration' | 'validation';
  calibration_data?: any;
  is_user_value: boolean;
}
