import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Session, User } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { checkGooglePlayServices } from '../config/googleSignIn';
import { supabase } from '../lib/supabase';

export interface SocialAuthResult {
  success: boolean;
  error?: string;
  user?: User;
  session?: Session;
}

export class SocialAuthService {
  static async signInWithGoogle(): Promise<SocialAuthResult> {
    try {
      // Web uses Supabase OAuth redirect instead of native SDK
      if (Platform.OS === 'web') {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) {
          throw error;
        }
        // On web, this will redirect; return pending state
        return { success: true, user: data.user, session: data.session } as any;
      }

      // Check Play Services availability (Android)
      if (Platform.OS === 'android') {
        const playServicesAvailable = await checkGooglePlayServices();
        if (!playServicesAvailable) {
          throw new Error('Google Play Services not available');
        }
      }

      // Sign in with Google
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      // Get the ID token
      const tokens = await GoogleSignin.getTokens();

      if (!tokens.idToken) {
        throw new Error('No ID token received from Google');
      }

      // Proper solution: Extract nonce from the ID token if it exists
      // Google's iOS SDK doesn't include nonces by default, but we need to handle both cases
      let nonce: string | undefined;
      try {
        // Decode the JWT to check for nonce
        const [, payload] = tokens.idToken.split('.');
        const decodedPayload = JSON.parse(atob(payload));
        nonce = decodedPayload.nonce;
      } catch (decodeError) {
        console.log('Could not decode ID token, proceeding without nonce');
      }

      // Use signInWithIdToken with proper nonce handling
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: tokens.idToken,
        // Only include nonce if it exists in the token
        ...(nonce && { nonce }),
      });

      if (error) {
        // If nonce error, provide clear guidance
        if (error.message.includes('nonce')) {
          console.error(
            'Nonce error detected. Please enable "Skip nonce checks" in Supabase dashboard under Authentication > Providers > Google'
          );
        }
        throw error;
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      return {
        success: false,
        error: error.message || 'Google Sign-In failed',
      };
    }
  }

  static async signInWithApple(): Promise<SocialAuthResult> {
    try {
      // Import AppleAuthentication dynamically to avoid issues on Android
      const AppleAuthentication = await import('expo-apple-authentication');

      // Check if Apple Sign-In is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Apple Sign-In is not available on this device');
      }

      // Sign in with Apple
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('Apple credential received:', credential);

      // Extract the identity token from the credential
      if (!credential.identityToken) {
        throw new Error('No identity token received from Apple');
      }

      // Sign in with Supabase using the Apple identity token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
        // Include nonce if available
        ...(credential.nonce && { nonce: credential.nonce }),
      });

      if (error) {
        console.error('Supabase Apple auth error:', error);
        throw error;
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error: any) {
      console.error('Apple Sign-In Error:', error);
      return {
        success: false,
        error: error.message || 'Apple Sign-In failed',
      };
    }
  }

  static async signInWithFacebook(): Promise<SocialAuthResult> {
    return {
      success: false,
      error: 'Facebook Sign-In not implemented yet',
    };
  }

  static async isGoogleAvailable(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') return false;
      return true; // Google Sign-In is configured
    } catch {
      return false;
    }
  }

  static async isAppleAvailable(): Promise<boolean> {
    try {
      if (Platform.OS !== 'ios') return false;

      // Import AppleAuthentication dynamically to avoid issues on Android
      const AppleAuthentication = await import('expo-apple-authentication');
      return await AppleAuthentication.isAvailableAsync();
    } catch {
      return false;
    }
  }

  static async isFacebookAvailable(): Promise<boolean> {
    return false;
  }
}
