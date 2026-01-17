/* eslint-disable no-undef */
const { resolve } = require('path');

const { config } = require('dotenv');

// Load environment variables based on NODE_ENV
const env = process.env.NODE_ENV;

// Only load .env files in local development, not in EAS builds
if (!process.env.EAS_BUILD) {
  const envFile = `.env.${env}`;
  config({ path: resolve(__dirname, envFile) });
}

module.exports = {
  expo: {
    name: 'Daybreaker',
    slug: 'daybreaker-portal',
    version: '1.0.4',
    description:
      'Daybreaker is a comprehensive health and fitness platform that helps you track your wellness journey, manage your workouts, and achieve your health goals with personalized insights and data-driven recommendations.',
    keywords: [
      'health',
      'fitness',
      'wellness',
      'tracking',
      'workout',
      'nutrition',
      'lifestyle',
    ],
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#F9B233',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: false,
      usesAppleSignIn: true,
      bundleIdentifier: 'com.daybreaker.portal',
      infoPlist: {
        NSCameraUsageDescription:
          'This app needs access to camera to scan health data.',
        NSPhotoLibraryUsageDescription:
          'This app needs access to photo library to save health reports.',
        ITSAppUsesNonExemptEncryption: false,
      },
      urlScheme:
        'com.googleusercontent.apps.755246463428-tork0ofjurkfmb0to95skcrierm0pg3r',
    },
    android: {
      package: 'com.daybreaker.portal',
      minSdkVersion: 28,
      adaptiveIcon: {
        foregroundImage: './assets/android_white_BG.png',
        backgroundColor: '#FFFFFF',
      },
      permissions: [
        'android.permission.CAMERA',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE',
      ],
      playStoreUrl:
        'https://play.google.com/store/apps/details?id=com.daybreaker.portal',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    runtimeVersion: '1.0.4',
    owner: 'daybreakerhealth',
    extra: {
      // Environment variables for the app
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      terraDevId: process.env.EXPO_PUBLIC_TERRA_DEV_ID,
      terraApiKey: process.env.EXPO_PUBLIC_TERRA_API_KEY,
      nodeEnv: env,
      // EAS project configuration
      eas: {
        projectId: '68ea4bcb-3e5b-4a31-b317-f8c952d130f5',
      },
    },
    plugins: [
      'expo-font',
      '@react-native-community/datetimepicker',
      [
        'expo-secure-store',
        {
          configureAndroidBackup: true,
          faceIDPermission:
            'Allow $(PRODUCT_NAME) to access your Face ID biometric data.',
        },
      ],
      ['expo-apple-authentication'],
    ],
    scheme: 'daybreaker',
    schemes: [
      'daybreaker',
      'com.googleusercontent.apps.755246463428-tork0ofjurkfmb0to95skcrierm0pg3r',
    ],
  },
};
