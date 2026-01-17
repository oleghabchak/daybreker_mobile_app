import { useCallback, useEffect, useRef } from 'react';

import { ExerciseStatus } from '../../../enums/exercise.enum';
import { AsyncResponse } from '../../../shared-module/data/types/async-response';
import { IWorkoutSet } from '../data/interfaces/workout-set';
import { SetStatusManager } from '../managers/set-status-manager';

interface UseSetStatusManagerOptions {
  isFirstWeek?: boolean;
  shouldReloadMesocycle?: boolean;
  retryAttempts?: number;
  debounceMs?: number;
}

export const useSetStatusManager = (
  options: UseSetStatusManagerOptions = {}
) => {
  const managerRef = useRef<SetStatusManager | null>(null);
  const isMountedRef = useRef(true);

  // Initialize the manager
  useEffect(() => {
    managerRef.current = SetStatusManager.getInstance();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (managerRef.current && !isMountedRef.current) {
        managerRef.current.cancelAllPendingUpdates();
      }
    };
  }, []);

  const updateSetStatus = useCallback(
    async (
      id: string,
      status: ExerciseStatus,
      overrideOptions?: Partial<UseSetStatusManagerOptions>
    ): Promise<AsyncResponse<IWorkoutSet>> => {
      if (!managerRef.current) {
        return {
          status: 'error',
          error: new Error('SetStatusManager not initialized'),
        };
      }

      const finalOptions = { ...options, ...overrideOptions };

      try {
        const result = await managerRef.current.updateSetStatus(
          id,
          status,
          finalOptions
        );

        if (!isMountedRef.current) {
          // Component unmounted during the operation
          return {
            status: 'error',
            error: new Error('Component unmounted during operation'),
          };
        }

        return result;
      } catch (error) {
        return {
          status: 'error',
          error: error instanceof Error ? error : new Error('Unknown error'),
        };
      }
    },
    [options]
  );

  const getStatus = useCallback(() => {
    if (!managerRef.current) {
      return {
        pendingCount: 0,
        isReloading: false,
        reloadQueueSize: 0,
      };
    }

    return managerRef.current.getPendingUpdatesStatus();
  }, []);

  const cancelAllUpdates = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.cancelAllPendingUpdates();
    }
  }, []);

  return {
    updateSetStatus,
    getStatus,
    cancelAllUpdates,
  };
};
