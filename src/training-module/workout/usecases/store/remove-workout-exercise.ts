import { AsyncResponse } from '../../../../shared-module/data/types/async-response';
import { getExerciseCompletionStats } from '../../../../utils/helpers';
import { useMesocycleStore } from '../../../mesocycle/stores/mesocycle-store';
import { WorkoutExerciseRepository } from '../../repositories/workout-exercise-repository';
import { useWorkoutStore } from '../../stores/workout-store';

export class RemoveWorkoutExerciseStoreUseCase {
  static async execute(
    userId: string,
    workoutExerciseId?: string
  ): Promise<AsyncResponse<boolean>> {
    try {
      const mesocycleState = useMesocycleStore.getState();
      const workoutState = useWorkoutStore.getState();

      const deleteWorkoutExerciseRequest =
        await WorkoutExerciseRepository.delete(workoutExerciseId!);

      if (deleteWorkoutExerciseRequest.status === 'error') {
        console.error(
          '❌ Error deleting workout exercise:',
          deleteWorkoutExerciseRequest.error
        );
        return {
          status: 'error',
          error: new Error(
            deleteWorkoutExerciseRequest.error.message ||
              'Failed to delete workout exercise'
          ),
        };
      }

      // Optimistically remove exercise locally from current workout and workouts list
      const currentWorkout = workoutState.currentWorkout;
      if (currentWorkout) {
        const updatedExercises = (currentWorkout.exercises || [])
          .filter(ex => ex.workout_exercise_id !== workoutExerciseId)
          .sort((a, b) => a.order_index - b.order_index)
          .map((ex, index) => ({ ...ex, order_index: index + 1 }));

        const updatedWorkout = {
          ...currentWorkout,
          exercises: updatedExercises,
        };

        // Update current workout
        workoutState.setCurrentWorkout(updatedWorkout);

        // Update workouts array if present
        const existingWorkouts = workoutState.workouts || [];
        if (Array.isArray(existingWorkouts) && existingWorkouts.length > 0) {
          const updatedWorkouts = existingWorkouts.map(w =>
            w.id === updatedWorkout.id ? updatedWorkout : w
          );
          workoutState.setWorkouts(updatedWorkouts);
        }

        // Recompute and update workout stats
        const stats = getExerciseCompletionStats(updatedExercises);
        workoutState.setWorkoutStats(stats);
      }

      // Reload mesocycle in background to stay consistent with server state
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
