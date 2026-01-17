import { IWorkoutExercise } from './workout-exercise';

export interface IWorkout {
  id: string;
  user_id: string;
  mesocycle_block_id: string;
  started_at: string;
  completed_at: string;
  abandoned_at: string;
  abandon_reason: string;
  pre_workout_fatigue: string;
  location: string;
  is_public: boolean;
  notes: string;
  created_at: string;
  last_modified: string;
  workout_day: number;
  workout_week: number;
  exercises: IWorkoutExercise[];
}
