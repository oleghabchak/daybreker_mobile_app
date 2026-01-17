import { ExerciseStatus } from '../../../enums/exercise.enum';
import { useAuthStore } from '../../../models/AuthenticationStore';
import { Logger } from '../../../services/logger';
import { AsyncResponse } from '../../../shared-module/data/types/async-response';
import { useMesocycleStore } from '../../mesocycle/stores/mesocycle-store';
import { IWorkoutSet } from '../data/interfaces/workout-set';
import { UpdateWorkoutExerciseSetStoreUseCase } from '../usecases/store/update-workout-exercise-set';

interface SetStatusUpdateOptions {
  isFirstWeek?: boolean;
  shouldReloadMesocycle?: boolean;
  retryAttempts?: number;
  debounceMs?: number;
}

interface PendingUpdate {
  id: string;
  status: ExerciseStatus;
  options: SetStatusUpdateOptions;
  timestamp: number;
  resolve: (value: AsyncResponse<IWorkoutSet>) => void;
  reject: (error: Error) => void;
}

export class SetStatusManager {
  private static instance: SetStatusManager;
  private pendingUpdates = new Map<string, PendingUpdate>();
  private debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private isReloading = false;
  private reloadQueue: string[] = [];

  // Configuration
  private readonly DEFAULT_DEBOUNCE_MS = 300;
  private readonly DEFAULT_RETRY_ATTEMPTS = 3;
  private readonly RELOAD_DEBOUNCE_MS = 1000;
  private readonly MAX_CONCURRENT_UPDATES = 5;

  private constructor() {}

  static getInstance(): SetStatusManager {
    if (!SetStatusManager.instance) {
      SetStatusManager.instance = new SetStatusManager();
    }
    return SetStatusManager.instance;
  }

  /**
   * Updates the status of a workout set with optimized performance and error handling
   */
  async updateSetStatus(
    id: string,
    status: ExerciseStatus,
    options: SetStatusUpdateOptions = {}
  ): Promise<AsyncResponse<IWorkoutSet>> {
    const {
      isFirstWeek = false,
      shouldReloadMesocycle = false,
      retryAttempts = this.DEFAULT_RETRY_ATTEMPTS,
      debounceMs = this.DEFAULT_DEBOUNCE_MS,
    } = options;

    Logger.debug('[SetStatusManager] updateSetStatus called', {
      id,
      status,
      isFirstWeek,
      shouldReloadMesocycle,
    });

    // Check if there's already a pending update for this set
    const existingUpdate = this.pendingUpdates.get(id);
    if (existingUpdate) {
      Logger.debug('[SetStatusManager] Cancelling previous update for set', {
        id,
      });
      const existingTimer = this.debounceTimers.get(id);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }
      existingUpdate.reject(new Error('Update cancelled by newer request'));
    }

    return new Promise((resolve, reject) => {
      const pendingUpdate: PendingUpdate = {
        id,
        status,
        options: {
          isFirstWeek,
          shouldReloadMesocycle,
          retryAttempts,
          debounceMs,
        },
        timestamp: Date.now(),
        resolve,
        reject,
      };

      this.pendingUpdates.set(id, pendingUpdate);

      // Debounce the update
      const timer = setTimeout(() => {
        this.executeUpdate(pendingUpdate);
      }, debounceMs);

      this.debounceTimers.set(id, timer);
    });
  }

  /**
   * Executes the actual status update with retry logic
   */
  private async executeUpdate(pendingUpdate: PendingUpdate): Promise<void> {
    const { id, status, options } = pendingUpdate;
    const { retryAttempts, isFirstWeek, shouldReloadMesocycle } = options;

    try {
      // Clear the debounce timer
      this.debounceTimers.delete(id);

      // Execute the status update
      const result = await this.performStatusUpdate(id, status, retryAttempts!);

      if (result.status === 'ok') {
        Logger.success('[SetStatusManager] Status update successful', {
          id,
          status,
        });

        // Handle mesocycle reload if needed
        if (isFirstWeek || shouldReloadMesocycle) {
          await this.scheduleMesocycleReload();
        }

        pendingUpdate.resolve(result);
      } else {
        Logger.error('[SetStatusManager] Status update failed', {
          id,
          status,
          error: result.error,
        });
        pendingUpdate.reject(result.error);
      }
    } catch (error) {
      Logger.error('[SetStatusManager] Unexpected error during status update', {
        id,
        status,
        error,
      });
      pendingUpdate.reject(error as Error);
    } finally {
      this.pendingUpdates.delete(id);
    }
  }

  /**
   * Performs the actual status update with retry logic
   */
  private async performStatusUpdate(
    id: string,
    status: ExerciseStatus,
    retryAttempts: number
  ): Promise<AsyncResponse<IWorkoutSet>> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        Logger.debug('[SetStatusManager] Attempting status update', {
          id,
          status,
          attempt,
          maxAttempts: retryAttempts,
        });

        const result = await UpdateWorkoutExerciseSetStoreUseCase.execute(id, {
          status,
        });

        if (result.status === 'ok') {
          return result;
        }

        lastError = result.error;

        // Don't retry on certain types of errors
        if (this.isNonRetryableError(result.error)) {
          Logger.warn('[SetStatusManager] Non-retryable error encountered', {
            id,
            status,
            error: result.error.message,
          });
          break;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < retryAttempts) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          Logger.debug('[SetStatusManager] Retrying after delay', {
            delay,
            attempt,
          });
          await this.delay(delay);
        }
      } catch (error) {
        lastError = error as Error;
        Logger.error(
          '[SetStatusManager] Exception during status update attempt',
          {
            id,
            status,
            attempt,
            error,
          }
        );

        if (attempt < retryAttempts) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await this.delay(delay);
        }
      }
    }

    return {
      status: 'error',
      error:
        lastError || new Error('Status update failed after all retry attempts'),
    };
  }

  /**
   * Schedules a mesocycle reload with debouncing to prevent multiple rapid reloads
   */
  private async scheduleMesocycleReload(): Promise<void> {
    const authState = useAuthStore.getState();
    const userId = authState.user?.id;

    if (!userId) {
      Logger.warn('[SetStatusManager] Cannot reload mesocycle: no user ID');
      return;
    }

    // Add to reload queue
    if (!this.reloadQueue.includes(userId)) {
      this.reloadQueue.push(userId);
    }

    // If already reloading, just return
    if (this.isReloading) {
      Logger.debug('[SetStatusManager] Mesocycle reload already in progress');
      return;
    }

    // Start reload process
    this.isReloading = true;

    try {
      // Wait for the debounce period
      await this.delay(this.RELOAD_DEBOUNCE_MS);

      // Process all queued reloads
      const uniqueUserIds = [...new Set(this.reloadQueue)];
      this.reloadQueue = [];

      Logger.debug('[SetStatusManager] Starting mesocycle reload', {
        userIds: uniqueUserIds,
      });

      const mesocycleState = useMesocycleStore.getState();

      // Reload for the current user (most common case)
      const currentUserId = useAuthStore.getState().user?.id;
      if (currentUserId) {
        await mesocycleState.loadComplexMesocycleData(currentUserId);
        Logger.success('[SetStatusManager] Mesocycle reload completed', {
          userId: currentUserId,
        });
      }
    } catch (error) {
      Logger.error('[SetStatusManager] Mesocycle reload failed', { error });
    } finally {
      this.isReloading = false;
    }
  }

  /**
   * Determines if an error should not be retried
   */
  private isNonRetryableError(error: Error): boolean {
    const nonRetryableMessages = [
      'not found',
      'invalid',
      'unauthorized',
      'forbidden',
      'validation',
    ];

    const errorMessage = error.message.toLowerCase();
    return nonRetryableMessages.some(msg => errorMessage.includes(msg));
  }

  /**
   * Utility method to create a delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cancels all pending updates (useful for cleanup)
   */
  cancelAllPendingUpdates(): void {
    Logger.debug('[SetStatusManager] Cancelling all pending updates', {
      count: this.pendingUpdates.size,
    });

    // Clear all timers
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();

    // Reject all pending updates
    this.pendingUpdates.forEach(update => {
      update.reject(new Error('Update cancelled'));
    });
    this.pendingUpdates.clear();
  }

  /**
   * Gets the current status of pending updates
   */
  getPendingUpdatesStatus(): {
    pendingCount: number;
    isReloading: boolean;
    reloadQueueSize: number;
  } {
    return {
      pendingCount: this.pendingUpdates.size,
      isReloading: this.isReloading,
      reloadQueueSize: this.reloadQueue.length,
    };
  }
}
