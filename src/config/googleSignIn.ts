import { Platform } from 'react-native';

/**
 * Google Sign-In Configuration
 *
 * This must be called before any sign-in attempts.
 * Configure this early in your app lifecycle (App.tsx or root component).
 *
 * To get your client IDs:
 * 1. Go to Google Cloud Console: https://console.cloud.google.com/
 * 2. Create OAuth 2.0 credentials:
 *    - Web client ID (for Supabase integration)
 *    - iOS client ID (for mobile app)
 * 3. Replace the placeholder values below
 */

export const configureGoogleSignIn = () => {
  if (Platform.OS === 'web') return;

  const { GoogleSignin } = require('@react-native-google-signin/google-signin');
  GoogleSignin.configure({
    // Required: Web Client ID from Google Cloud Console
    webClientId:
      '755246463428-3sdg64j09joeengmir43hetrk8gqpvdn.apps.googleusercontent.com',

    // Required for iOS: iOS Client ID from Google Cloud Console
    iosClientId:
      '755246463428-tork0ofjurkfmb0to95skcrierm0pg3r.apps.googleusercontent.com',

    // Optional configuration
    offlineAccess: true, // Enables refresh token for server-side validation
    forceCodeForRefreshToken: true, // Recommended for server-side validation
    profileImageSize: 120, // Profile image size in pixels

    // Scopes (optional - these are defaults)
    scopes: ['email', 'profile'],
  });
};

/**
 * Check if Google Play Services are available (Android only)
 * Call this before attempting sign-in
 */
export const checkGooglePlayServices = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') return false;

    const {
      GoogleSignin,
    } = require('@react-native-google-signin/google-signin');
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    return true;
  } catch (error) {
    console.warn('Google Play Services not available:', error);
    return false;
  }
};
