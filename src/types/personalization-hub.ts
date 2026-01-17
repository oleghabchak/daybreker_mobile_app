import { OptionItem } from '../components/ui/Dropdown';

export interface TrainingProfileConfiguration {
  id: string;
  user_id: string;
  desired_body_type: 'masculine' | 'feminine';
  years_of_exercise_experience:
    | '<6_months'
    | '6-12_months'
    | '1-3_years'
    | '3-5_years'
    | '5+_years';
  equipment_access: { value: string; label: string }[];
  warmup_sets_preference: boolean;
  coaching_style: number; // 0-10
  injury_flags: {
    tags: { value: string; label: string }[];
    notes: string;
  };
  exercise_blacklist: { value: string; label: string }[];
  exercise_favorites: { value: string; label: string }[];
  created_at: string;
  updated_at: string;
  last_modified: string;
}

export interface CreateTrainingConfigData {
  user_id: string;
  desired_body_type?: 'masculine' | 'feminine';
  years_of_exercise_experience?:
    | '<6_months'
    | '6-12_months'
    | '1-3_years'
    | '3-5_years'
    | '5+_years';
  equipment_access?: { value: string; label: string }[];
  warmup_sets_preference?: boolean;
  coaching_style?: number;
  injury_flags?: {
    tags: { value: string; label: string }[];
    notes: string;
  };
  exercise_blacklist?: { value: string; label: string }[];
  exercise_favorites?: { value: string; label: string }[];
}

export interface UpdateTrainingConfigData {
  desired_body_type?: 'masculine' | 'feminine';
  years_of_exercise_experience?:
    | '<6_months'
    | '6-12_months'
    | '1-3_years'
    | '3-5_years'
    | '5+_years';
  equipment_access?: { value: string; label: string }[];
  warmup_sets_preference?: boolean;
  coaching_style?: number;
  injury_flags?: {
    tags: { value: string; label: string }[];
    notes: string;
  };
  exercise_blacklist?: { value: string; label: string }[];
  exercise_favorites?: { value: string; label: string }[];
}

// Placeholder exercise options for UI-only selection (no DB calls yet)
export const placeholderExercises: OptionItem[] = [
  { value: 'bench_press', label: 'Bench Press' },
  { value: 'back_squat', label: 'Back Squat' },
  { value: 'deadlift', label: 'Deadlift' },
  { value: 'overhead_press', label: 'Overhead Press' },
  { value: 'lat_pulldown', label: 'Lat Pulldown' },
];
