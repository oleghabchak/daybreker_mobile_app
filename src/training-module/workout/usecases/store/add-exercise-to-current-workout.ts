
import { Logger } from '../../../../services/logger';
import { AsyncResponse } from '../../../../shared-module/data/types/async-response';
import { useMesocycleStore } from '../../../mesocycle/stores/mesocycle-store';
import { useWorkoutStore } from '../../stores/workout-store';
import { CreateWorkoutExerciseWithSetsUseCase } from '../domain/create-workout-exercise-with-sets';

export class AddExerciseToCurrentWorkoutStoreUseCase {
  static async execute(
    userId: string,
    exerciseId: string
  ): Promise<AsyncResponse<boolean>> {
    try {
      const mesocycleState = useMesocycleStore.getState();
      const workoutState = useWorkoutStore.getState();
      const workoutId = workoutState.currentWorkout?.id;

      if (!workoutId) {
        return {
          status: 'error',
          error: new Error('Workout id not found'),
        };
      }

      const createExerciseRequest =
        await CreateWorkoutExerciseWithSetsUseCase.execute({
          workoutId,
          exerciseId,
          defaultSets: 3,
        });

      if (createExerciseRequest.status === 'error') {
        return createExerciseRequest;
      }
      Logger.debug('Exercise created', workoutId, exerciseId);
      // await mesocycleState.loadComplexMesocycleData(userId);

      return {
        status: 'ok',
        data: true,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error as Error,
      };
    }
  }
}
