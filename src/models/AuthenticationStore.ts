import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { supabase } from '../lib/supabase';
import { errorManager } from '../services/errorNotificationManager';
import { SocialAuthService } from '../services/socialAuth';

// Authentication state interface
export interface AuthState {
  // User data
  user: User | null;
  session: Session | null;

  // Authentication state
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboarding: boolean;

  // Error handling
  error: string | null;

  // Social auth state
  isSocialAuthLoading: boolean;
  socialAuthProvider: 'google' | 'apple' | 'facebook' | null;
  profile: any; // TODO: add profile type
  allProfiles: any[]; // TODO: add profile type
}

// Authentication actions interface
export interface AuthActions {
  // Core authentication methods
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ success: boolean; error?: string; user?: User }>;
  signOut: () => Promise<void>;

  // Social authentication
  signInWithGoogle: () => Promise<{
    success: boolean;
    error?: string;
    user?: User;
    session?: Session;
  }>;
  signInWithApple: () => Promise<{
    success: boolean;
    error?: string;
    user?: User;
    session?: Session;
  }>;
  signInWithFacebook: () => Promise<{
    success: boolean;
    error?: string;
    user?: User;
    session?: Session;
  }>;

  // Session management
  refreshSession: () => Promise<void>;
  getCurrentUser: () => Promise<void>;

  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setOnboarding: (isOnboarding: boolean) => void;
  setUserId: (userId: string) => void;

  // Password management
  resetPassword: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;

  // User profile
  updateProfile: (
    updates: Partial<User>
  ) => Promise<{ success: boolean; error?: string }>;
  loadProfile: (userId?: string) => Promise<{
    success: boolean;
    error?: string;
    profile?: any;
  }>;
  loadAllProfiles: () => Promise<{
    success: boolean;
    error?: string;
    allProfiles?: any[];
  }>;
  setProfile: (profile: any) => void;

  // Account deletion
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
}

// Combined store type
export type AuthStore = AuthState & AuthActions;

// Create the authentication store
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,
      isOnboarding: false,
      error: null,
      isSocialAuthLoading: false,
      socialAuthProvider: null,
      profile: null,
      allProfiles: [],
      // Core authentication methods
      signInWithEmail: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
          }

          if (data.user && data.session) {
            set({
              user: data.user,
              session: data.session,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return { success: true };
          }

          set({ isLoading: false });
          return { success: false, error: 'Sign in failed' };
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      signUpWithEmail: async (
        email: string,
        password: string,
        fullName: string
      ) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
            },
          });

          if (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
          }

          if (data.user) {
            set({
              user: data.user,
              session: data.session,
              isAuthenticated: !!data.session,
              isLoading: false,
              error: null,
              isOnboarding: !data.session, // If no session, user needs to verify email
            });
            return { success: true, user: data.user };
          }

          set({ isLoading: false });
          return { success: false, error: 'Sign up failed' };
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true });

          const { error } = await supabase.auth.signOut();

          if (error) {
            set({ error: error.message, isLoading: false });
            return;
          }

          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isOnboarding: false,
            socialAuthProvider: null,
            profile: null,
            allProfiles: [],
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred';
          set({ error: errorMessage, isLoading: false });
        }
      },

      // Social authentication methods
      signInWithGoogle: async () => {
        try {
          set({
            isSocialAuthLoading: true,
            socialAuthProvider: 'google',
            error: null,
          });

          const result = await SocialAuthService.signInWithGoogle();
          if (result.success && result.user) {
            set({
              user: result.user,
              session: result.session || null,
              isAuthenticated: true,
              isSocialAuthLoading: false,
              socialAuthProvider: null,
              error: null,
            });
            return {
              success: true,
              user: result.user,
              session: result.session,
            };
          } else {
            set({
              isSocialAuthLoading: false,
              socialAuthProvider: null,
              error: result.error || 'Google sign in failed',
            });
            return {
              success: false,
              error: result.error || 'Google sign in failed',
            };
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred';
          set({
            isSocialAuthLoading: false,
            socialAuthProvider: null,
            error: errorMessage,
          });
          return { success: false, error: errorMessage };
        }
      },

      signInWithApple: async () => {
        try {
          set({
            isSocialAuthLoading: true,
            socialAuthProvider: 'apple',
            error: null,
          });

          const result = await SocialAuthService.signInWithApple();

          if (result.success && result.user) {
            // Check if user is marked as deleted
            if (result.user.user_metadata?.deleted === true) {
              // Sign out immediately
              await supabase.auth.signOut();
              errorManager.showError(
                'This account has been deleted and cannot be accessed'
              );

              set({
                isSocialAuthLoading: false,
                socialAuthProvider: null,
                error: 'This account has been deleted and cannot be accessed',
              });
              return {
                success: false,
                error: 'This account has been deleted and cannot be accessed',
              };
            }

            set({
              user: result.user,
              session: result.session || null,
              isAuthenticated: true,
              isSocialAuthLoading: false,
              socialAuthProvider: null,
              error: null,
            });
            return {
              success: true,
              user: result.user,
              session: result.session,
            };
          } else {
            set({
              isSocialAuthLoading: false,
              socialAuthProvider: null,
              error: result.error || 'Apple sign in failed',
            });
            return {
              success: false,
              error: result.error || 'Apple sign in failed',
            };
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred';
          set({
            isSocialAuthLoading: false,
            socialAuthProvider: null,
            error: errorMessage,
          });
          return { success: false, error: errorMessage };
        }
      },

      signInWithFacebook: async () => {
        try {
          set({
            isSocialAuthLoading: true,
            socialAuthProvider: 'facebook',
            error: null,
          });

          const result = await SocialAuthService.signInWithFacebook();

          if (result.success && result.user) {
            // Check if user is marked as deleted
            if (result.user.user_metadata?.deleted === true) {
              // Sign out immediately
              await supabase.auth.signOut();

              set({
                isSocialAuthLoading: false,
                socialAuthProvider: null,
                error: 'This account has been deleted and cannot be accessed',
              });
              return {
                success: false,
                error: 'This account has been deleted and cannot be accessed',
              };
            }

            set({
              user: result.user,
              session: result.session || null,
              isAuthenticated: true,
              isSocialAuthLoading: false,
              socialAuthProvider: null,
              error: null,
            });
            return {
              success: true,
              user: result.user,
              session: result.session,
            };
          } else {
            set({
              isSocialAuthLoading: false,
              socialAuthProvider: null,
              error: result.error || 'Facebook sign in failed',
            });
            return {
              success: false,
              error: result.error || 'Facebook sign in failed',
            };
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred';
          set({
            isSocialAuthLoading: false,
            socialAuthProvider: null,
            error: errorMessage,
          });
          return { success: false, error: errorMessage };
        }
      },

      // Session management
      refreshSession: async () => {
        try {
          set({ isLoading: true });

          const { data, error } = await supabase.auth.refreshSession();

          if (error) {
            set({ error: error.message, isLoading: false });
            return;
          }

          if (data.user && data.session) {
            set({
              user: data.user,
              session: data.session,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              user: null,
              session: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred';
          set({ error: errorMessage, isLoading: false });
        }
      },

      getCurrentUser: async () => {
        try {
          set({ isLoading: true });

          const {
            data: { user },
            error,
          } = await supabase.auth.getUser();

          if (error) {
            set({ error: error.message, isLoading: false });
            return;
          }

          if (user) {
            // Check if user is marked as deleted
            if (user.user_metadata?.deleted === true) {
              // Sign out immediately if user is deleted
              await supabase.auth.signOut();

              set({
                user: null,
                session: null,
                isAuthenticated: false,
                isLoading: false,
                error: 'This account has been deleted and cannot be accessed',
              });
              return;
            }

            const {
              data: { session },
            } = await supabase.auth.getSession();
            set({
              user,
              session,
              isAuthenticated: !!session,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              user: null,
              session: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred';
          set({ error: errorMessage, isLoading: false });
        }
      },

      // State management
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
      setOnboarding: (isOnboarding: boolean) => set({ isOnboarding }),
      setUserId: (userId: string) =>
        set(state => ({
          user: state.user ? { ...state.user, id: userId } : null,
        })),

      // Password management
      resetPassword: async (email: string) => {
        try {
          set({ isLoading: true, error: null });

          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'daybreaker://reset-password',
          });

          if (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
          }

          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      updatePassword: async (newPassword: string) => {
        try {
          set({ isLoading: true, error: null });

          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          });

          if (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
          }

          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      // User profile
      updateProfile: async (updates: Partial<User>) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase.auth.updateUser({
            data: updates,
          });

          if (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
          }

          if (data.user) {
            set({
              user: data.user,
              isLoading: false,
              error: null,
            });
            return { success: true };
          }

          set({ isLoading: false });
          return { success: false, error: 'Profile update failed' };
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      loadProfile: async (userId?: string) => {
        try {
          set({ isLoading: true, error: null });

          const user = get().user;
          if (!user?.id && !userId) {
            set({ error: 'No user found', isLoading: false });
            return { success: false, error: 'No user found' };
          }

          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId || user?.id)
            .single();

          if (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
          }

          if (profileData) {
            set({
              profile: profileData,
              isLoading: false,
              error: null,
            });
            return { success: true, profile: profileData };
          }

          set({ isLoading: false });
          return { success: false, error: 'Profile not found' };
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },
      loadAllProfiles: async (): Promise<{
        success: boolean;
        error?: string | undefined;
        allProfiles?: any[] | undefined;
      }> => {
        try {
          set({ isLoading: true, error: null });
          const { data: profilesData, error } = await supabase
            .from('profiles')
            .select('*');

          if (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
          }

          set({ allProfiles: profilesData || [], isLoading: false });
          return { success: true, allProfiles: profilesData || [] };
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      setProfile: (profile: any) => {
        set({ profile });
      },

      // Account deletion
      deleteAccount: async () => {
        try {
          set({ isLoading: true, error: null });

          const user = get().user;

          if (!user?.id) {
            set({ error: 'No user to delete', isLoading: false });
            return { success: false, error: 'No user to delete' };
          }

          console.log('** Starting hard deletion process for user:', user.id);

          // Call the SQL function for hard deletion
          const { data, error } = await supabase.rpc('delete_user_account', {
            user_id_to_delete: user.id,
          });

          if (error) {
            console.error('Error calling delete_user_account function:', error);
            throw new Error(`Failed to delete account: ${error.message}`);
          }

          if (!data?.success) {
            console.error('Delete function returned error:', data);
            throw new Error(data?.error || 'Failed to delete account');
          }

          console.log('** Hard deletion successful:', data);

          // Sign out the user
          await supabase.auth.signOut();

          // Clear local state
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isOnboarding: false,
            socialAuthProvider: null,
          });
          console.log('** Cleared local state');

          // Force clear persisted state from AsyncStorage
          try {
            await AsyncStorage.removeItem('auth-storage');
            console.log('** Cleared persisted auth state');
          } catch (storageError) {
            console.error('Error clearing persisted state:', storageError);
          }

          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
          try {
            const value = await AsyncStorage.getItem(name);
            return value ? JSON.parse(value) : null;
          } catch {
            return null;
          }
        },
        setItem: async (name: string, value: any) => {
          try {
            await AsyncStorage.setItem(name, JSON.stringify(value));
          } catch {
            // Handle storage errors gracefully
          }
        },
        removeItem: async (name: string) => {
          try {
            await AsyncStorage.removeItem(name);
          } catch {
            // Handle storage errors gracefully
          }
        },
      })),
      partialize: state => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        isOnboarding: state.isOnboarding,
        profile: state.profile,
      }),
    }
  )
);

// Selector hooks for common use cases
export const useAuthUser = () => useAuthStore(state => state.user);
export const useAuthSession = () => useAuthStore(state => state.session);
export const useIsAuthenticated = () =>
  useAuthStore(state => state.isAuthenticated);
export const useIsLoading = () => useAuthStore(state => state.isLoading);
export const useIsOnboarding = () => useAuthStore(state => state.isOnboarding);
export const useAuthError = () => useAuthStore(state => state.error);
export const useIsSocialAuthLoading = () =>
  useAuthStore(state => state.isSocialAuthLoading);
export const useSocialAuthProvider = () =>
  useAuthStore(state => state.socialAuthProvider);
export const useProfile = () => useAuthStore(state => state.profile);

// Action hooks
export const useAuthActions = () =>
  useAuthStore(state => ({
    signInWithEmail: state.signInWithEmail,
    signUpWithEmail: state.signUpWithEmail,
    signOut: state.signOut,
    signInWithGoogle: state.signInWithGoogle,
    signInWithApple: state.signInWithApple,
    signInWithFacebook: state.signInWithFacebook,
    refreshSession: state.refreshSession,
    getCurrentUser: state.getCurrentUser,
    resetPassword: state.resetPassword,
    updatePassword: state.updatePassword,
    updateProfile: state.updateProfile,
    loadProfile: state.loadProfile,
    loadAllProfiles: state.loadAllProfiles,
    setProfile: state.setProfile,
    setLoading: state.setLoading,
    setError: state.setError,
    clearError: state.clearError,
    setOnboarding: state.setOnboarding,
    setUserId: state.setUserId,
    deleteAccount: state.deleteAccount,
  }));
