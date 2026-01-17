// React Native/Expo environment configuration
// Uses Expo's extra configuration from app.config.js

import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};

export const environment = {
  supabase: {
    url: extra.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL,
    anonKey: extra.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
  terra: {
    devId: extra.terraDevId || process.env.EXPO_PUBLIC_TERRA_DEV_ID,
    apiKey: extra.terraApiKey || process.env.EXPO_PUBLIC_TERRA_API_KEY,
  },
  nodeEnv: extra.nodeEnv || process.env.NODE_ENV,
} as const;

// Log environment info
if (environment.nodeEnv === 'development') {
  console.log('🔧 Using DEV environment🔑', environment.supabase.url);
} else if (environment.nodeEnv === 'production') {
  console.log('🚀 Using PROD environment🔑', environment.supabase.url);
}
