import { MesocycleGoal } from '../enums/mesocycle-goal';
import { MesocycleStatus } from '../enums/mesocycle-status';

export interface IMesocycle {
  id: string;
  user_id: string;
  name: string;
  days_per_week: number;
  num_weeks: number;
  length_weeks: number;
  deload_week: number;
  minutes_per_session: number;
  split_type: string[];
  exercise_variation: number;
  joint_pain_now: string[];
  muscle_emphasis: string[];
  goal: MesocycleGoal;
  status: MesocycleStatus;
  start_date: string;
  weight_now: number;
  created_at?: string;
  last_modified?: string;
  workout_days?: string[];
}
