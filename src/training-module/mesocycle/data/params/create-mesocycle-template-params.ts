import { MesocycleGoal } from '../enums/mesocycle-goal';
import { MesocycleStatus } from '../enums/mesocycle-status';

export interface ICreateMesocycleTemplateParams {
  user_id?: string; // Optional - null for app templates
  name: string;
  start_date: string;
  num_weeks: number;
  goal: MesocycleGoal;
  status?: MesocycleStatus;
  days_per_week?: number;
  muscle_emphasis?: string[];
  length_weeks?: number;
  minutes_per_session?: number;
  weight_now?: number;
  joint_pain_now?: string[];
  split_type?: string;
  exercise_variation?: number;
  is_app_template?: boolean; // True for app templates, false for user templates
}

