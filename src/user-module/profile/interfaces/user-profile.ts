import { UserSex } from '../enums/user-sex';

export interface IUserProfile {
  user_id: string;
  timezone: string;
  onboarding_completed: boolean;
  research_consent: boolean;
  created_at: string;
  last_modified: string;

  full_name?: string;
  date_of_birth?: string;
  height_cm?: number;
  weight_kg?: number;
  terms_accepted_at?: string;
  email?: string;
  biological_sex?: UserSex | null;
  is_admin?: boolean;
  role?: string;
  units_preference?: string;
  desired_body_type?: string;
  years_of_exercise_experience?: string;
  equipment?: string[];
  warmup_sets_preference?: boolean;
  injury_flags?: any[];
  injury_notes?: string;
  joint_hypermobility?: boolean;
  exercise_blacklist?: any[];
  exercise_favorites?: any[];
  coaching_style?: number;
  updated_at?: Date;
  warmup_sets?: boolean;
  current_mesocycle_id?: string;
}
