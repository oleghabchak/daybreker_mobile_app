import { IWorkout } from '../training-module/workout/data/interfaces/workout';

// Types for the mesocycle intake form
export interface MesocycleFormDataTypes {
  id?: string;
  name: string;
  days_per_week: number;
  length_weeks: number;
  minutes_per_session: number;
  split_type: string[];
  exercise_variation: number;
  joint_pain_now: string[];
  muscle_emphasis: string[];
  goal: string;
  status: string;
  start_date: string;
  weight_now: number;
}

// Comprehensive mesocycle data with all related information
export interface ComprehensiveMesocycleData {
  // Mesocycle basic info
  id: string;
  name: string;
  goal: string;
  status: string;
  start_date: string;
  num_weeks: number;
  days_per_week: number | null;
  muscle_emphasis: string[] | null;
  split_type: string | null;
  total_volume?: number | null;
  order_index?: number | null;
  workouts: IWorkout[];
  user_id?: string;
  minutes_per_session?: number;
}
