import { AsyncResponse } from '../../../../shared-module/data/types/async-response';
import { useMesocycleStore } from '../../../mesocycle/stores/mesocycle-store';
import { WorkoutRepository } from '../../repositories/workout-repository';

export class CompleteWorkoutStoreUseCase {
  static async execute(
    userId: string,
    workoutId: string
  ): Promise<AsyncResponse<boolean>> {
    try {
      const mesocycleState = useMesocycleStore.getState();

      const completeWorkoutRequest =
        await WorkoutRepository.complete(workoutId);

      if (completeWorkoutRequest.status === 'error') {
        return completeWorkoutRequest;
      }

      await mesocycleState.loadComplexMesocycleData(userId);

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
