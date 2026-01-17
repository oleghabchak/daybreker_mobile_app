import { AsyncResponse } from '../../../../shared-module/data/types/async-response';
import { useMesocycleStore } from '../../../mesocycle/stores/mesocycle-store';
import { WorkoutSetRepository } from '../../repositories/workout-set-repository';
import { useWorkoutStore } from '../../stores/workout-store';

export class DeleteWorkoutExerciseSetStoreUseCase {
  static async execute(
    userId: string,
    workoutExerciseId: string
  ): Promise<AsyncResponse<boolean>> {
    try {
      const mesocycleState = useMesocycleStore.getState();

      const deleteWorkoutSetRequest =
        await WorkoutSetRepository.delete(workoutExerciseId);

      if (deleteWorkoutSetRequest.status === 'error') {
        return deleteWorkoutSetRequest;
      }

      const { currentExercise, workoutStats } = useWorkoutStore.getState();

      if (currentExercise) {
        const filteredSets = currentExercise?.sets.filter(
          set => set.workout_exercise_id !== workoutExerciseId
        );

        currentExercise.sets = filteredSets;

        useWorkoutStore.setState({
          isLoading: false,
          workoutStats: {
            ...workoutStats,
            completedSets: workoutStats.completedSets - 1,
          },
        });
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
