import { useCallback } from 'react';

import { useAppStore } from '../models/AppStore';

/**
 * Simple hook for managing sheet visibility
 * Provides easy access to sheet state and actions
 */
export const useAppState = () => {
  const {
    showCreateMesocycle,
    showCreateExercise,
    showPersistentProfile,
    setShowCreateMesocycle,
    setShowCreateExercise,
    setShowPersistentProfile,
  } = useAppStore();

  const hideCreateMesocycleSheet = useCallback(
    (isVisible: boolean) => {
      setShowCreateMesocycle(isVisible);
    },
    [setShowCreateMesocycle]
  );

  const hideCreateExerciseSheet = useCallback(
    (isVisible: boolean) => {
      setShowCreateExercise(isVisible);
    },
    [setShowCreateExercise]
  );

  const hidePersistentProfileSheet = useCallback(
    (isVisible: boolean) => {
      setShowPersistentProfile(isVisible);
    },
    [setShowPersistentProfile]
  );

  const clearAllSheets = useCallback(() => {
    setShowCreateMesocycle(false);
    setShowCreateExercise(false);
    setShowPersistentProfile(false);
  }, [setShowCreateMesocycle, setShowCreateExercise, setShowPersistentProfile]);

  return {
    // Sheet Visibility State
    showCreateExercise,
    showCreateMesocycle,
    showPersistentProfile,

    // Setter Actions
    setShowCreateExercise,
    setShowPersistentProfile,
    setShowCreateMesocycle,

    // Hide Actions
    hideCreateExerciseSheet,
    hideCreateMesocycleSheet,
    hidePersistentProfileSheet,

    clearAllSheets,
  };
};
