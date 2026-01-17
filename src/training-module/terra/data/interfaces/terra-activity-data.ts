/**
 * Terra Activity Data Interface
 * For detailed activity tracking data
 */

export interface ITerraActivityData {
  // Activity Summary
  activity_summary: {
    total_active_minutes: number;
    moderate_activity_minutes: number;
    vigorous_activity_minutes: number;
    light_activity_minutes: number;
  };

  // Workout Data
  workouts: {
    workout_id: string;
    workout_name: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    calories_burned: number;
    average_heart_rate: number;
    max_heart_rate: number;
    workout_type: string;
    distance_meters?: number;
    steps?: number;
  }[];

  // Heart Rate Zones
  heart_rate_zones: {
    zone_1: number; // Recovery
    zone_2: number; // Aerobic Base
    zone_3: number; // Aerobic Threshold
    zone_4: number; // Lactate Threshold
    zone_5: number; // Neuromuscular Power
  };

  // Sleep Data (if available)
  sleep_data?: {
    total_sleep_hours: number;
    deep_sleep_hours: number;
    light_sleep_hours: number;
    REM_sleep_hours: number;
    awake_hours: number;
    sleep_efficiency: number;
    bedtime: string;
    wake_time: string;
  };

  // Recovery Metrics
  recovery_metrics: {
    hrv_score?: number;
    resting_heart_rate: number;
    stress_level: number;
    readiness_score?: number;
  };
}

/**
 * Terra User Profile Interface
 */
export interface ITerraUserProfile {
  user_id: string;
  reference_id: string;
  provider: string;
  scopes: string;
  last_webhook_update: string;
  connected_devices: string[];
  permissions_granted: string[];
}

/**
 * Terra Connection Status Interface
 */
export interface ITerraConnectionStatus {
  is_connected: boolean;
  user_id?: string;
  provider: string;
  last_sync: string;
  permissions_status: {
    health_kit: boolean;
    activity: boolean;
    heart_rate: boolean;
    sleep: boolean;
    nutrition: boolean;
  };
  device_info: {
    name: string;
    manufacturer: string;
    model: string;
    os_version: string;
  };
}
