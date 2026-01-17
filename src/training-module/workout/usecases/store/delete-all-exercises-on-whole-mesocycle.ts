import { Logger } from '../../../../services/logger';
import { AsyncResponse } from '../../../../shared-module/data/types/async-response';
import { useMesocycleStore } from '../../../mesocycle/stores/mesocycle-store';
import { WorkoutExerciseRepository } from '../../repositories/workout-exercise-repository';

export class DeleteExerciseFromWholeMesocycleStoreUseCase {
  static async execute(
    userId: string,
    exerciseId: string
  ): Promise<AsyncResponse<boolean>> {
    try {
      Logger.debug(
        'DeleteExerciseFromWholeMesocycleStoreUseCase.execute called with:',
        {
          userId,
          exerciseId,
        }
      );

      // Delete all workout exercises with the specified exercise_id from all workouts
      const deleteResult =
        await WorkoutExerciseRepository.deleteByExerciseId(exerciseId);

      if (deleteResult.status === 'error') {
        Logger.error(
          'Failed to delete exercises from mesocycle:',
          deleteResult.error
        );
        return {
          status: 'error',
          error: new Error('Failed to delete exercises from mesocycle'),
        };
      }

      // Reload the mesocycle data to reflect the changes
      const mesocycleState = useMesocycleStore.getState();
      await mesocycleState.loadComplexMesocycleData(userId);

      Logger.debug(
        `Successfully deleted exercise ${exerciseId} from all workouts in mesocycle`
      );
      return {
        status: 'ok',
        data: true,
      };
    } catch (error) {
      Logger.error(
        'Error in DeleteExerciseFromWholeMesocycleStoreUseCase:',
        error
      );
      return {
        status: 'error',
        error: error as Error,
      };
    }
  }
}
