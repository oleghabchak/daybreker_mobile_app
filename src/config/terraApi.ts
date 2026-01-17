/**
 * Terra API Configuration
 *
 * Terra.co provides unified health device integration
 * Documentation: https://docs.tryterra.co/
 */

export const TERRA_CONFIG = {
  // You'll need to sign up at https://tryterra.co/ and get these
  API_URL: 'https://api.tryterra.co/v2',
  // DEV_ID: 'daybreakerhealth-prod-s7DuKDUy5C',
  // API_KEY: 'OeNwfeJcWBibOIF7Ic7EvTjFTeGZBoel',
  DEV_ID: process.env.EXPO_PUBLIC_TERRA_DEV_ID,
  API_KEY: process.env.EXPO_PUBLIC_TERRA_API_KEY,

  // Webhook URL for receiving data
  WEBHOOK_URL:
    process.env.TERRA_WEBHOOK_URL || 'https://your-app.com/api/terra-webhook',
};

export const SUPPORTED_PROVIDERS = [
  {
    id: 'apple',
    name: 'Apple Health',
    description: 'Connect your iPhone health data',
    icon: '🍎',
    color: '#007AFF',
    features: ['Steps', 'Heart Rate', 'Sleep', 'Workouts', 'Health Records'],
    popularity: 1, // Most popular
  },
  {
    id: 'whoop',
    name: 'WHOOP',
    description: 'Recovery, strain, and sleep insights',
    icon: '⚡',
    color: '#FF6B35',
    features: [
      'HRV',
      'Recovery Score',
      'Strain',
      'Sleep Quality',
      'Heart Rate',
    ],
    popularity: 2,
  },
  {
    id: 'garmin',
    name: 'Garmin',
    description: 'Fitness and activity tracking',
    icon: '🏃',
    color: '#007CC3',
    features: [
      'GPS Activities',
      'Heart Rate',
      'Sleep',
      'Stress',
      'Body Battery',
    ],
    popularity: 3,
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    description: 'Daily activity and health metrics',
    icon: '📊',
    color: '#00B0B9',
    features: ['Steps', 'Heart Rate', 'Sleep', 'Exercise', 'Weight'],
    popularity: 4,
  },
  {
    id: 'oura',
    name: 'Oura Ring',
    description: 'Sleep and recovery optimization',
    icon: '💍',
    color: '#5A67D8',
    features: [
      'Sleep Stages',
      'Readiness Score',
      'Temperature',
      'HRV',
      'Activity',
    ],
    popularity: 5,
  },
  {
    id: 'strava',
    name: 'Strava',
    description: 'Running and cycling activities',
    icon: '🚴',
    color: '#FC4C02',
    features: [
      'Activities',
      'Performance',
      'Training Load',
      'Routes',
      'Social',
    ],
    popularity: 6,
  },
  {
    id: 'myfitnesspal',
    name: 'MyFitnessPal',
    description: 'Nutrition and calorie tracking',
    icon: '🍽️',
    color: '#0066CC',
    features: ['Calories', 'Macros', 'Food Diary', 'Weight', 'Nutrition'],
    popularity: 7,
  },
  {
    id: 'google_fit',
    name: 'Google Fit',
    description: 'Android health and fitness data',
    icon: '📱',
    color: '#4285F4',
    features: ['Steps', 'Activities', 'Heart Rate', 'Weight', 'Nutrition'],
    popularity: 8,
  },
];

export const TERRA_DATA_TYPES = {
  ACTIVITY: 'activity',
  SLEEP: 'sleep',
  DAILY: 'daily',
  NUTRITION: 'nutrition',
  BODY: 'body',
  MENSTRUATION: 'menstruation',
} as const;

export const TERRA_WEBHOOK_TYPES = {
  USER_REAUTH: 'user_reauth',
  DEAUTH: 'deauth',
  ACCESS_REVOKED: 'access_revoked',
  CONNECTION_ERROR: 'connection_error',
  ...TERRA_DATA_TYPES,
} as const;

/**
 * Generate Terra auth URL for a specific provider
 */
export const generateTerraAuthUrl = (
  userId: string,
  provider: string,
  redirectUrl: string
) => {
  const params = new URLSearchParams({
    resource: provider,
    reference_id: userId,
    redirect_uri: redirectUrl,
    language: 'en',
  });

  return `${TERRA_CONFIG.API_URL}/auth/${provider}?${params.toString()}`;
};

/**
 * Terra API headers for authenticated requests
 */
export const getTerraHeaders = () => ({
  'Content-Type': 'application/json',
  'dev-id': TERRA_CONFIG.DEV_ID,
  'x-api-key': TERRA_CONFIG.API_KEY,
});

/**
 * Map Terra provider names to our internal provider IDs
 */
export const TERRA_PROVIDER_MAP: Record<string, string> = {
  APPLE_HEALTH: 'apple',
  WHOOP: 'whoop',
  GARMIN: 'garmin',
  FITBIT: 'fitbit',
  OURA: 'oura',
  STRAVA: 'strava',
  MYFITNESSPAL: 'myfitnesspal',
  GOOGLE_FIT: 'google_fit',
};

/**
 * Health metrics mapping from Terra to our database
 */
export const TERRA_METRIC_MAPPING: Record<string, string> = {
  // Sleep metrics
  sleep_efficiency: 'sleep_efficiency',
  sleep_duration_seconds: 'sleep_duration',
  time_in_bed_seconds: 'time_in_bed',
  awake_time_seconds: 'awake_time',
  light_sleep_duration_seconds: 'light_sleep',
  deep_sleep_duration_seconds: 'deep_sleep',
  rem_sleep_duration_seconds: 'rem_sleep',

  // Activity metrics
  steps: 'daily_steps',
  distance_meters: 'distance',
  calories_burned: 'calories_burned',
  active_duration_seconds: 'active_time',

  // Body metrics
  weight_kg: 'weight',
  body_fat_percentage: 'body_fat',
  muscle_mass_kg: 'muscle_mass',
  bone_mass_kg: 'bone_mass',

  // Heart rate
  avg_hr_bpm: 'avg_heart_rate',
  max_hr_bpm: 'max_heart_rate',
  resting_hr_bpm: 'resting_heart_rate',
  hr_variability_rmssd_ms: 'hrv_rmssd',

  // Stress and recovery
  stress_duration_seconds: 'stress_time',
  recovery_score: 'recovery_score',
  readiness_score: 'readiness_score',
};

export default TERRA_CONFIG;
