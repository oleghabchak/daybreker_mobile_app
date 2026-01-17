import { IExercise } from '../../../exercise/data/interfaces/exercise';

import { IWorkoutSet } from './workout-set';

export interface IWorkoutExercise {
  id?: string | undefined; // May not be present depending on API response
  workout_exercise_id: string; // Primary key from database
  exercise: IExercise | null;
  exercise_id: string;
  order_index: number;
  superset_group: 'A' | 'B' | 'C' | null; // 'A', 'B', 'C' or null
  soreness_from_last: number;
  pump: number | null;
  effort: number | null;
  joint_pain: number | null;
  recovery_gate: number | null;
  stimulus_score: number | null;
  workout_day: number;
  workout_week: number;
  muscle_groups: { primary: string[]; secondary: string[] };
  sets: IWorkoutSet[];
  workout_id?: string;
}
