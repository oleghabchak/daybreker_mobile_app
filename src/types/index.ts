export * from './personalization-hub';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  date_of_birth: string;
  biological_sex: 'male' | 'female' | 'other';
  onboarding_completed: boolean;
  timezone: string;
  last_active: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  version: number;
  last_synced: string;
  device_id?: string;
  is_admin?: boolean;
}

export interface HealthScore {
  id: string;
  user_id: string;
  overall_score: number;
  metabolic_score: number;
  inflammation_score: number;
  recovery_score: number;
  calculated_at: string;
  data_points_used: number;
  confidence_level: number;
  valid_from: string;
  valid_to: string;
  version: number;
  last_synced: string;
  created_at: string;
}

export interface UserMetric {
  id: string;
  user_id: string;
  metric_type: string;
  value_numeric?: number;
  value_text?: string;
  unit?: string;
  effective_date: string;
  source: string;
  device_id?: string;
  notes?: string;
  valid_from: string;
  valid_to: string;
  version: number;
  last_synced: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
}

export interface UserPriorities {
  id: string;
  user_id: string;
  priorities: string[];
  completed_at: string;
  version: number;
  last_synced: string;
  device_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalCondition {
  icd10_code: string;
  name: string;
  category: string;
  description?: string;
  severity_levels: string[];
  created_at: string;
}

export interface UserCondition {
  id: string;
  user_id: string;
  icd10_code: string;
  severity?: 'mild' | 'moderate' | 'severe';
  diagnosed_date?: string;
  notes?: string;
  is_active: boolean;
  effective_from: string;
  effective_to?: string;
  version: number;
  last_synced: string;
  device_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Medication {
  rxnorm_code: string;
  name: string;
  generic_name?: string;
  brand_names: string[];
  dosage_forms: string[];
  strength_units: string[];
  category?: string;
  created_at: string;
}

export interface UserMedication {
  id: string;
  user_id: string;
  rxnorm_code: string;
  dosage_amount: number;
  dosage_unit: string;
  frequency: string;
  route?: string;
  prescribed_date?: string;
  start_date: string;
  end_date?: string;
  prescriber_name?: string;
  notes?: string;
  is_active: boolean;
  version: number;
  last_synced: string;
  device_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicationDose {
  id: string;
  user_medication_id: string;
  user_id: string;
  taken_at: string;
  amount_taken: number;
  unit: string;
  notes?: string;
  adherence_score?: number;
  version: number;
  last_synced: string;
  device_id?: string;
  created_at: string;
}

export interface OnboardingProgress {
  id: string;
  user_id: string;
  screen_name: string;
  completed: boolean;
  completed_at?: string;
  data_collected?: any;
  time_spent_seconds?: number;
  version: number;
  last_synced: string;
  device_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ScreenAnalytics {
  id: string;
  user_id?: string;
  screen_name: string;
  session_id: string;
  entered_at: string;
  exited_at?: string;
  time_spent_seconds?: number;
  interactions: number;
  device_info?: any;
  created_at: string;
}

export type RootStackParamList = {
  Welcome: undefined;
  Auth: undefined;
  Permissions: undefined;
  BasicInfo: undefined;
  HealthGoals: undefined;
  MedicalHistory: undefined;
  Medications: undefined;
  Lifestyle: undefined;
  SleepHabits: undefined;
  StressManagement: undefined;
  DigitalTwin: undefined;
  Consent: undefined;
  Completion: undefined;
  Priorities: undefined;
  Home: undefined;
  Profile: undefined;
  Tasks: undefined;
  DietSupplements: undefined;
  HeathProtocols: undefined;
  Exercise: undefined;
  MesocycleTemplates: undefined;
  MesocycleFromScratch: undefined;
  MesocycleFromTemplateScreen: undefined;
  MesocyclesListScreen: undefined;
  MesocycleCopyScreen: undefined;
  App: undefined;
  UnifiedPermissionsScreen: undefined;
  Settings: undefined;
  UserProfile: undefined;
  AdminScreen: undefined;
  HealthKitScreen: undefined;
};

export interface SyncConflict {
  id: string;
  user_id: string;
  table_name: string;
  record_id: string;
  device_version: number;
  server_version: number;
  device_data: any;
  server_data: any;
  resolution_strategy?: 'device_wins' | 'server_wins' | 'manual' | 'merge';
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
}

export interface OfflineAction {
  id: string;
  user_id: string;
  table_name: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: string;
  synced: boolean;
}

export interface DeviceConnection {
  id: string;
  user_id: string;
  provider: string;
  provider_user_id?: string;
  terra_user_id?: string;
  access_token?: string;
  refresh_token?: string;
  connected_at: string;
  last_sync?: string;
  sync_status: 'active' | 'error' | 'disconnected' | 'connecting';
  sync_error?: string;
  is_active: boolean;
  device_info?: any;
  terra_webhook_url?: string;
  terra_reference_id?: string;
  version: number;
  last_synced: string;
  device_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TerraWebhookData {
  type: string;
  user: {
    user_id: string;
    provider: string;
  };
  data?: any;
  timestamp: string;
}

// Legacy interfaces for backward compatibility
export interface User extends UserProfile {}
export interface HealthMetrics extends HealthScore {}
