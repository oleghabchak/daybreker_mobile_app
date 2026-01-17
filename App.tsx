import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';

import { CreateMesocycleIntake, TooltipProvider } from './src/components';
import { PersistentProfile } from './src/components/bottomSheets/CreatePersistentProfile';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { ReleaseNotesModal } from './src/components/ReleaseNotesModal';
import { configureGoogleSignIn } from './src/config/googleSignIn';
import { registerTerraDeepLinkHandler } from './src/config/terraConnectDeepLink';
import { TerraProvider } from './src/context/TerraContext';
import { useVersionCheck } from './src/hooks/useVersionCheck';
import { supabase } from './src/lib/supabase';
import { useAppStore } from './src/models/AppStore';
import { useAuthStore } from './src/models/AuthenticationStore';
import { AppNavigator } from './src/navigators';

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const { getCurrentUser, setLoading } = useAuthStore();

  const { showCreateMesocycle, showPersistentProfile } = useAppStore();

  // Version check for release notes
  const {
    shouldShowReleaseNotes,
    releaseNotes,
    markVersionAsShown,
    dismissReleaseNotes,
  } = useVersionCheck();

  const [fontsLoaded] = useFonts({
    'GlacialIndifference-Bold': require('./assets/fonts/GlacialIndifference-Bold.ttf'),
    'GlacialIndifference-Regular': require('./assets/fonts/GlacialIndifference-Regular.ttf'),
    'GlacialIndifference-Italic': require('./assets/fonts/GlacialIndifference-Italic.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Configure Google Sign-In early in app lifecycle (native only)
        if (Platform.OS !== 'web') {
          configureGoogleSignIn();
        }

        // Initialize authentication store
        setLoading(true);

        // Check for existing session using Zustand store
        await getCurrentUser();

        // Check if onboarding is complete for existing users
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', session.user.id)
            .single();
        }
      } catch (e) {
        console.warn('App initialization error:', e);
      } finally {
        setLoading(false);
        setIsReady(true);
      }
    }

    prepare();
  }, [getCurrentUser, setLoading]);

  // Handle Terra deep links globally
  useEffect(() => {
    const unsubscribe = registerTerraDeepLinkHandler();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (fontsLoaded && isReady) {
      // Hide splash screen after a short delay to ensure navigation is ready
      if (Platform.OS !== 'web') {
        setTimeout(() => {
          SplashScreen.hideAsync();
        }, 100);
      }
    }
  }, [fontsLoaded, isReady]);

  if (!fontsLoaded || !isReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <TerraProvider>
            <TooltipProvider>
              <KeyboardProvider>
                <AppNavigator
                  hideSplashScreen={() => SplashScreen.hideAsync()}
                />
              </KeyboardProvider>
            </TooltipProvider>
          </TerraProvider>
          <Toast />

          {/* Global Sheets */}
          <CreateMesocycleIntake
            isVisible={showCreateMesocycle}
            // onClose={() => setShowCreateMesocycle(false)}
          />
          <PersistentProfile
            isVisible={showPersistentProfile}
            // onClose={() => setShowPersistentProfile(false)}
          />

          {/* Release Notes Modal */}
          <ReleaseNotesModal
            isVisible={shouldShowReleaseNotes}
            releaseNotes={releaseNotes}
            onClose={dismissReleaseNotes}
            onMarkAsShown={markVersionAsShown}
          />

          {/* <CreateExercise
            isVisible={showCreateExercise}
            // onClose={() => setShowCreateExercise(false)}
          /> */}
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
