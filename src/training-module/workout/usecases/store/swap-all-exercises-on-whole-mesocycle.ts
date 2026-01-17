import { Logger } from '../../../../services/logger';
import { AsyncResponse } from '../../../../shared-module/data/types/async-response';
import { useMesocycleStore } from '../../../mesocycle/stores/mesocycle-store';
import { WorkoutExerciseRepository } from '../../repositories/workout-exercise-repository';

export class SwapAllExercisesOnWholeMesocycleStoreUseCase {
  static async execute(
    userId: string,
    oldExerciseId: string,
    newExerciseId: string
  ): Promise<AsyncResponse<boolean>> {
    try {
      Logger.debug(
        'SwapAllExercisesOnWholeMesocycleStoreUseCase.execute called with:',
        {
          userId,
          oldExerciseId,
          newExerciseId,
        }
      );

      // Swap all workout exercises with the old exercise_id to the new exercise_id across all workouts
      const swapResult = await WorkoutExerciseRepository.swapExerciseId(
        oldExerciseId,
        newExerciseId
      );

      if (swapResult.status === 'error') {
        Logger.error(
          'Failed to swap exercises in mesocycle:',
          swapResult.error
        );
        return {
          status: 'error',
          error: new Error('Failed to swap exercises in mesocycle'),
        };
      }

      // Reload the mesocycle data to reflect the changes
      const mesocycleState = useMesocycleStore.getState();
      await mesocycleState.loadComplexMesocycleData(userId);

      Logger.debug(
        `Successfully swapped exercise ${oldExerciseId} to ${newExerciseId} in all workouts`
      );
      return {
        status: 'ok',
        data: true,
      };
    } catch (error) {
      Logger.error(
        'Error in SwapAllExercisesOnWholeMesocycleStoreUseCase:',
        error
      );
      return {
        status: 'error',
        error: error as Error,
      };
    }
  }
}
