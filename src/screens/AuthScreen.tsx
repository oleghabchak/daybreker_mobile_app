import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Input } from '../components';
import { isIOS } from '../constants';
import {
  BorderRadius,
  Colors,
  Shadows,
  Space,
  Typography,
} from '../constants/theme';
import { supabase } from '../lib/supabase';
import {
  useAuthError,
  useAuthStore,
  useAuthUser,
  useIsAuthenticated,
  useIsLoading,
} from '../models/AuthenticationStore';
import { errorManager } from '../services/errorNotificationManager';
import { SocialAuthService } from '../services/socialAuth';
import { useUserProfileStore } from '../user-module/profile/stores/user-profile-store';

export const AuthScreen = ({ navigation }: any) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isAppleSignInAvailable, setIsAppleSignInAvailable] = useState(false);

  // Zustand store hooks
  const user = useAuthUser();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useIsLoading();
  const error = useAuthError();

  // Actions from the store
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
    signInWithFacebook,
    getCurrentUser,
    clearError,
    setOnboarding,
  } = useAuthStore();

  const { loadProfile } = useUserProfileStore();

  useEffect(() => {
    checkAppleSignInAvailability();
    // Check current user on mount
    getCurrentUser();
  }, [getCurrentUser]);

  useEffect(() => {
    if (!user?.id) return;

    loadProfile(user.id);
  }, [user]);

  const checkAppleSignInAvailability = async () => {
    const available = await SocialAuthService.isAppleAvailable();
    setIsAppleSignInAvailable(available);
  };

  const handleAppleSignIn = async () => {
    try {
      await handleSocialAuth('apple');
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        // User canceled sign-in
      } else {
        errorManager.showError(e.message || 'Apple sign-in failed');
      }
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      errorManager.showError('Please fill in all fields');
      return;
    }

    if (!isLogin && !fullName) {
      errorManager.showError('Please enter your name');
      return;
    }

    clearError();

    try {
      if (isLogin) {
        const result = await signInWithEmail(email, password);
        if (result.success) {
          const {
            data: { user: currentUser },
          } = await supabase.auth.getUser();

          if (currentUser) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', currentUser.id)
              .single();

            if (!profile) {
              await supabase.from('profiles').insert({
                user_id: currentUser.id,
                full_name: fullName,
                email: email,
                date_of_birth: null,
                height_cm: null,
                weight_kg: null,
                timezone: 'UTC',
                onboarding_completed: false,
                research_consent: false,
                terms_accepted_at: null,
                is_admin: false,
                role: 'user',
              });
            }

            navigation.reset({
              index: 0,
              routes: [{ name: 'App' }],
            });
          }
        } else {
          errorManager.showError(result.error || 'Sign in failed');
        }
      } else {
        const result = await signUpWithEmail(email, password, fullName);
        if (result.success) {
          if (result.user) {
            await supabase.from('profiles').insert({
              user_id: result.user.id,
              full_name: fullName,
              email: email,
              date_of_birth: null,
              height_cm: null,
              weight_kg: null,
              timezone: 'UTC',
              onboarding_completed: false,
              research_consent: false,
              terms_accepted_at: null,
              is_admin: false,
              role: 'user',
            });
          }

          navigation.navigate('App');
        } else {
          errorManager.showError(result.error || 'Sign up failed');
        }
      }
    } catch (error: any) {
      errorManager.showError(error);
    }
  };

  const handleSocialAuth = async (
    provider: 'google' | 'apple' | 'facebook'
  ): Promise<boolean> => {
    clearError();

    try {
      let result;

      switch (provider) {
        case 'google':
          result = await signInWithGoogle();
          break;
        case 'apple':
          result = await signInWithApple();
          break;
        case 'facebook':
          result = await signInWithFacebook();
          break;
        default:
          throw new Error('Unsupported provider');
      }

      if (result.success && result.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('user_id', result.user.id)
          .single();

        if (!profile) {
          await supabase.from('profiles').insert({
            user_id: result.user.id,
            email: result.user.email,
            full_name:
              result.user.user_metadata?.name ||
              result.user.user_metadata?.full_name,
            date_of_birth: null,
            height_cm: null,
            weight_kg: null,
            timezone: 'UTC',
            onboarding_completed: false,
            research_consent: false,
            terms_accepted_at: null,
            is_admin: false,
            role: 'user',
          });
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        const { data: profile2 } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('user_id', result.user.id)
          .single();

        navigation.navigate('App');

        return true;
      } else {
        errorManager.showError(result.error || 'Something went wrong');
        return false;
      }
    } catch (error: any) {
      errorManager.showError(error.message || 'Authentication failed');
      return false;
    }
  };

  // If user is authenticated, redirect to main app
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if onboarding is complete
      const checkProfile = async () => {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('user_id', user.id)
            .single();

          if (profile?.onboarding_completed) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'App' }],
            });
          } else {
            setOnboarding(true);
            navigation.navigate('App');
          }
        } catch (error) {
          setOnboarding(true);
          navigation.navigate('App');
        }
      };

      checkProfile();
    }
  }, [isAuthenticated, user, navigation, setOnboarding]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={Colors.background}
        barStyle='dark-content'
        translucent={false}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          {/* <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity> */}
          <Text style={styles.headerTitle}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isLogin
              ? 'Sign in to continue your journey'
              : 'Start your health journey today'}
          </Text>
        </View>

        <View style={styles.form}>
          {/* Social Authentication */}
          <View style={styles.socialContainer}>
            <Text style={styles.socialTitle}>
              {isLogin ? 'Sign in with' : 'Sign up with'}
            </Text>

            <View style={styles.socialButtons}>
              {/* Google */}
              <TouchableOpacity
                style={[styles.socialButton, styles.googleButton]}
                onPress={() => handleSocialAuth('google')}
                disabled={isLoading}
              >
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              {/* Apple */}
              {isIOS && (
                <TouchableOpacity
                  style={[styles.socialButton, styles.appleButton]}
                  onPress={handleAppleSignIn}
                  disabled={isLoading}
                >
                  <Text style={styles.appleButtonText}>Sign in with Apple</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>
          </View>

          {!isLogin && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <Input
                style={styles.input}
                placeholder='John Doe'
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize='words'
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <Input
              placeholder='your@email.com'
              value={email}
              onChangeText={setEmail}
              autoCapitalize='none'
              keyboardType='email-address'
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <Input
              placeholder='••••••••'
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.textInverse} />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          {/* <TouchableOpacity
            onPress={() => setIsLogin(!isLogin)}
            style={styles.switchButton}
          >
            <Text style={styles.switchText}>
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </Text>
          </TouchableOpacity> */}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Space[6],
    paddingTop: Space[6],
    marginBottom: Space[8],
  },
  backButton: {
    marginBottom: Space[6],
  },
  backText: {
    fontSize: 24,
    color: Colors.text,
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Space[2],
  },
  headerSubtitle: {
    ...Typography.body,
    color: Colors.textDisabled,
  },
  form: {
    paddingHorizontal: Space[6],
  },
  inputContainer: {
    marginBottom: Space[6],
  },
  label: {
    ...Typography.bodyMedium,
    color: Colors.text,
    marginBottom: Space[2],
  },
  input: {
    ...Typography.body,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Space[4],
    paddingVertical: Space[4],
    backgroundColor: Colors.surfaceSecondary,
  },
  button: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Space[6],
    ...Shadows.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    ...Typography.bodyMedium,
    color: Colors.textInverse,
    fontSize: Typography.fontSize.lg,
  },
  switchButton: {
    alignItems: 'center',
    marginTop: Space[6],
  },
  switchText: {
    ...Typography.body,
    color: Colors.primary,
  },
  socialContainer: {
    marginBottom: Space[6],
  },
  socialTitle: {
    ...Typography.bodyMedium,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Space[4],
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Space[3],
    marginBottom: Space[6],
  },
  socialButton: {
    flex: 1,
    maxWidth: 160,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Space[3],
    paddingHorizontal: Space[1],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    ...Shadows.sm,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DADCE0',
  },
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  facebookButton: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4285F4',
    marginRight: Space[1],
  },
  appleIcon: {
    fontSize: 14,
    marginRight: Space[1],
  },
  facebookIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: Space[1],
  },
  socialButtonText: {
    ...Typography.caption,
    color: '#5F6368',
    fontSize: Typography.fontSize.sm,
  },
  appleButtonText: {
    ...Typography.smallBold,
    color: '#FFFFFF',
    fontSize: Typography.fontSize.sm,
  },
  facebookButtonText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontSize: Typography.fontSize.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Space[4],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Typography.caption,
    color: Colors.textDisabled,
    marginHorizontal: Space[4],
  },
});
