-- HIPAA-Compliant Database Schema for Daybreaker Health Platform
-- Supports 7-year retention, offline sync, temporal data, and audit trails

-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Data retention management
CREATE TABLE data_retention_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  request_type TEXT CHECK (request_type IN ('deletion', 'retention_extension')) NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'completed')) DEFAULT 'pending',
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced user profiles with HIPAA compliance
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  biological_sex TEXT CHECK (biological_sex IN ('male', 'female', 'other')) NOT NULL,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  timezone TEXT DEFAULT 'UTC',
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deletion_request_id UUID REFERENCES data_retention_requests,
  
  -- Offline sync support
  version INTEGER DEFAULT 1,
  last_synced TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  
  -- HIPAA audit trail
  created_by UUID REFERENCES auth.users DEFAULT auth.uid(),
  updated_by UUID REFERENCES auth.users
);

-- Medical condition reference data (using ICD-10 codes)
CREATE TABLE medical_conditions_ref (
  icd10_code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  severity_levels TEXT[], -- ['mild', 'moderate', 'severe']
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medication reference data (using RxNorm codes)
CREATE TABLE medications_ref (
  rxnorm_code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  generic_name TEXT,
  brand_names TEXT[],
  dosage_forms TEXT[], -- ['tablet', 'capsule', 'injection']
  strength_units TEXT[], -- ['mg', 'mcg', 'ml']
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User's medical conditions
CREATE TABLE user_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles NOT NULL,
  icd10_code TEXT REFERENCES medical_conditions_ref NOT NULL,
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
  diagnosed_date DATE,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  effective_from TIMESTAMPTZ DEFAULT NOW(),
  effective_to TIMESTAMPTZ,
  
  -- Offline sync
  version INTEGER DEFAULT 1,
  last_synced TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  
  -- Audit trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users DEFAULT auth.uid(),
  updated_by UUID REFERENCES auth.users
);

-- User's medications with individual dose tracking
CREATE TABLE user_medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles NOT NULL,
  rxnorm_code TEXT REFERENCES medications_ref NOT NULL,
  dosage_amount DECIMAL(10,3) NOT NULL,
  dosage_unit TEXT NOT NULL, -- 'mg', 'mcg', 'ml'
  frequency TEXT NOT NULL, -- 'once_daily', 'twice_daily', 'as_needed'
  route TEXT, -- 'oral', 'injection', 'topical'
  prescribed_date DATE,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  
  -- Offline sync
  version INTEGER DEFAULT 1,
  last_synced TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  
  -- Audit trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users DEFAULT auth.uid(),
  updated_by UUID REFERENCES auth.users
);

-- Individual medication doses
CREATE TABLE medication_doses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_medication_id UUID REFERENCES user_medications NOT NULL,
  user_id UUID REFERENCES user_profiles NOT NULL,
  taken_at TIMESTAMPTZ NOT NULL,
  dosage_amount DECIMAL(10,3) NOT NULL,
  dosage_unit TEXT NOT NULL,
  adherence_score INTEGER CHECK (adherence_score >= 0 AND adherence_score <= 100),
  notes TEXT,
  
  -- Offline sync
  version INTEGER DEFAULT 1,
  last_synced TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  
  -- Audit trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users DEFAULT auth.uid(),
  updated_by UUID REFERENCES auth.users
);

-- Health metrics tracking
CREATE TABLE user_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles NOT NULL,
  metric_type TEXT NOT NULL, -- 'weight', 'blood_pressure', 'heart_rate', etc.
  value DECIMAL(10,3) NOT NULL,
  unit TEXT NOT NULL, -- 'kg', 'mmHg', 'bpm', etc.
  measured_at TIMESTAMPTZ NOT NULL,
  source TEXT, -- 'manual', 'device', 'integration'
  device_id TEXT,
  notes TEXT,
  
  -- Offline sync
  version INTEGER DEFAULT 1,
  last_synced TIMESTAMPTZ DEFAULT NOW(),
  
  -- Audit trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users DEFAULT auth.uid(),
  updated_by UUID REFERENCES auth.users
);

-- User health priorities
CREATE TABLE user_priorities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles NOT NULL,
  priority_type TEXT NOT NULL, -- 'weight_loss', 'muscle_gain', 'cardiovascular_health', etc.
  priority_level INTEGER CHECK (priority_level >= 1 AND priority_level <= 10) NOT NULL,
  target_value DECIMAL(10,3),
  target_unit TEXT,
  target_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  
  -- Offline sync
  version INTEGER DEFAULT 1,
  last_synced TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  
  -- Audit trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users DEFAULT auth.uid(),
  updated_by UUID REFERENCES auth.users
);

-- Health scores calculation
CREATE TABLE health_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles NOT NULL,
  score_type TEXT NOT NULL, -- 'overall', 'cardiovascular', 'metabolic', 'musculoskeletal'
  score_value DECIMAL(5,2) CHECK (score_value >= 0 AND score_value <= 100) NOT NULL,
  calculated_at TIMESTAMPTZ NOT NULL,
  factors JSONB, -- Factors that contributed to the score
  recommendations JSONB, -- AI-generated recommendations
  
  -- Offline sync
  version INTEGER DEFAULT 1,
  last_synced TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  
  -- Audit trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users DEFAULT auth.uid(),
  updated_by UUID REFERENCES auth.users
);

-- Onboarding progress tracking
CREATE TABLE onboarding_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles NOT NULL,
  screen_name TEXT NOT NULL, -- 'basic_info', 'medical_history', 'goals', etc.
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  data JSONB, -- Screen-specific data
  skipped BOOLEAN DEFAULT FALSE,
  skipped_at TIMESTAMPTZ,
  
  -- Offline sync
  version INTEGER DEFAULT 1,
  last_synced TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  
  -- Audit trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users DEFAULT auth.uid(),
  updated_by UUID REFERENCES auth.users
);

-- Screen analytics for UX optimization
CREATE TABLE screen_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles NOT NULL,
  session_id UUID NOT NULL,
  screen_name TEXT NOT NULL,
  entered_at TIMESTAMPTZ NOT NULL,
  exited_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  interactions JSONB, -- Track user interactions
  device_info JSONB, -- Device and app version info
  
  -- Offline sync
  version INTEGER DEFAULT 1,
  last_synced TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  
  -- Audit trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users DEFAULT auth.uid(),
  updated_by UUID REFERENCES auth.users
);

-- Device connections for integrations
CREATE TABLE device_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles NOT NULL,
  provider TEXT NOT NULL, -- 'apple_health', 'google_fit', 'fitbit', 'oura', etc.
  provider_user_id TEXT NOT NULL,
  terra_user_id TEXT, -- Terra API user ID
  access_token TEXT, -- Encrypted access token
  refresh_token TEXT, -- Encrypted refresh token
  token_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  last_sync TIMESTAMPTZ,
  sync_frequency_minutes INTEGER DEFAULT 60,
  sync_scope TEXT[], -- What data to sync
  consent_granted BOOLEAN DEFAULT FALSE,
  consent_granted_at TIMESTAMPTZ,
  
  -- Offline sync
  version INTEGER DEFAULT 1,
  last_synced TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  
  -- Audit trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users DEFAULT auth.uid(),
  updated_by UUID REFERENCES auth.users
);

-- Sync conflicts resolution
CREATE TABLE sync_conflicts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  conflict_type TEXT NOT NULL, -- 'duplicate', 'version_mismatch', 'data_inconsistency'
  local_data JSONB,
  remote_data JSONB,
  resolution TEXT, -- 'local_wins', 'remote_wins', 'manual_resolution'
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users,
  
  -- Offline sync
  version INTEGER DEFAULT 1,
  last_synced TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  
  -- Audit trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users DEFAULT auth.uid(),
  updated_by UUID REFERENCES auth.users
);

-- Audit log for HIPAA compliance
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles NOT NULL,
  action TEXT NOT NULL, -- 'create', 'read', 'update', 'delete'
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Offline sync
  version INTEGER DEFAULT 1,
  last_synced TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  
  -- Audit trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users DEFAULT auth.uid(),
  updated_by UUID REFERENCES auth.users
);

-- Exercise library
CREATE TABLE exercise_library (
  exercise_uid TEXT PRIMARY KEY,
  exercise_canonical_id TEXT NOT NULL,
  exercise_display_name_en TEXT NOT NULL,
  exercise_name_aliases TEXT[],
  exercise_status TEXT DEFAULT 'active',
  exercise_keywords TEXT[],
  exercise_tags TEXT,
  exercise_primary_movement_pattern TEXT,
  exercise_mechanics_type TEXT,
  exercise_kinematic_context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mesocycle blocks
CREATE TABLE mesocycle (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles NOT NULL,
  mesocycle_name TEXT NOT NULL,
  goal TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  start_date DATE NOT NULL,
  num_weeks INTEGER NOT NULL,
  days_per_week INTEGER,
  muscle_emphasis TEXT[],
  split_type TEXT,
  
  -- Offline sync
  version INTEGER DEFAULT 1,
  last_synced TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  
  -- Audit trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users DEFAULT auth.uid(),
  updated_by UUID REFERENCES auth.users
);

-- Workouts
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mesocycle_block_id UUID REFERENCES mesocycle NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  
  -- Offline sync
  version INTEGER DEFAULT 1,
  last_synced TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  
  -- Audit trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users DEFAULT auth.uid(),
  updated_by UUID REFERENCES auth.users
);

-- Workout exercises
CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts NOT NULL,
  exercise_id TEXT REFERENCES exercise_library NOT NULL,
  order_index INTEGER NOT NULL,
  superset_group TEXT, -- 'A', 'B', 'C' or null
  soreness_from_last INTEGER,
  pump INTEGER,
  effort INTEGER,
  joint_pain INTEGER,
  recovery_gate INTEGER,
  stimulus_score INTEGER,
  
  -- Offline sync
  version INTEGER DEFAULT 1,
  last_synced TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  
  -- Audit trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users DEFAULT auth.uid(),
  updated_by UUID REFERENCES auth.users
);

-- Workout sets
CREATE TABLE workout_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_exercise_id UUID REFERENCES workout_exercises NOT NULL,
  set_number INTEGER NOT NULL,
  target_reps INTEGER,
  actual_reps INTEGER,
  weight_kg DECIMAL(8,2),
  target_rir_raw INTEGER,
  achieved_rir_raw INTEGER,
  e1rm DECIMAL(8,2),
  total_volume DECIMAL(10,2),
  is_effective_set BOOLEAN,
  status BOOLEAN DEFAULT FALSE,
  
  -- Offline sync
  version INTEGER DEFAULT 1,
  last_synced TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  
  -- Audit trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_modified TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users DEFAULT auth.uid(),
  updated_by UUID REFERENCES auth.users
);

-- Indexes for performance
CREATE INDEX idx_user_conditions_user_id ON user_conditions(user_id);
CREATE INDEX idx_user_conditions_active ON user_conditions(user_id) WHERE is_active = TRUE;
CREATE INDEX idx_user_conditions_effective_date ON user_conditions(user_id, effective_from, effective_to);

CREATE INDEX idx_user_medications_user_id ON user_medications(user_id);
CREATE INDEX idx_user_medications_active ON user_medications(user_id) WHERE is_active = TRUE;
CREATE INDEX idx_user_medications_date_range ON user_medications(user_id, start_date, end_date);

CREATE INDEX idx_medication_doses_user_medication ON medication_doses(user_medication_id);
CREATE INDEX idx_medication_doses_user_taken ON medication_doses(user_id, taken_at);
CREATE INDEX idx_medication_doses_adherence ON medication_doses(user_id, adherence_score);

CREATE INDEX idx_user_metrics_user_type ON user_metrics(user_id, metric_type);
CREATE INDEX idx_user_metrics_measured_at ON user_metrics(user_id, measured_at);
CREATE INDEX idx_user_metrics_source ON user_metrics(user_id, source);

CREATE INDEX idx_user_priorities_user_active ON user_priorities(user_id) WHERE is_active = TRUE;
CREATE INDEX idx_user_priorities_type_level ON user_priorities(user_id, priority_type, priority_level);

CREATE INDEX idx_health_scores_user_type ON health_scores(user_id, score_type);
CREATE INDEX idx_health_scores_calculated_at ON health_scores(user_id, calculated_at);

CREATE INDEX idx_onboarding_progress_user_id ON onboarding_progress(user_id);
CREATE INDEX idx_onboarding_progress_screen ON onboarding_progress(user_id, screen_name);

CREATE INDEX idx_screen_analytics_user_screen ON screen_analytics(user_id, screen_name);
CREATE INDEX idx_screen_analytics_session ON screen_analytics(session_id);
CREATE INDEX idx_screen_analytics_entered_at ON screen_analytics(entered_at);

CREATE INDEX idx_device_connections_user_id ON device_connections(user_id);
CREATE INDEX idx_device_connections_provider ON device_connections(user_id, provider);
CREATE INDEX idx_device_connections_active ON device_connections(user_id, is_active);
CREATE INDEX idx_device_connections_terra_user ON device_connections(terra_user_id);
CREATE INDEX idx_device_connections_last_sync ON device_connections(last_sync);

CREATE INDEX idx_sync_conflicts_user_id ON sync_conflicts(user_id);
CREATE INDEX idx_sync_conflicts_unresolved ON sync_conflicts(user_id) WHERE resolved_at IS NULL;

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_performed_at ON audit_log(performed_at);

CREATE INDEX idx_mesocycle_user_id ON mesocycle(user_id);
CREATE INDEX idx_mesocycle_status ON mesocycle(user_id, status);
CREATE INDEX idx_mesocycle_date_range ON mesocycle(user_id, start_date);

CREATE INDEX idx_workouts_mesocycle ON workouts(mesocycle_block_id);
CREATE INDEX idx_workouts_started_at ON workouts(started_at);

CREATE INDEX idx_workout_exercises_workout ON workout_exercises(workout_id);
CREATE INDEX idx_workout_exercises_order ON workout_exercises(workout_id, order_index);

CREATE INDEX idx_workout_sets_exercise ON workout_sets(workout_exercise_id);
CREATE INDEX idx_workout_sets_number ON workout_sets(workout_exercise_id, set_number);

-- Row Level Security (RLS) for HIPAA compliance
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_doses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE screen_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesocycle ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own conditions" ON user_conditions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own medications" ON user_medications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own medication doses" ON medication_doses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own metrics" ON user_metrics
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own priorities" ON user_priorities
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own health scores" ON health_scores
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own onboarding" ON onboarding_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own analytics" ON screen_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own device connections" ON device_connections
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sync conflicts" ON sync_conflicts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own audit log" ON audit_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own mesocycles" ON mesocycle
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own workouts" ON workouts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own workout exercises" ON workout_exercises
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own workout sets" ON workout_sets
  FOR ALL USING (auth.uid() = user_id);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_conditions_updated_at BEFORE UPDATE ON user_conditions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_medications_updated_at BEFORE UPDATE ON user_medications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_device_connections_updated_at BEFORE UPDATE ON device_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        user_id,
        action,
        table_name,
        record_id,
        old_data,
        new_data
    ) VALUES (
        COALESCE(NEW.created_by, auth.uid()),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Audit triggers for HIPAA compliance
CREATE TRIGGER audit_user_profiles AFTER INSERT OR UPDATE OR DELETE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_user_conditions AFTER INSERT OR UPDATE OR DELETE ON user_conditions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_user_medications AFTER INSERT OR UPDATE OR DELETE ON user_medications
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_medication_doses AFTER INSERT OR UPDATE OR DELETE ON medication_doses
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_user_metrics AFTER INSERT OR UPDATE OR DELETE ON user_metrics
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_user_priorities AFTER INSERT OR UPDATE OR DELETE ON user_priorities
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_health_scores AFTER INSERT OR UPDATE OR DELETE ON health_scores
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_onboarding_progress AFTER INSERT OR UPDATE OR DELETE ON onboarding_progress
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_screen_analytics AFTER INSERT OR UPDATE OR DELETE ON screen_analytics
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_device_connections AFTER INSERT OR UPDATE OR DELETE ON device_connections
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_sync_conflicts AFTER INSERT OR UPDATE OR DELETE ON sync_conflicts
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_mesocycle AFTER INSERT OR UPDATE OR DELETE ON mesocycle
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_workouts AFTER INSERT OR UPDATE OR DELETE ON workouts
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_workout_exercises AFTER INSERT OR UPDATE OR DELETE ON workout_exercises
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_workout_sets AFTER INSERT OR UPDATE OR DELETE ON workout_sets
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();