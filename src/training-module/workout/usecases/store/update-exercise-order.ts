import { Logger } from '../../../../services/logger';
import { AsyncResponse } from '../../../../shared-module/data/types/async-response';
import { useMesocycleStore } from '../../../mesocycle/stores/mesocycle-store';
import { WorkoutExerciseRepository } from '../../repositories/workout-exercise-repository';

export class UpdateExerciseOrderStoreUseCase {
  static async execute(
    userId: string,
    exercises: {
      workout_exercise_id: string;
      order_index: number;
    }[]
  ): Promise<AsyncResponse<boolean>> {
    try {
      const updatePromises = exercises.map((exercise, index) =>
        WorkoutExerciseRepository.updateOrderIndex(
          exercise.workout_exercise_id,
          index + 1
        )
      );

      const results = await Promise.all(updatePromises);

      const hasErrors = results.some(result => result.status === 'error');
      if (hasErrors) {
        const errors = results.filter(result => result.status === 'error');
        Logger.error('Some exercise order updates failed:', errors);
        return {
          status: 'error',
          error: new Error('Failed to update some exercise orders'),
        };
      }

      const mesocycleState = useMesocycleStore.getState();
      await mesocycleState.loadComplexMesocycleData(userId);

      Logger.debug('Exercise order updated successfully');
      return {
        status: 'ok',
        data: true,
      };
    } catch (error) {
      Logger.error('Error in UpdateExerciseOrderStoreUseCase:', error);
      return {
        status: 'error',
        error: error as Error,
      };
    }
  }
}
