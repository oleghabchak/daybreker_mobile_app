export enum MesocycleGoal {
  STRENGTH = 'strength',
  HYPERTROPHY = 'hypertrophy',
  ENDURANCE = 'endurance',
  POWER = 'power',
  GENERAL_FITNESS = 'general_fitness',
  WEIGHT_LOSS = 'weight_loss',
  MUSCLE_GAIN = 'muscle_gain',
  SPORT_SPECIFIC = 'sport_specific',
}

export interface IMesocycleTemplate {
  id: string;
  name: string;
  goal: MesocycleGoal;
  num_weeks: number;
  deload_week?: number;
  description: string;
  created_by_user_id: string;
  is_public: boolean;
  created_at: string;
  last_modified: string;
  mesocycle_block_id: string;
}

export interface ICreateMesocycleTemplateInput {
  name: string;
  goal: MesocycleGoal;
  num_weeks: number;
  deload_week?: number;
  description: string;
  is_public?: boolean;
  mesocycle_block_id: string;
}

export interface UpdateMesocycleTemplateInput {
  id: string;
  name?: string;
  goal?: MesocycleGoal;
  num_weeks?: number;
  deload_week?: number;
  description?: string;
  is_public?: boolean;
  mesocycle_block_id?: string;
}

export interface MesocycleTemplateFilters {
  goal?: MesocycleGoal;
  is_public?: boolean;
  created_by_user_id?: string;
  min_weeks?: number;
  max_weeks?: number;
  search?: string;
}

export interface IMesocycleTemplateExercise {
  id: string;
  mesocycle_block_id: string;
  exercise_id: string;
  created_at: string;
  last_modified: string;
  exercise_muscle_group: string;
  day_of_week: number;
}

// New interfaces for the SQL function responses
export interface IMesocycleTemplateWithExercises {
  template_id: string;
  template_name: string;
  start_date: string;
  num_weeks: number;
  goal: string;
  status: string;
  deload_week?: number;
  created_at: string;
  last_modified: string;
  days_per_week?: number;
  muscle_emphasis?: string[];
  length_weeks?: number;
  minutes_per_session?: number;
  weight_now?: number;
  joint_pain_now?: string[];
  split_type?: string;
  exercise_variation?: number;
  exercise_library: IExerciseLibraryItem[];
}

export interface IMesocycleTemplatesAndExercises {
  mesocycle_templates: IMesocycleTemplateOnly[];
  exercise_library: IExerciseLibraryItem[];
  total_templates: number;
  total_exercises: number;
}

export interface IMesocycleTemplateOnly {
  id: string;
  name: string;
  start_date: string;
  num_weeks: number;
  goal: string;
  status: string;
  deload_week?: number;
  created_at: string;
  last_modified: string;
  days_per_week?: number;
  muscle_emphasis?: string[];
  length_weeks?: number;
  minutes_per_session?: number;
  weight_now?: number;
  joint_pain_now?: string[];
  split_type?: string;
  exercise_variation?: number;
}

export interface IExerciseLibraryItem {
  exercise_uid: string;
  exercise_canonical_id: string;
  exercise_display_name_en: string;
  exercise_name_aliases?: string[];
  exercise_status: string;
  exercise_keywords?: string[];
  exercise_tags?: string;
  exercise_primary_movement_pattern?: string;
  exercise_mechanics_type?: string;
  exercise_kinematic_context?: string;
  exercise_muscle_groups_simple?: any;
  created_at: string;
  updated_at: string;
}

export interface IExerciseLibrarySimple {
  exercise_uid: string;
  exercise_display_name_en: string;
  exercise_muscle_groups_simple?: any;
}
