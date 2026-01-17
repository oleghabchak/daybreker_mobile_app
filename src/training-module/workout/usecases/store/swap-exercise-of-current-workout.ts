import { Logger } from '../../../../services/logger';
import { AsyncResponse } from '../../../../shared-module/data/types/async-response';
import { useMesocycleStore } from '../../../mesocycle/stores/mesocycle-store';
import { WorkoutExerciseRepository } from '../../repositories/workout-exercise-repository';

export class SwapExerciseOfCurrentWorkoutStoreUseCase {
  static async execute(
    userId: string,
    workoutExerciseId: string,
    newExerciseId: string
  ): Promise<AsyncResponse<boolean>> {
    try {
      Logger.debug(
        'SwapExerciseOfCurrentWorkoutStoreUseCase.execute called with:',
        {
          userId,
          workoutExerciseId,
          newExerciseId,
        }
      );

      // Update the exercise_id in the workout_exercises table
      const updateResult = await WorkoutExerciseRepository.updateExerciseId(
        workoutExerciseId,
        newExerciseId
      );

      if (updateResult.status === 'error') {
        return updateResult;
      }

      // Reload the mesocycle data to reflect the changes
      const mesocycleState = useMesocycleStore.getState();
      await mesocycleState.loadComplexMesocycleData(userId);

      return {
        status: 'ok',
        data: true,
      };
    } catch (error) {
      Logger.error('Error in SwapExerciseOfCurrentWorkoutStoreUseCase:', error);
      return {
        status: 'error',
        error: error as Error,
      };
    }
  }
}
