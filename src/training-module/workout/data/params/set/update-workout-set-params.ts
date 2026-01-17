import { ExerciseStatus } from '../../../../../enums/exercise.enum';

export interface IUpdateWorkoutSetData {
  set_number?: number;
  target_reps?: number | null;
  actual_reps?: number | null;
  weight_kg?: number | null;
  target_rir_raw?: number | null;
  achieved_rir_raw?: number | null;
  tempo_seconds?: number | null;
  rest_seconds?: number | null;
  technique_rating?: number | null;
  range_of_motion_full?: boolean | null;
  status?: ExerciseStatus | null;
  set_type?: 'warmup' | 'working' | 'calibration' | 'validation';
  calibration_data?: any;
  is_user_value?: boolean;
}

export interface IUpdateWorkoutSetParams {
  id: string;
  data: IUpdateWorkoutSetData;
}
