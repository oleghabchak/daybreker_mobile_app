import { MesocycleGoal } from '../enums/mesocycle-goal';
import { MesocycleStatus } from '../enums/mesocycle-status';

export interface ICreateMesocycleParams {
  id?: string;
  user_id: string;
  name: string;
  start_date: string;
  num_weeks: number;
  goal: MesocycleGoal;
  status?: MesocycleStatus;
  workout_days?: string[];
  deload_week?: number;
  created_at?: string;
  last_modified?: string;
  days_per_week?: number;
  muscle_emphasis?: string[];
  length_weeks?: number;
  minutes_per_session?: number;
  weight_now?: number;
  joint_pain_now?: string[];
  split_type?: string;
  exercise_variation?: number;
}
