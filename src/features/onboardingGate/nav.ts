/**
 * Small helpers to route to Personalization Hub and read completion state.
 */
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';

import { useTrainingConfig } from '../../hooks/useTrainingConfig';

export function useGoToPersonalizationHub() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  return React.useCallback(() => {
    // Navigate to MoreStack tab, then to UserProfile screen within it
    nav.navigate('MoreStack', {
      screen: 'UserProfile',
      params: { source: 'gate', redirectTo: route?.name },
    });
  }, [nav, route?.name]);
}

/**
 * Check if personalization hub is complete.
 * It's complete if the user has a training_profile_configuration record.
 */
export function useIsTrainingConfigComplete(): boolean {
  const { config, loading } = useTrainingConfig();

  // If still loading, assume incomplete to prevent flicker
  if (loading) return false;

  // Config exists = complete
  return config !== null;
}
